const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 * TODO: Implement this model for the follow functionality
 */

// TODO: Implement followUser function
// TODO: Implement unfollowUser function
// TODO: Implement getFollowing function
// TODO: Implement getFollowers function
// TODO: Implement getFollowCounts function

/**
 * Follow a user
 * @param {number} followerId - The user who follows
 * @param {number} followingId - The user to be followed
 * @returns {Promise<Object|null>} The follow record or null if already following/self-follow
 */
const followUser = async (followerId, followingId) => {
  if (followerId === followingId) return null; // Prevent self-follow
  const result = await query(
    `INSERT INTO follows (follower_id, following_id)
     VALUES ($1, $2)
     ON CONFLICT (follower_id, following_id) DO NOTHING
     RETURNING *`,
    [followerId, followingId]
  );
  return result.rows[0] || null;
};

/**
 * Unfollow a user
 * @param {number} followerId
 * @param {number} followingId
 * @returns {Promise<boolean>} True if unfollowed
 */
const unfollowUser = async (followerId, followingId) => {
  const result = await query(
    `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );
  return result.rowCount > 0;
};

/**
 * Get users that a user is following
 * @param {number} userId
 * @returns {Promise<Array>} Array of user IDs
 */
const getFollowing = async (userId) => {
  const result = await query(
    `SELECT following_id FROM follows WHERE follower_id = $1`,
    [userId]
  );
  return result.rows.map(row => row.following_id);
};

/**
 * Get followers of a user
 * @param {number} userId
 * @returns {Promise<Array>} Array of user IDs
 */
const getFollowers = async (userId) => {
  const result = await query(
    `SELECT follower_id FROM follows WHERE following_id = $1`,
    [userId]
  );
  return result.rows.map(row => row.follower_id);
};

/**
 * Get follower and following counts for a user
 * @param {number} userId
 * @returns {Promise<{followers: number, following: number}>}
 */
const getFollowCounts = async (userId) => {
  const followersRes = await query(
    `SELECT COUNT(*)::int AS followers FROM follows WHERE following_id = $1`,
    [userId]
  );
  const followingRes = await query(
    `SELECT COUNT(*)::int AS following FROM follows WHERE follower_id = $1`,
    [userId]
  );
  return {
    followers: followersRes.rows[0].followers,
    following: followingRes.rows[0].following,
  };
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
};