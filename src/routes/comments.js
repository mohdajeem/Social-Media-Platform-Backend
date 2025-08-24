const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
    createComment,
    updateComment,
    deleteComment,
    getPostComments,
} = require("../controllers/comments");

const router = express.Router();

/**
 * Comments routes
 * TODO: Implement comment routes when comment functionality is added
 */

// TODO: POST /api/comments - Create a comment on a post
// TODO: PUT /api/comments/:comment_id - Update a comment
// TODO: DELETE /api/comments/:comment_id - Delete a comment
// TODO: GET /api/comments/post/:post_id - Get comments for a post

/**
 * Comments routes
 */

// POST /api/comments - Create a comment on a post
router.post("/", authenticateToken, createComment);

// PUT /api/comments/:commentId - Update a comment
router.put("/:commentId", authenticateToken, updateComment);

// DELETE /api/comments/:commentId - Delete a comment
router.delete("/:commentId", authenticateToken, deleteComment);

// GET /api/comments/post/:postId - Get comments for a post (paginated)
router.get("/post/:postId", getPostComments);

module.exports = router;