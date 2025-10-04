# Strive - Comprehensive Learning Platform

A full-stack learning platform with AI-powered features, built with Node.js/Express backend and Next.js frontend.

## 🚀 Features

### 🔐 Authentication & User Management
- JWT-based authentication
- User registration and login
- Profile management with avatar upload
- XP system with titles and streaks
- Random avatar assignment from 7 image pool

### 🏠 Dashboard
- Global search across jobs, courses, posts, and users
- Profile card with XP, streak calendar, and title
- Add skill functionality with AI-powered job recommendations
- Activity feed with recent achievements
- Streak tracking system
- Career recommendation cards

### 📚 Learning Progress
- Interactive roadmaps with sequential steps
- AI-generated quizzes (5-7 MCQ questions via GROQ API)
- Step completion tracking with XP rewards
- Learning statistics and progress visualization
- Unlock system for next steps

### ⚔️ Challenges
- Daily, Weekly, and Monthly challenges
- In-browser coding editor with syntax highlighting
- AI-powered code evaluation via GROQ API
- XP rewards and streak updates
- Challenge leaderboard

### 💼 Careers
- Job search with advanced filters
- AI-powered job recommendations based on skills
- Detailed job pages with company information
- Similar job suggestions
- Application tracking

### 📄 CV Review
- CV upload (PDF, DOC, DOCX up to 2MB)
- AI-powered CV analysis via Google AI Studio API
- Detailed feedback with scores and suggestions
- CV review history and statistics
- XP rewards for completed reviews

### 👥 Community
- Microblog platform (Twitter-like)
- Post creation with text and image support
- Like, comment, and share functionality
- Recent chats widget
- Community leaderboard

### 🏆 Leaderboards
- Global leaderboard (by XP)
- Streak leaderboard
- Challenge leaderboard
- Community leaderboard
- User rank context

### 📊 Activities
- Complete activity history
- Activity filtering by type
- XP tracking and statistics
- Achievement milestones

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database with mysql2/promise
- **JWT** authentication with bcryptjs
- **Multer** for file uploads
- **Joi** for validation
- **Axios** for external API calls
- **GROQ API** for AI features
- **Google AI Studio API** for CV analysis

### Frontend
- **Next.js** with React
- **TypeScript** for type safety
- **SWR** for data fetching
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hook Form** for forms
- **Monaco Editor** for code editing

## 🗄️ Database Schema

### Core Tables
- `users` - User profiles and authentication
- `skills` - Available skills and categories
- `user_skills` - User skill associations
- `jobs` - Job listings and details
- `job_recommendations` - AI-generated job matches
- `roadmaps` - Learning paths
- `roadmap_steps` - Individual learning steps
- `user_roadmap_progress` - User progress tracking
- `quizzes` - Generated quiz questions
- `challenges` - Coding challenges
- `user_challenges` - Challenge submissions
- `activities` - User activity log
- `cv_reviews` - CV analysis results
- `community_posts` - Community content
- `user_xp_history` - XP tracking

## 🤖 AI Integrations

### GROQ API
- **Quiz Generation**: Creates 5-7 MCQ questions for learning steps
- **Code Evaluation**: Evaluates challenge submissions
- **Skill-Job Matching**: Recommends jobs based on user skills
- **CV Analysis**: Analyzes uploaded CVs for improvements

### Google AI Studio API
- **CV Analysis**: Provides detailed CV feedback and scoring
- **Content Generation**: Generates educational content

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- GROQ API key (optional, uses mock data if not provided)
- Google AI Studio API key (optional, uses mock data if not provided)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd strive
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database and API credentials
   ```

3. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE strive_db;
   
   # Run migrations
   mysql -u root -p strive_db < scripts/migrate.sql
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**
   ```bash
   # Backend (from backend directory)
   npm run dev
   
   # Frontend (from frontend directory)
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=strive_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Server
PORT=5000
NODE_ENV=development

# AI APIs
GROQ_API_KEY=your_groq_api_key
GROQ_API_URL=https://api.groq.com/v1
GOOGLE_AI_API_KEY=your_google_ai_key
GOOGLE_AI_API_URL=https://generativelanguage.googleapis.com/v1

# File Upload
MAX_FILE_SIZE=2097152
UPLOAD_PATH=uploads

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📁 Project Structure

