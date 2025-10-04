const express = require('express');
const pool = require('../config/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate, createPostSchema, commentSchema } = require('../middleware/validation');
const { uploadImage, handleUploadError } = require('../middleware/upload');
const { updateUserXP, updateStreak } = require('../utils/helpers');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Get all community posts with pagination
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [posts] = await pool.execute(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.created_at, p.updated_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.title as user_title,
              CASE WHEN pl.user_id IS NOT NULL THEN true ELSE false END as is_liked
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user ? req.user.id : null, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM community_posts'
    );

    return successResponse(res, {
      posts,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'Community posts retrieved successfully');

  } catch (error) {
    console.error('Get community posts error:', error);
    return errorResponse(res, 500, 'Failed to retrieve community posts', error.message);
  }
});

// Get post by ID with comments
router.get('/posts/:id', optionalAuth, async (req, res) => {
  try {
    const postId = req.params.id;

    // Get post details
    const [posts] = await pool.execute(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.created_at, p.updated_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.title as user_title,
              CASE WHEN pl.user_id IS NOT NULL THEN true ELSE false END as is_liked
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = ?
       WHERE p.id = ?`,
      [req.user ? req.user.id : null, postId]
    );

    if (posts.length === 0) {
      return errorResponse(res, 404, 'Post not found');
    }

    const post = posts[0];

    // Get comments for this post
    const [comments] = await pool.execute(
      `SELECT c.id, c.content, c.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.title as user_title
       FROM post_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );

    const postWithComments = {
      ...post,
      comments
    };

    return successResponse(res, postWithComments, 'Post retrieved successfully');

  } catch (error) {
    console.error('Get post error:', error);
    return errorResponse(res, 500, 'Failed to retrieve post', error.message);
  }
});

// Create a new post
router.post('/posts', requireAuth, validate(createPostSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, image_url } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO community_posts (user_id, content, image_url) VALUES (?, ?, ?)',
      [userId, content, image_url]
    );

    const postId = result.insertId;

    // Get the created post with user details
    const [posts] = await pool.execute(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.title as user_title
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [postId]
    );

    // Award XP for creating a post
    await updateUserXP(userId, 5, 'community_post', postId);

    // Update streak
    await updateStreak(userId);

    return successResponse(res, posts[0], 'Post created successfully');

  } catch (error) {
    console.error('Create post error:', error);
    return errorResponse(res, 500, 'Failed to create post', error.message);
  }
});

// Upload image for post
router.post('/posts/upload-image', requireAuth, uploadImage, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'No image file uploaded');
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    return successResponse(res, { image_url: imageUrl }, 'Image uploaded successfully');

  } catch (error) {
    console.error('Upload image error:', error);
    return errorResponse(res, 500, 'Failed to upload image', error.message);
  }
});

// Like/unlike a post
router.post('/posts/:id/like', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if post exists
    const [posts] = await pool.execute(
      'SELECT id FROM community_posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return errorResponse(res, 404, 'Post not found');
    }

    // Check if user already liked this post
    const [existingLikes] = await pool.execute(
      'SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    if (existingLikes.length > 0) {
      // Unlike the post
      await pool.execute(
        'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
        [userId, postId]
      );

      // Decrease likes count
      await pool.execute(
        'UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = ?',
        [postId]
      );

      return successResponse(res, { liked: false }, 'Post unliked successfully');
    } else {
      // Like the post
      await pool.execute(
        'INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)',
        [userId, postId]
      );

      // Increase likes count
      await pool.execute(
        'UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?',
        [postId]
      );

      return successResponse(res, { liked: true }, 'Post liked successfully');
    }

  } catch (error) {
    console.error('Like post error:', error);
    return errorResponse(res, 500, 'Failed to like/unlike post', error.message);
  }
});

// Add comment to a post
router.post('/posts/:id/comments', requireAuth, validate(commentSchema), async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    // Check if post exists
    const [posts] = await pool.execute(
      'SELECT id FROM community_posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return errorResponse(res, 404, 'Post not found');
    }

    const [result] = await pool.execute(
      'INSERT INTO post_comments (user_id, post_id, content) VALUES (?, ?, ?)',
      [userId, postId, content]
    );

    const commentId = result.insertId;

    // Get the created comment with user details
    const [comments] = await pool.execute(
      `SELECT c.id, c.content, c.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.title as user_title
       FROM post_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId]
    );

    return successResponse(res, comments[0], 'Comment added successfully');

  } catch (error) {
    console.error('Add comment error:', error);
    return errorResponse(res, 500, 'Failed to add comment', error.message);
  }
});

// Get recent chats (for sidebar widget)
router.get('/recent-chats', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get recent posts with user info for the "recent chats" widget
    const [recentPosts] = await pool.execute(
      `SELECT p.id, p.content, p.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit]
    );

    return successResponse(res, recentPosts, 'Recent chats retrieved successfully');

  } catch (error) {
    console.error('Get recent chats error:', error);
    return errorResponse(res, 500, 'Failed to retrieve recent chats', error.message);
  }
});

// Get user's posts
router.get('/users/:userId/posts', optionalAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [posts] = await pool.execute(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.created_at, p.updated_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.title as user_title,
              CASE WHEN pl.user_id IS NOT NULL THEN true ELSE false END as is_liked
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = ?
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user ? req.user.id : null, userId, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM community_posts WHERE user_id = ?',
      [userId]
    );

    return successResponse(res, {
      posts,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'User posts retrieved successfully');

  } catch (error) {
    console.error('Get user posts error:', error);
    return errorResponse(res, 500, 'Failed to retrieve user posts', error.message);
  }
});

// Delete a post (only by the author)
router.delete('/posts/:id', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if post exists and belongs to user
    const [posts] = await pool.execute(
      'SELECT id FROM community_posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );

    if (posts.length === 0) {
      return errorResponse(res, 404, 'Post not found or you are not authorized to delete it');
    }

    // Delete all related data
    await pool.execute('DELETE FROM post_likes WHERE post_id = ?', [postId]);
    await pool.execute('DELETE FROM post_comments WHERE post_id = ?', [postId]);
    await pool.execute('DELETE FROM community_posts WHERE id = ?', [postId]);

    return successResponse(res, null, 'Post deleted successfully');

  } catch (error) {
    console.error('Delete post error:', error);
    return errorResponse(res, 500, 'Failed to delete post', error.message);
  }
});

// Delete a comment (only by the author)
router.delete('/comments/:id', requireAuth, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Check if comment exists and belongs to user
    const [comments] = await pool.execute(
      'SELECT id FROM post_comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (comments.length === 0) {
      return errorResponse(res, 404, 'Comment not found or you are not authorized to delete it');
    }

    await pool.execute('DELETE FROM post_comments WHERE id = ?', [commentId]);

    return successResponse(res, null, 'Comment deleted successfully');

  } catch (error) {
    console.error('Delete comment error:', error);
    return errorResponse(res, 500, 'Failed to delete comment', error.message);
  }
});

module.exports = router;
