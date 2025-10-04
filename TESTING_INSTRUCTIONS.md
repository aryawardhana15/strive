# Testing Instructions for Strive Learning Platform

This document provides comprehensive testing instructions for the Strive learning platform, including both manual testing procedures and automated testing setup.

## 🧪 Testing Overview

The platform includes both backend API testing and frontend component testing. Tests are designed to ensure functionality, security, and user experience.

## 🔧 Test Setup

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+ (for integration tests)
- Test database setup

### Installation
```bash
# Backend testing dependencies
cd backend
npm install --save-dev jest supertest

# Frontend testing dependencies
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

## 🗄️ Database Testing Setup

### Test Database Configuration
1. Create a separate test database:
   ```sql
   CREATE DATABASE strive_test_db;
   ```

2. Update test environment variables:
   ```env
   # .env.test
   DB_NAME=strive_test_db
   NODE_ENV=test
   ```

3. Run test migrations:
   ```bash
   mysql -u root -p strive_test_db < scripts/migrate.sql
   ```

## 🔐 Authentication Testing

### Backend API Tests

#### User Registration
```bash
# Test valid registration
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 201 Created with user data and JWT token
```

#### User Login
```bash
# Test valid login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 200 OK with user data and JWT token
```

#### Protected Route Access
```bash
# Test accessing protected route without token
curl -X GET http://localhost:5000/auth/me

# Expected: 401 Unauthorized

# Test accessing protected route with valid token
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with user data
```

### Frontend Authentication Tests

#### Login Flow
1. Navigate to `/auth/login`
2. Enter valid credentials
3. Verify redirect to dashboard
4. Verify user data is stored in localStorage
5. Verify JWT token is set

#### Registration Flow
1. Navigate to `/auth/register`
2. Fill out registration form
3. Submit form
4. Verify success message
5. Verify redirect to dashboard

#### Logout Flow
1. Click logout button
2. Verify redirect to login page
3. Verify localStorage is cleared
4. Verify protected routes redirect to login

## 📊 Dashboard Testing

### Backend API Tests

#### Dashboard Data Fetching
```bash
# Test dashboard data endpoint
curl -X GET http://localhost:5000/users/1/activities?limit=4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with recent activities
```

#### Global Search
```bash
# Test global search
curl -X GET "http://localhost:5000/search?q=javascript" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with search results
```

### Frontend Dashboard Tests

#### Component Rendering
1. Navigate to dashboard
2. Verify all components load:
   - Welcome banner
   - Stats cards (streak, rank, title)
   - Add skill section
   - Job recommendations
   - Activity feed
   - Profile widget

#### Interactive Elements
1. Test add skill modal:
   - Click "Add Skill" button
   - Verify modal opens
   - Select skills and levels
   - Submit form
   - Verify success message

2. Test job recommendation cards:
   - Click on job card
   - Verify job detail modal opens
   - Verify job information displays correctly

## 📚 Learning Progress Testing

### Backend API Tests

#### Roadmap Data
```bash
# Test roadmap retrieval
curl -X GET http://localhost:5000/roadmaps \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with roadmaps list
```

#### Quiz Generation
```bash
# Test quiz generation
curl -X GET http://localhost:5000/roadmaps/1/step/1/quiz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with generated quiz questions
```

#### Quiz Submission
```bash
# Test quiz submission
curl -X POST http://localhost:5000/roadmaps/1/step/1/submit-quiz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [0, 1, 2, 0, 1]
  }'

# Expected: 200 OK with quiz results and XP award
```

### Frontend Progress Tests

#### Roadmap Navigation
1. Navigate to `/progress`
2. Select a roadmap from dropdown
3. Verify roadmap steps display
4. Verify step completion status
5. Test step navigation

#### Quiz Functionality
1. Click on a step's quiz button
2. Verify quiz modal opens
3. Answer all questions
4. Submit quiz
5. Verify results display
6. Verify XP is awarded
7. Verify next step unlocks

## ⚔️ Challenges Testing

### Backend API Tests

#### Challenge Retrieval
```bash
# Test challenge list
curl -X GET http://localhost:5000/challenges \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with challenges list
```

#### Challenge Submission
```bash
# Test challenge submission
curl -X POST http://localhost:5000/challenges/1/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello World\");",
    "language": "javascript"
  }'

