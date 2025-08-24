const { query } = require("../utils/database");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
}) => {
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, NOW(), false)
     RETURNING id, user_id, content, media_url, comments_enabled, created_at`,
    [user_id, content, media_url, comments_enabled],
  );

  return result.rows[0];
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1 AND p.is_deleted = FALSE`,
    [postId],
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1 AND p.is_deleted = FALSE
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return result.rows;
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
// is_deleted = false -> true by me
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = true WHERE id = $1 AND user_id = $2",
    [postId, userId],
  );

  return result.rowCount > 0;
};

// TODO: Implement getFeedPosts function that returns posts from followed users
// This should include pagination and ordering by creation date

// TODO: Implement updatePost function for editing posts

// TODO: Implement searchPosts function for content search

/**
 * Get feed posts for a user (posts from followed users and self)
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getFeedPosts = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name,
      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.is_deleted = false
       AND (
         p.user_id = $1
         OR p.user_id IN (
           SELECT following_id FROM follows WHERE follower_id = $1
         )
       )
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

/**
 * Update a post (content, media_url, comments_enabled)
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated post or null
 */
const updatePost = async (postId, userId, updates) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.content) {
    fields.push(`content = $${idx++}`);
    values.push(updates.content);
  }
  if (updates.media_url) {
    fields.push(`media_url = $${idx++}`);
    values.push(updates.media_url);
  }
  if (typeof updates.comments_enabled === "boolean") {
    fields.push(`comments_enabled = $${idx++}`);
    values.push(updates.comments_enabled);
  }
  if (fields.length === 0) return null;

  values.push(postId, userId);

  const result = await query(
    `UPDATE posts SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${idx++} AND user_id = $${idx}
     RETURNING id, user_id, content, media_url, comments_enabled, created_at, updated_at`,
    values
  );
  return result.rows[0] || null;
};

/**
 * Search posts by content or media_url (case-insensitive, paginated)
 * @param {string} search - Search term
 * @param {number} limit - Max results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const searchPosts = async (search, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.is_deleted = false
       AND (p.content ILIKE $1 OR p.media_url ILIKE $1)
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );
  return result.rows;
};


module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
  updatePost,
  searchPosts,
};