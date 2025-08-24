// TODO: Implement comments controller
// This controller should handle:
// - Creating comments on posts
// - Editing user's own comments
// - Deleting user's own comments
// - Getting comments for a post
// - Pagination for comments

// TODO: Implement createComment function
// TODO: Implement updateComment function
// TODO: Implement deleteComment function
// TODO: Implement getPostComments function

const {
    createComment,
    updateComment,
    deleteComment,
    getPostComments,
    getCommentById,
} = require("../models/comment");
const logger = require("../utils/logger");

/**
 * Create a comment on a post
 */
const createCommentController = async (req, res) => {
    try {
        const { postId, content } = req.body;
        const userId = req.user.id;
        if (!postId || !content) {
            return res.status(400).json({ error: "postId and content are required" });
        }
        const comment = await createComment(userId, postId, content);
        res.status(201).json({ comment });
    } catch (error) {
        logger.critical("Failed to create comment:", error.message);
        res.status(500).json({ error: "Failed to create comment" });
    }
};

/**
 * Edit user's own comment
 */
const updateCommentController = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        if (!content) {
            return res.status(400).json({ error: "content is required" });
        }
        const updated = await updateComment(commentId, userId, content);
        if (!updated) {
            return res.status(404).json({ error: "Comment not found or not owned by user" });
        }
        res.json({ comment: updated });
    } catch (error) {
        logger.critical("Failed to update comment:", error.message);
        res.status(500).json({ error: "Failed to update comment" });
    }
};

/**
 * Delete user's own comment (soft delete)
 */
const deleteCommentController = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;
        const deleted = await deleteComment(commentId, userId);
        if (!deleted) {
            return res.status(404).json({ error: "Comment not found or not owned by user" });
        }
        res.json({ message: "Comment deleted" });
    } catch (error) {
        logger.critical("Failed to delete comment:", error.message);
        res.status(500).json({ error: "Failed to delete comment" });
    }
};

/**
 * Get comments for a post (paginated)
 */
const getPostCommentsController = async (req, res) => {
    try {
        const { postId } = req.params;
        const limit = parseInt(req.query.limit, 10) || 20;
        const offset = parseInt(req.query.offset, 10) || 0;
        const comments = await getPostComments(postId, limit, offset);
        res.json({ comments });
    } catch (error) {
        logger.critical("Failed to get post comments:", error.message);
        res.status(500).json({ error: "Failed to get post comments" });
    }
};

module.exports = {
    createComment: createCommentController,
    updateComment: updateCommentController,
    deleteComment: deleteCommentController,
    getPostComments: getPostCommentsController,
};
