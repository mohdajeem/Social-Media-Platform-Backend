const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  // changes made -> before just hashed but not stored, now -> hashed password will be store
  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name],
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */

// fix this now will not send *, but the required fields
const getUserByUsername = async (username) => {
  const result = await query("SELECT id, username, email, full_name, password_hash, created_at FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// TODO: Implement findUsersByName function for search functionality
// This should support partial name matching and pagination

// TODO: Implement getUserProfile function that includes follower/following counts

// TODO: Implement updateUserProfile function for profile updates


/**
 * Search users by (partial) name or username, with pagination
 * @param {string} search - Partial name or username
 * @param {number} limit - Max results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of user objects
 */
const findUsersByName = async (search, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT id, username, email, full_name, created_at
     FROM users
     WHERE (username ILIKE $1 OR full_name ILIKE $1) AND is_deleted = FALSE
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );
  return result.rows;
};

/**
 * Get user profile with follower/following counts
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User profile with counts
 */
const getUserProfile = async (userId) => {
  const result = await query(
    `SELECT id, username, email, full_name, created_at
     FROM users
     WHERE id = $1 AND is_deleted = FALSE`,
    [userId]
  );
  if (!result.rows[0]) return null;

  // Get follower and following counts
  const followerRes = await query(
    `SELECT COUNT(*)::int AS followers FROM follows WHERE following_id = $1`,
    [userId]
  );
  const followingRes = await query(
    `SELECT COUNT(*)::int AS following FROM follows WHERE follower_id = $1`,
    [userId]
  );

  return {
    ...result.rows[0],
    followers: followerRes.rows[0].followers,
    following: followingRes.rows[0].following,
  };
};

/**
 * Update user profile fields
 * @param {number} userId - User ID
 * @param {Object} updates - Fields to update (full_name, email, password)
 * @returns {Promise<Object|null>} Updated user object or null
 */
const updateUserProfile = async (userId, updates) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.full_name) {
    fields.push(`full_name = $${idx++}`);
    values.push(updates.full_name);
  }
  if (updates.email) {
    fields.push(`email = $${idx++}`);
    values.push(updates.email);
  }
  if (updates.password) {
    const hashed = await bcrypt.hash(updates.password, 10);
    fields.push(`password_hash = $${idx++}`);
    values.push(hashed);
  }
  if (fields.length === 0) return null;

  values.push(userId);

  const result = await query(
    `UPDATE users SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${idx}
     RETURNING id, username, email, full_name, created_at`,
    values
  );
  return result.rows[0] || null;
};


module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  findUsersByName,
  getUserProfile,
  updateUserProfile,
};
