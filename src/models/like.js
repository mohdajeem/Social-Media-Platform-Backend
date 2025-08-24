const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 */

/**
 * Like a post
 * @param {number} userId
 * @param {number} postId
 * @returns {Promise<Object>} The like record
 */
const likePost = async (userId, postId) => {
  const result = await query(
    `INSERT INTO likes (user_id, post_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, post_id) DO NOTHING
     RETURNING *`,
    [userId, postId]
  );
  return result.rows[0] || null;
};

/**
 * Unlike a post
 * @param {number} userId
 * @param {number} postId
 * @returns {Promise<boolean>} True if a like was removed
 */
const unlikePost = async (userId, postId) => {
  const result = await query(
    `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );
  return result.rowCount > 0;
};

/**
 * Get all users who liked a post
 * @param {number} postId
 * @returns {Promise<Array>} Array of user IDs
 */
const getPostLikes = async (postId) => {
  const result = await query(
    `SELECT user_id FROM likes WHERE post_id = $1`,
    [postId]
  );
  return result.rows.map(row => row.user_id);
};

/**
 * Get all posts liked by a user
 * @param {number} userId
 * @returns {Promise<Array>} Array of post IDs
 */
const getUserLikes = async (userId) => {
  const result = await query(
    `SELECT post_id FROM likes WHERE user_id = $1`,
    [userId]
  );
  return result.rows.map(row => row.post_id);
};

/**
 * Check if a user has liked a post
 * @param {number} userId
 * @param {number} postId
 * @returns {Promise<boolean>}
 */
const hasUserLikedPost = async (userId, postId) => {
  const result = await query(
    `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );
  return result.rowCount > 0;
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
};