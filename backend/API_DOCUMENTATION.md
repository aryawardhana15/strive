# Strive API Documentation

This document provides comprehensive documentation for the Strive Learning Platform API.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "avatar_url": "https://...",
      "xp_total": 0,
      "streak_count": 0,
      "title": "Beginner"
    },
    "token": "jwt-token-here"
  }
}
```

### Login User

**POST** `/auth/login`

Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

### Get Current User

**GET** `/auth/me`

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://...",
    "xp_total": 2450,
    "streak_count": 10,
    "title": "Skill Explorer",
    "rank": 128,
    "recent_activities": [...]
  }
}
```

## User Management

### Get User Profile

**GET** `/users/:id`

Get detailed user profile information.

**Parameters:**
- `id` (number): User ID

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://...",
    "xp_total": 2450,
    "streak_count": 10,
    "title": "Skill Explorer",
    "rank": 128,
    "skills": [...],
    "streak_calendar": [...]
  }
}
```

### Update User Profile

**PUT** `/users/:id`

Update user profile information.

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar_url": "https://new-avatar-url.com"
}
```

### Upload Avatar

**POST** `/users/:id/avatar`

Upload user avatar image.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (file): Image file (max 2MB)

### Get User Activities

**GET** `/users/:id/activities`

Get user's activity history.

**Query Parameters:**
- `limit` (number): Number of activities to return (default: 10)
- `page` (number): Page number for pagination (default: 1)

**Response:**
```json
{
  "success": true,
  "message": "User activities retrieved successfully",
  "data": {
    "activities": [
      {
        "type": "quiz_complete",
        "meta": { "quiz_id": 1, "score": 85 },
        "xp_earned": 20,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

## Skills Management

### Get All Skills

**GET** `/skills`

Get all available skills grouped by category.

**Query Parameters:**
- `category` (string): Filter by skill category

**Response:**
```json
{
  "success": true,
  "message": "Skills retrieved successfully",
  "data": {
    "skills": [...],
    "skillsByCategory": {
      "Programming Languages": [...],
      "Frontend": [...],
      "Backend": [...]
    }
  }
}
```

### Add Skill to User

**POST** `/skills/users/:userId/skills`

Add a skill to user's profile.

**Request Body:**
```json
{
  "skill_id": 1,
  "level": "intermediate"
}
```

**Level Options:**
- `beginner`
- `intermediate`
- `advanced`

### Get User Skills

**GET** `/skills/users/:userId`

Get all skills for a specific user.

### Remove Skill from User

**DELETE** `/skills/users/:userId/skills/:skillId`

Remove a skill from user's profile.

## Jobs & Career

### Get All Jobs

**GET** `/jobs`

Get job listings with filtering and pagination.

**Query Parameters:**
- `search` (string): Search term
- `location` (string): Filter by location
- `remote` (boolean): Filter remote jobs
- `fulltime` (boolean): Filter full-time jobs
- `min_salary` (number): Minimum salary filter
- `max_salary` (number): Maximum salary filter
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "id": 1,
        "title": "Frontend Developer",
        "company": "TechCorp Indonesia",
        "location": "Jakarta",
        "salary_min": 8000000,
        "salary_max": 12000000,
        "tags": ["React", "JavaScript", "CSS"],
        "description": "We are looking for...",
        "is_remote": true,
        "is_fulltime": true
      }
    ],
    "pagination": { ... }
  }
}
```

### Get Job Details

**GET** `/jobs/:id`

Get detailed information about a specific job.

### Get User's Job Recommendations

**GET** `/jobs/users/:userId/recommended`

Get AI-generated job recommendations for a user.

## Learning Roadmaps

### Get All Roadmaps

**GET** `/roadmaps`

Get all available learning roadmaps.

**Response:**
```json
{
  "success": true,
  "message": "Roadmaps retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Frontend Development",
      "description": "Learn modern frontend development...",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Roadmap with Steps

**GET** `/roadmaps/:id`

Get roadmap with all steps and user progress.

**Response:**
```json
{
  "success": true,
  "message": "Roadmap retrieved successfully",
  "data": {
    "id": 1,
    "title": "Frontend Development",
    "description": "...",
    "steps": [
      {
        "id": 1,
        "title": "HTML Fundamentals",
        "order_index": 1,
        "content": "Learn the basics...",
        "completed": false
      }
    ],
    "progress": {
      "total_steps": 5,
      "completed_steps": 2,
      "progress_percentage": 40.0
    }
  }
}
```

### Get Quiz for Step

**GET** `/roadmaps/:roadmapId/step/:stepId/quiz`

Get quiz questions for a specific roadmap step.

**Response:**
```json
{
  "success": true,
  "message": "Quiz retrieved successfully",
  "data": {
    "step_id": 1,
    "step_title": "HTML Fundamentals",
    "quiz": {
      "id": 1,
      "questions": [
        {
          "id": 1,
          "question": "What is HTML?",
          "options": ["A", "B", "C", "D"],
          "correct_answer": "A",
          "explanation": "HTML is..."
        }
      ]
    }
  }
}
```

### Submit Quiz Answers

**POST** `/roadmaps/:roadmapId/step/:stepId/submit-quiz`

Submit quiz answers for evaluation.

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": 1,
      "answer": "A"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "score": 85,
    "total_questions": 5,
    "correct_answers": 4,
    "feedback": "Good performance!",
    "xp_earned": 20,
    "completed": true
  }
}
```

## Challenges

