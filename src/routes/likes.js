const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
    likePost,
    unlikePost,
    getPostLikes,
    getUserLikes,
} = require("../controllers/likes");

const router = express.Router();

/**
 * Likes routes
 * TODO: Implement like routes when like functionality is added
 */

// TODO: POST /api/likes - Like a post
// TODO: DELETE /api/likes/:post_id - Unlike a post
// TODO: GET /api/likes/post/:post_id - Get likes for a post
// TODO: GET /api/likes/user/:user_id - Get posts liked by a user

/**
 * Likes routes
 */

// POST /api/likes - Like a post
router.post("/", authenticateToken, likePost);

// DELETE /api/likes - Unlike a post (expects postId in body)
router.delete("/", authenticateToken, unlikePost);

// GET /api/likes/post/:postId - Get users who liked a post
router.get("/post/:postId", getPostLikes);

// GET /api/likes/user - Get posts liked by the current user
router.get("/user", authenticateToken, getUserLikes);

module.exports = router;