# Expected: 200 OK with evaluation results
```

### Frontend Challenge Tests

#### Challenge Interface
1. Navigate to `/challenges`
2. Verify challenge types display (Daily, Weekly, Monthly)
3. Click "Start Now" on a challenge
4. Verify confirmation modal
5. Confirm and start challenge

#### Code Editor
1. Verify Monaco editor loads
2. Test syntax highlighting
3. Test code completion
4. Test error highlighting
5. Submit code solution
6. Verify evaluation results

## 💼 Careers Testing

### Backend API Tests

#### Job Search
```bash
# Test job search
curl -X GET "http://localhost:5000/jobs?search=developer&location=jakarta" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with filtered jobs
```

#### Job Recommendations
```bash
# Test job recommendations
curl -X GET http://localhost:5000/jobs/users/1/recommended \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with recommended jobs
```

### Frontend Career Tests

#### Job Search Interface
1. Navigate to `/careers`
2. Test search functionality
3. Test filter options
4. Verify search results display
5. Test pagination

#### Job Details
1. Click on a job card
2. Verify job detail page loads
3. Verify all job information displays
4. Test "Apply Now" button
5. Test similar jobs section

## 📄 CV Review Testing

### Backend API Tests

#### CV Upload
```bash
# Test CV upload
curl -X POST http://localhost:5000/cv/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "cv=@test-cv.pdf"

# Expected: 200 OK with upload confirmation
```

#### CV Analysis Results
```bash
# Test CV analysis results
curl -X GET http://localhost:5000/cv/1/result \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with analysis results
```

### Frontend CV Tests

#### Upload Interface
1. Navigate to `/cv-review`
2. Test drag and drop functionality
3. Test file selection
4. Upload valid CV file
5. Verify upload progress
6. Verify analysis results

#### File Validation
1. Test invalid file types
2. Test oversized files
3. Verify error messages
4. Test valid file upload

## 👥 Community Testing

### Backend API Tests

#### Post Creation
```bash
# Test post creation
curl -X POST http://localhost:5000/community/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post content"
  }'

