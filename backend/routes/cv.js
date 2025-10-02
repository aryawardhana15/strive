const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { uploadCV, handleUploadError } = require('../middleware/upload');
const { analyzeCV } = require('../utils/ai');
const { updateUserXP, updateStreak } = require('../utils/helpers');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Upload CV for analysis
router.post('/upload', authenticateToken, uploadCV, handleUploadError, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return errorResponse(res, 400, 'No CV file uploaded');
    }

    const filePath = req.file.path;

    // Create CV review record
    const [result] = await pool.execute(
      'INSERT INTO cv_reviews (user_id, file_path, status) VALUES (?, ?, ?)',
      [userId, filePath, 'processing']
    );

    const cvReviewId = result.insertId;

    // Start CV analysis in background
    analyzeCVInBackground(cvReviewId, filePath, userId);

    return successResponse(res, {
      cv_review_id: cvReviewId,
      status: 'processing',
      message: 'CV uploaded successfully. Analysis will be completed shortly.'
    }, 'CV uploaded successfully');

  } catch (error) {
    console.error('CV upload error:', error);
    return errorResponse(res, 500, 'Failed to upload CV', error.message);
  }
});

// Get CV analysis result
router.get('/:id/result', authenticateToken, async (req, res) => {
  try {
    const cvReviewId = req.params.id;
    const userId = req.user.id;

    const [cvReviews] = await pool.execute(
      'SELECT * FROM cv_reviews WHERE id = ? AND user_id = ?',
      [cvReviewId, userId]
    );

    if (cvReviews.length === 0) {
      return errorResponse(res, 404, 'CV review not found');
    }

    const cvReview = cvReviews[0];

    if (cvReview.status === 'processing') {
      return successResponse(res, {
        status: 'processing',
        message: 'CV analysis is still in progress. Please check back in a few moments.'
      }, 'CV analysis in progress');
    }

    if (cvReview.status === 'failed') {
      return errorResponse(res, 500, 'CV analysis failed. Please try uploading again.');
    }

    // Parse the result JSON
    let analysisResult;
    try {
      analysisResult = JSON.parse(cvReview.result);
    } catch (error) {
      console.error('Error parsing CV analysis result:', error);
      return errorResponse(res, 500, 'Error processing CV analysis result');
    }

    return successResponse(res, {
      status: 'completed',
      result: analysisResult,
      created_at: cvReview.created_at,
      updated_at: cvReview.updated_at
    }, 'CV analysis result retrieved successfully');

  } catch (error) {
    console.error('Get CV result error:', error);
    return errorResponse(res, 500, 'Failed to retrieve CV analysis result', error.message);
  }
});

// Get user's CV review history
router.get('/users/:userId/history', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if user is getting their own CV history
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own CV review history');
    }

    const [cvReviews] = await pool.execute(
      `SELECT id, file_path, status, result, created_at, updated_at
       FROM cv_reviews
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM cv_reviews WHERE user_id = ?',
      [userId]
    );

    // Parse results for completed reviews
    const reviewsWithResults = cvReviews.map(review => {
      if (review.status === 'completed' && review.result) {
        try {
          review.result = JSON.parse(review.result);
        } catch (error) {
          console.error('Error parsing CV result:', error);
          review.result = null;
        }
      }
      return review;
    });

    return successResponse(res, {
      reviews: reviewsWithResults,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'CV review history retrieved successfully');

  } catch (error) {
    console.error('Get CV history error:', error);
    return errorResponse(res, 500, 'Failed to retrieve CV review history', error.message);
  }
});

// Delete CV review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const cvReviewId = req.params.id;
    const userId = req.user.id;

    const [cvReviews] = await pool.execute(
      'SELECT file_path FROM cv_reviews WHERE id = ? AND user_id = ?',
      [cvReviewId, userId]
    );

    if (cvReviews.length === 0) {
      return errorResponse(res, 404, 'CV review not found');
    }

    const cvReview = cvReviews[0];

    // Delete the file from filesystem
    try {
      await fs.unlink(cvReview.file_path);
    } catch (error) {
      console.error('Error deleting CV file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await pool.execute(
      'DELETE FROM cv_reviews WHERE id = ? AND user_id = ?',
      [cvReviewId, userId]
    );

    return successResponse(res, null, 'CV review deleted successfully');

  } catch (error) {
    console.error('Delete CV review error:', error);
    return errorResponse(res, 500, 'Failed to delete CV review', error.message);
  }
});

// Get CV analysis statistics
router.get('/users/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Check if user is getting their own stats
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own CV statistics');
    }

    const [stats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_reviews,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_reviews,
         SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_reviews,
         SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_reviews,
         AVG(CASE WHEN status = 'completed' AND result IS NOT NULL THEN JSON_EXTRACT(result, '$.overall_score') ELSE NULL END) as average_score
       FROM cv_reviews
       WHERE user_id = ?`,
      [userId]
    );

    // Get latest review
    const [latestReview] = await pool.execute(
      `SELECT id, status, result, created_at
       FROM cv_reviews
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    let latestResult = null;
    if (latestReview.length > 0 && latestReview[0].status === 'completed' && latestReview[0].result) {
      try {
        latestResult = JSON.parse(latestReview[0].result);
      } catch (error) {
        console.error('Error parsing latest CV result:', error);
      }
    }

    return successResponse(res, {
      statistics: stats[0],
      latest_review: latestReview.length > 0 ? {
        id: latestReview[0].id,
        status: latestReview[0].status,
        result: latestResult,
        created_at: latestReview[0].created_at
      } : null
    }, 'CV statistics retrieved successfully');

  } catch (error) {
    console.error('Get CV stats error:', error);
    return errorResponse(res, 500, 'Failed to retrieve CV statistics', error.message);
  }
});

// Background function to analyze CV
const analyzeCVInBackground = async (cvReviewId, filePath, userId) => {
  try {
    console.log(`Starting CV analysis for review ID: ${cvReviewId}`);

    // Read the CV file
    const cvContent = await fs.readFile(filePath, 'utf8');

    // For PDF files, we would need a PDF parser
    // For now, we'll work with text files or extract text from PDF
    // In a production environment, you'd use a library like pdf-parse

    // Analyze CV using AI
    const analysisResult = await analyzeCV(cvContent);

    // Update the CV review record
    await pool.execute(
      'UPDATE cv_reviews SET status = ?, result = ? WHERE id = ?',
      ['completed', JSON.stringify(analysisResult), cvReviewId]
    );

    // Award XP for CV review
    await updateUserXP(userId, 15, 'cv_review', cvReviewId);

    // Update streak
    await updateStreak(userId);

    console.log(`CV analysis completed for review ID: ${cvReviewId}`);

  } catch (error) {
    console.error('CV analysis error:', error);

    // Update status to failed
    try {
      await pool.execute(
        'UPDATE cv_reviews SET status = ? WHERE id = ?',
        ['failed', cvReviewId]
      );
    } catch (dbError) {
      console.error('Error updating CV review status to failed:', dbError);
    }
  }
};

// Helper function to extract text from PDF (placeholder)
const extractTextFromPDF = async (filePath) => {
  // In a real implementation, you would use a library like pdf-parse
  // For now, we'll return a placeholder
  return 'PDF content extraction not implemented. Please upload a text file for testing.';
};

module.exports = router;
