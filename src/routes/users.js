const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
} = require("../models/follow");
const { findUsersByName, getUserProfile } = require("../models/user");

const router = express.Router();

/**
 * User-related routes
 * TODO: Implement user routes when follow functionality is added
 */

// TODO: POST /api/users/follow - Follow a user
// TODO: DELETE /api/users/unfollow - Unfollow a user
// TODO: GET /api/users/following - Get users that current user follows
// TODO: GET /api/users/followers - Get users that follow current user
// TODO: GET /api/users/stats - Get follow stats for current user
// TODO: POST /api/users/search - Find users by name

/**
 * User-related routes
 */

// POST /api/users/follow - Follow a user
router.post("/follow", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.body; // user to follow
    if (!user_id) return res.status(400).json({ error: "user_id is required" });
    const result = await followUser(req.user.id, user_id);
    if (!result) return res.status(400).json({ error: "Cannot follow user" });
    res.json({ message: "Followed successfully", follow: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to follow user" });
  }
});

// DELETE /api/users/unfollow - Unfollow a user
router.delete("/unfollow", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.body; // user to unfollow
    if (!user_id) return res.status(400).json({ error: "user_id is required" });
    const result = await unfollowUser(req.user.id, user_id);
    if (!result) return res.status(400).json({ error: "Not following this user" });
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to unfollow user" });
  }
});

// GET /api/users/following - Get users that current user follows
router.get("/following", authenticateToken, async (req, res) => {
  try {
    const following = await getFollowing(req.user.id);
    res.json({ following });
  } catch (err) {
    res.status(500).json({ error: "Failed to get following list" });
  }
});

// GET /api/users/followers - Get users that follow current user
router.get("/followers", authenticateToken, async (req, res) => {
  try {
    const followers = await getFollowers(req.user.id);
    res.json({ followers });
  } catch (err) {
    res.status(500).json({ error: "Failed to get followers list" });
  }
});

// GET /api/users/stats - Get follow stats for current user
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const stats = await getFollowCounts(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to get follow stats" });
  }
});

// POST /api/users/search - Find users by name
router.post("/search", authenticateToken, async (req, res) => {
  try {
    const { search, limit, offset } = req.body;
    if (!search) return res.status(400).json({ error: "search is required" });
    const users = await findUsersByName(search, limit || 20, offset || 0);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Failed to search users" });
  }
});

module.exports = router;