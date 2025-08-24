const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 * TODO: Implement this model for the comment functionality
 */

// TODO: Implement createComment function
// TODO: Implement updateComment function
// TODO: Implement deleteComment function
// TODO: Implement getPostComments function
// TODO: Implement getCommentById function

/**
 * Create a new comment
 * @param {number} userId
 * @param {number} postId
 * @param {string} content
 * @returns {Promise<Object>} Created comment
 */
const createComment = async (userId, postId, content) => {
    const result = await query(
        `INSERT INTO comments (user_id, post_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, post_id, content, is_deleted, created_at, updated_at`,
        [userId, postId, content]
    );
    return result.rows[0];
};

/**
 * Update a comment (only by the owner, if not deleted)
 * @param {number} commentId
 * @param {number} userId
 * @param {string} newContent
 * @returns {Promise<Object|null>} Updated comment or null
 */
const updateComment = async (commentId, userId, newContent) => {
    const result = await query(
        `UPDATE comments
         SET content = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE
         RETURNING id, user_id, post_id, content, is_deleted, created_at, updated_at`,
        [newContent, commentId, userId]
    );
    return result.rows[0] || null;
};

/**
 * Soft delete a comment (only by the owner)
 * @param {number} commentId
 * @param {number} userId
 * @returns {Promise<boolean>} True if deleted
 */
const deleteComment = async (commentId, userId) => {
    const result = await query(
        `UPDATE comments
         SET is_deleted = TRUE, updated_at = NOW()
         WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
        [commentId, userId]
    );
    return result.rowCount > 0;
};

/**
 * Get all comments for a post (not deleted, newest first)
 * @param {number} postId
 * @returns {Promise<Array>} Array of comments
 */
const getPostComments = async (postId) => {
    const result = await query(
        `SELECT id, user_id, post_id, content, is_deleted, created_at, updated_at
         FROM comments
         WHERE post_id = $1 AND is_deleted = FALSE
         ORDER BY created_at DESC`,
        [postId]
    );
    return result.rows;
};

/**
 * Get a comment by ID
 * @param {number} commentId
 * @returns {Promise<Object|null>} Comment or null
 */
const getCommentById = async (commentId) => {
    const result = await query(
        `SELECT id, user_id, post_id, content, is_deleted, created_at, updated_at
         FROM comments
         WHERE id = $1`,
        [commentId]
    );
    return result.rows[0] || null;
};

module.exports = {
    createComment,
    updateComment,
    deleteComment,
    getPostComments,
    getCommentById,
};