# Expected: 201 Created with post data
```

#### Post Interactions
```bash
# Test post liking
curl -X POST http://localhost:5000/community/posts/1/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with updated like count
```

### Frontend Community Tests

#### Post Creation
1. Navigate to `/community`
2. Click "Buat Post" button
3. Enter post content
4. Test image upload
5. Submit post
6. Verify post appears in feed

#### Post Interactions
1. Test like functionality
2. Test comment functionality
3. Test share functionality
4. Verify interaction counts update

## 🏆 Leaderboard Testing

### Backend API Tests

#### Leaderboard Data
```bash
# Test global leaderboard
curl -X GET http://localhost:5000/leaderboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with leaderboard data
```

#### User Rank Context
```bash
# Test user rank context
curl -X GET http://localhost:5000/leaderboard/users/1/context \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with user rank information
```

### Frontend Leaderboard Tests

#### Leaderboard Display
1. Navigate to `/leaderboard`
2. Test tab switching (Global, Streak, Challenge, Community)
3. Verify leaderboard data displays
4. Verify user rank highlighting
5. Test pagination if applicable

## 📊 Activities Testing

### Backend API Tests

#### Activity History
```bash
# Test activity history
curl -X GET http://localhost:5000/activities/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with activity history
```

#### Activity Filtering
```bash
# Test activity filtering
curl -X GET http://localhost:5000/activities/users/1/type/quiz_complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with filtered activities
```

### Frontend Activity Tests

#### Activity Display
1. Navigate to `/activities`
2. Verify activity list displays
3. Test filter functionality
4. Test pagination
5. Verify activity details

## 🤖 AI Integration Testing

### GROQ API Testing
```bash
# Test quiz generation (if API key available)
curl -X GET http://localhost:5000/roadmaps/1/step/1/quiz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with AI-generated quiz or mock data
```

### Google AI Studio Testing
```bash
# Test CV analysis (if API key available)
curl -X GET http://localhost:5000/cv/1/result \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with AI analysis or mock data
```

## 🔒 Security Testing

### Authentication Security
1. Test JWT token expiration
2. Test refresh token functionality
3. Test password strength validation
4. Test rate limiting on login attempts

### Authorization Security
1. Test access to other users' data
2. Test admin-only endpoints
3. Test file upload security
4. Test SQL injection prevention

### Data Validation
1. Test input sanitization
2. Test file type validation
3. Test file size limits
4. Test XSS prevention

## 📱 Responsive Testing

### Mobile Testing
1. Test on various screen sizes (320px, 768px, 1024px, 1920px)
2. Test touch interactions
3. Test mobile navigation
4. Test form inputs on mobile

### Cross-Browser Testing
1. Test on Chrome, Firefox, Safari, Edge
2. Test JavaScript functionality
3. Test CSS compatibility
4. Test API calls

## 🚀 Performance Testing

### Backend Performance
1. Test API response times
2. Test database query performance
3. Test file upload performance
4. Test concurrent user handling

### Frontend Performance
1. Test page load times
2. Test component rendering performance
3. Test image optimization
4. Test bundle size

## 🐛 Error Handling Testing

### Backend Error Handling
1. Test invalid input handling
2. Test database connection errors
3. Test API rate limiting
4. Test file upload errors

### Frontend Error Handling
1. Test network error handling
2. Test form validation errors
3. Test loading states
4. Test error boundaries

## 📋 Test Checklist

### Authentication
- [ ] User registration
- [ ] User login
- [ ] Password validation
- [ ] JWT token handling
- [ ] Logout functionality
- [ ] Protected route access

### Dashboard
- [ ] Component rendering
- [ ] Data fetching
- [ ] Interactive elements
- [ ] Search functionality
- [ ] Skill addition

### Learning Progress
- [ ] Roadmap display
- [ ] Step navigation
- [ ] Quiz generation
- [ ] Quiz submission
- [ ] Progress tracking

### Challenges
- [ ] Challenge listing
- [ ] Challenge start
- [ ] Code editor
- [ ] Code submission
- [ ] Evaluation results

### Careers
- [ ] Job search
- [ ] Job filtering
- [ ] Job details
- [ ] Job recommendations
- [ ] Application process

### CV Review
- [ ] File upload
- [ ] File validation
- [ ] Analysis results
- [ ] History tracking
- [ ] Statistics display

### Community
- [ ] Post creation
- [ ] Post display
- [ ] Interactions (like, comment)
- [ ] Image upload
- [ ] Recent chats

### Leaderboard
- [ ] Leaderboard display
- [ ] Tab switching
- [ ] User ranking
- [ ] Data accuracy

### Activities
- [ ] Activity history
- [ ] Activity filtering
- [ ] Pagination
- [ ] Statistics

### Security
- [ ] Authentication security
- [ ] Authorization checks
- [ ] Input validation
- [ ] File upload security

### Performance
- [ ] Page load times
- [ ] API response times
- [ ] Database performance
- [ ] File upload performance

### Responsive Design
- [ ] Mobile compatibility
- [ ] Tablet compatibility
- [ ] Desktop compatibility
- [ ] Touch interactions

## 🚨 Common Issues and Solutions

### Database Connection Issues
- Verify MySQL service is running
- Check database credentials
- Ensure database exists
- Check connection pool settings

### API Key Issues
- Verify API keys are set correctly
- Check API key permissions
- Test API endpoints directly
- Use mock data as fallback

### File Upload Issues
- Check file size limits
- Verify file type restrictions
- Check upload directory permissions
- Test with different file formats

### Authentication Issues
- Verify JWT secret is set
- Check token expiration settings
- Test refresh token functionality
- Verify CORS settings

## 📞 Support

For testing issues or questions:
1. Check the console for error messages
2. Verify network requests in browser dev tools
3. Check server logs for backend errors
4. Open an issue in the repository

## 🔄 Continuous Testing

### Automated Testing
- Set up CI/CD pipeline
- Run tests on every commit
- Generate test coverage reports
- Monitor test results

### Manual Testing
- Regular manual testing sessions
- User acceptance testing
- Cross-browser testing
- Performance monitoring