### Get All Challenges

**GET** `/challenges`

Get all challenges grouped by type (daily, weekly, monthly).

**Response:**
```json
{
  "success": true,
  "message": "Challenges retrieved successfully",
  "data": {
    "daily": [...],
    "weekly": [...],
    "monthly": [...]
  }
}
```

### Start Challenge

**POST** `/challenges/:id/start`

Start a specific challenge.

### Submit Challenge Solution

**POST** `/challenges/:id/submit`

Submit code solution for a challenge.

**Request Body:**
```json
{
  "code": "function solution() { ... }",
  "language": "javascript"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Challenge submitted successfully",
  "data": {
    "passed": true,
    "score": 90,
    "feedback": "Great solution!",
    "hints": ["Consider edge cases"],
    "xp_earned": 50,
    "status": "completed"
  }
}
```

## CV Review

### Upload CV

**POST** `/cv/upload`

Upload CV file for AI analysis.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `cv` (file): CV file (PDF or Word, max 2MB)

**Response:**
```json
{
  "success": true,
  "message": "CV uploaded successfully",
  "data": {
    "cv_review_id": 1,
    "status": "processing",
    "message": "Analysis will be completed shortly."
  }
}
```

### Get CV Analysis Result

**GET** `/cv/:id/result`

Get CV analysis results.

**Response:**
```json
{
  "success": true,
  "message": "CV analysis result retrieved successfully",
  "data": {
    "status": "completed",
    "result": {
      "overall_score": 75,
      "strengths": ["Strong technical skills"],
      "weaknesses": ["Missing quantifiable achievements"],
      "suggestions": ["Add specific metrics"],
      "keyword_analysis": {
        "present": ["JavaScript", "React"],
        "missing": ["TypeScript", "Docker"]
      }
    }
  }
}
```

## Community

### Get Community Posts

**GET** `/community/posts`

Get community posts with pagination.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Posts per page

**Response:**
```json
{
  "success": true,
  "message": "Community posts retrieved successfully",
  "data": {
    "posts": [
      {
        "id": 1,
        "content": "Saya sedang belajar React...",
        "likes_count": 5,
        "created_at": "2024-01-01T00:00:00.000Z",
        "user_name": "John Doe",
        "user_avatar": "https://...",
        "is_liked": false
      }
    ],
    "pagination": { ... }
  }
}
```

### Create Post

**POST** `/community/posts`

Create a new community post.

**Request Body:**
```json
{
  "content": "Post content here",
  "image_url": "https://optional-image-url.com"
}
```

### Like/Unlike Post

**POST** `/community/posts/:id/like`

Like or unlike a community post.

### Add Comment

**POST** `/community/posts/:id/comments`

Add a comment to a post.

**Request Body:**
```json
{
  "content": "Comment content here"
}
```

## Search

### Global Search

**GET** `/search`

Search across all content types.

**Query Parameters:**
- `q` (string): Search query (required)
- `type` (string): Content type filter (jobs, courses, posts, users)
- `limit` (number): Results per type

**Response:**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "search_term": "react",
    "total_results": 15,
    "results": {
      "jobs": [...],
      "courses": [...],
      "community_posts": [...],
      "users": [...]
    }
  }
}
```

### Search Jobs

**GET** `/search/jobs`

Search specifically in job listings.

### Search Posts

**GET** `/search/posts`

Search in community posts.

### Search Users

**GET** `/search/users`

Search for users.

## Leaderboard

### Get Global Leaderboard

**GET** `/leaderboard`

Get global XP leaderboard.

**Query Parameters:**
- `limit` (number): Number of entries (default: 50)
- `page` (number): Page number

**Response:**
```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": {
    "leaderboard": [
      {
        "id": 1,
        "name": "John Doe",
        "avatar_url": "https://...",
        "title": "Expert",
        "xp_total": 5000,
        "streak_count": 25,
        "rank": 1
      }
    ],
    "user_rank": 128,
    "pagination": { ... }
  }
}
```

### Get Streak Leaderboard

**GET** `/leaderboard/streaks`

Get leaderboard based on learning streaks.

### Get Challenge Leaderboard

**GET** `/leaderboard/challenges`

Get leaderboard based on completed challenges.

### Get Community Leaderboard

**GET** `/leaderboard/community`

Get leaderboard based on community activity.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 413 | Payload Too Large - File size exceeds limit |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

API requests are rate limited to 100 requests per 15-minute window per IP address.

## File Upload Limits

- **CV Files**: Maximum 2MB, PDF and Word documents only
- **Images**: Maximum 5MB, JPEG, PNG, GIF, WebP formats

## Pagination

Most list endpoints support pagination with these parameters:

- `page`: Page number (starts from 1)
- `limit`: Items per page (default varies by endpoint)

Response includes pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Webhooks

Currently, the API does not support webhooks. Real-time features are planned for future releases.

## SDKs and Libraries

Official SDKs are not yet available. Use any HTTP client library that supports:

- JSON request/response handling
- File uploads (multipart/form-data)
- JWT token authentication
- Error handling

Recommended libraries:
- **JavaScript/Node.js**: Axios, Fetch API
- **Python**: Requests, httpx
- **PHP**: Guzzle, cURL
- **Java**: OkHttp, Apache HttpClient

## Support

For API support and questions:

1. Check this documentation
2. Review error messages and status codes
3. Test with Postman collection
4. Create an issue in the repository

---

**API Version**: 1.0.0  
**Last Updated**: January 2024
