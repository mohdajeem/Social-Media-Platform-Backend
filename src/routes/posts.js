const express = require("express");
const { validateRequest, createPostSchema } = require("../utils/validation");
const {
    create,
    getById,
    getUserPosts,
    getMyPosts,
    remove,
    getFeed,     // <-- add this
    update,      // <-- add this
    search,      // <-- add this if you want search
} = require("../controllers/posts");

const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Posts routes
 */

// GET /api/posts/my - Get current user's posts
router.get("/my", authenticateToken, getMyPosts);


// GET /api/posts/user/:user_id - Get posts by a specific user
router.get("/user/:user_id", optionalAuth, getUserPosts);

// GET /api/posts/feed - Get posts from followed users and self
router.get("/feed", authenticateToken, getFeed);

// (Optional) GET /api/posts/search - Search posts by content/media_url
router.get("/search", optionalAuth, search);

// POST /api/posts - Create a new post
router.post("/", authenticateToken, validateRequest(createPostSchema), create);



// DELETE /api/posts/:post_id - Delete a post
router.delete("/:post_id", authenticateToken, remove);

// PUT /api/posts/:post_id - Update a post
router.put("/:post_id", authenticateToken, update);

// GET /api/posts/:post_id - Get a single post by ID
router.get("/:post_id", optionalAuth, getById);


module.exports = router;