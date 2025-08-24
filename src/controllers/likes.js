// TODO: Implement likes controller
// This controller should handle:
// - Liking posts
// - Unliking posts
// - Getting likes for a post
// - Getting posts liked by a user

// TODO: Implement likePost function
// TODO: Implement unlikePost function
// TODO: Implement getPostLikes function
// TODO: Implement getUserLikes function
const {
    likePost,
    unlikePost,
    getPostLikes,
    getUserLikes,
} = require("../models/like");
const logger = require("../utils/logger");

/**
 * Like a post
 */
const likePostController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.body;
        if (!postId) {
            return res.status(400).json({ error: "postId is required" });
        }
        const like = await likePost(userId, postId);
        if (!like) {
            return res.status(400).json({ error: "Already liked or invalid post" });
        }
        res.status(201).json({ message: "Post liked", like });
    } catch (error) {
        logger.critical("Failed to like post:", error.message);
        res.status(500).json({ error: "Failed to like post" });
    }
};

/**
 * Unlike a post
 */
const unlikePostController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.body;
        if (!postId) {
            return res.status(400).json({ error: "postId is required" });
        }
        const unliked = await unlikePost(userId, postId);
        if (!unliked) {
            return res.status(400).json({ error: "You have not liked this post" });
        }
        res.json({ message: "Post unliked" });
    } catch (error) {
        logger.critical("Failed to unlike post:", error.message);
        res.status(500).json({ error: "Failed to unlike post" });
    }
};

/**
 * Get all users who liked a post
 */
const getPostLikesController = async (req, res) => {
    try {
        const { postId } = req.params;
        const users = await getPostLikes(postId);
        res.json({ users });
    } catch (error) {
        logger.critical("Failed to get post likes:", error.message);
        res.status(500).json({ error: "Failed to get post likes" });
    }
};

/**
 * Get all posts liked by a user
 */
const getUserLikesController = async (req, res) => {
    try {
        const userId = req.user.id;
        const posts = await getUserLikes(userId);
        res.json({ posts });
    } catch (error) {
        logger.critical("Failed to get user likes:", error.message);
        res.status(500).json({ error: "Failed to get user likes" });
    }
};

module.exports = {
    likePost: likePostController,
    unlikePost: unlikePostController,
    getPostLikes: getPostLikesController,
    getUserLikes: getUserLikesController,
};