```
strive/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── skills.js
│   │   ├── jobs.js
│   │   ├── roadmaps.js
│   │   ├── challenges.js
│   │   ├── cv.js
│   │   ├── community.js
│   │   ├── activities.js
│   │   ├── search.js
│   │   └── leaderboard.js
│   ├── services/
│   │   └── aiService.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── ai.js
│   ├── scripts/
│   │   └── migrate.sql
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── progress/
│   │   ├── challenges/
│   │   ├── careers/
│   │   ├── cv-review/
│   │   ├── community/
│   │   ├── leaderboard/
│   │   ├── activities/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Dashboard/
│   │   └── Layout/
│   ├── lib/
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── types/
│   │   └── index.ts
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `POST /auth/change-password` - Change password

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `POST /users/:id/avatar` - Upload avatar
- `GET /users/:id/activities` - Get user activities
- `GET /users/:id/recommended-jobs` - Get recommended jobs
- `GET /users/:id/progress` - Get learning progress
- `GET /users/:id/xp-history` - Get XP history

### Skills
- `GET /skills` - Get all skills
- `POST /skills/users/:userId/skills` - Add user skill
- `DELETE /skills/users/:userId/skills/:skillId` - Remove user skill
- `PUT /skills/users/:userId/skills/:skillId` - Update skill level
- `GET /skills/users/:userId` - Get user skills
- `POST /skills/users/:userId/generate-recommendations` - Generate job recommendations

### Jobs
- `GET /jobs` - Get all jobs (with pagination and filters)
- `GET /jobs/:id` - Get job by ID
- `GET /jobs/users/:userId/recommended` - Get recommended jobs
- `GET /jobs/similar/:id` - Get similar jobs

### Roadmaps
- `GET /roadmaps` - Get all roadmaps
- `GET /roadmaps/:id` - Get roadmap by ID
- `GET /roadmaps/:id/steps` - Get roadmap steps
- `GET /roadmaps/:roadmapId/step/:stepId/quiz` - Generate quiz for step
- `POST /roadmaps/:roadmapId/step/:stepId/submit-quiz` - Submit quiz
- `GET /roadmaps/:id/progress` - Get user progress
- `GET /roadmaps/users/:userId/stats` - Get learning statistics

### Challenges
- `GET /challenges` - Get all challenges
- `GET /challenges/type/:type` - Get challenges by type
- `GET /challenges/:id` - Get challenge by ID
- `POST /challenges/:id/start` - Start challenge
- `POST /challenges/:id/submit` - Submit challenge solution
- `GET /challenges/users/:userId/progress` - Get user progress
- `GET /challenges/users/:userId/completed` - Get completed challenges

### CV Review
- `POST /cv/upload` - Upload CV
- `GET /cv/:id/result` - Get CV analysis result
- `GET /cv/users/:userId/history` - Get CV review history
- `DELETE /cv/:id` - Delete CV review
- `GET /cv/users/:userId/stats` - Get CV statistics

### Community
- `GET /community/posts` - Get all posts
- `GET /community/posts/:id` - Get post by ID
- `POST /community/posts` - Create new post
- `POST /community/posts/upload-image` - Upload post image
- `POST /community/posts/:id/like` - Like/unlike post
- `POST /community/posts/:id/comments` - Add comment
- `GET /community/recent-chats` - Get recent chats
- `DELETE /community/posts/:id` - Delete post
- `DELETE /community/comments/:id` - Delete comment

### Activities
- `GET /activities/users/:userId` - Get user activities
- `GET /activities/users/:userId/recent` - Get recent activities
- `GET /activities/users/:userId/type/:type` - Get activities by type
- `GET /activities/users/:userId/stats` - Get activity statistics

### Search
- `GET /search` - Global search
- `GET /search/jobs` - Search jobs
- `GET /search/courses` - Search courses
- `GET /search/posts` - Search posts
- `GET /search/users` - Search users
- `GET /search/suggestions` - Get search suggestions

### Leaderboard
- `GET /leaderboard` - Global leaderboard
- `GET /leaderboard/streaks` - Streak leaderboard
- `GET /leaderboard/challenges` - Challenge leaderboard
- `GET /leaderboard/community` - Community leaderboard
- `GET /leaderboard/users/:userId/context` - Get user rank context

## 🎨 UI Components

### Dashboard Components
- `WelcomeBanner` - Welcome message with user info
- `StatsCard` - Display streak, rank, and title
- `AddSkillSection` - Skill addition interface
- `JobRecommendationCard` - AI-recommended jobs
- `ProfileWidget` - User profile summary
- `StreakCalendar` - Visual streak tracking
- `ActivityHistory` - Recent activities feed

### Layout Components
- `Header` - Global navigation with search
- `Sidebar` - Main navigation menu
- `Layout` - Main layout wrapper

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- File upload validation and size limits
- CORS configuration
- Helmet for security headers
- Input validation with Joi schemas

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for responsive utilities
- Accessible UI components
- Touch-friendly interactions
- Optimized for various screen sizes

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

## 🔮 Future Enhancements

- Real-time notifications
- Video course integration
- Mobile app development
- Advanced analytics dashboard
- Social learning features
- Gamification enhancements
- Multi-language support
- Advanced AI tutoring

## 🎨 Design Resources
- Icons dari Lucide React
- Images dari Unsplash
- Font dari Google Fonts
