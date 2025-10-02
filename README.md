# Strive - Platform Belajar Karier

Strive adalah platform pembelajaran yang membantu pengguna mengembangkan karier mereka melalui roadmap pembelajaran, tantangan coding, review CV, dan komunitas yang mendukung.

## 🚀 Fitur Utama

- **Dashboard Interaktif** - Lihat progress belajar, XP, dan streak
- **Roadmap Pembelajaran** - Jalur pembelajaran terstruktur untuk berbagai karier
- **Tantangan Coding** - Daily, weekly, dan monthly challenges
- **CV Review dengan AI** - Analisis CV menggunakan AI untuk feedback
- **Komunitas** - Berbagi pengalaman dan belajar bersama
- **Leaderboard** - Kompetisi sehat antar pengguna
- **Job Recommendations** - Rekomendasi pekerjaan berdasarkan skill

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **SWR** - Data fetching
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Multer** - File upload
- **Bcrypt** - Password hashing

### Database
- **MySQL** - Relational database
- **20+ tabel** dengan relasi yang lengkap

## 📋 Prerequisites

- Node.js (v18 atau lebih baru)
- MySQL (v8.0 atau lebih baru)
- npm atau yarn

## 🔧 Instalasi & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd strive
```

### 2. Setup Backend
```bash
cd backend
npm install
```

### 3. Setup Database
1. Buat database MySQL dengan nama `strive_db`
2. Import schema dari `backend/database/schema.sql`
3. Import sample data dari `backend/scripts/insert_sample_data.sql`

### 4. Environment Variables
Buat file `.env` di folder `backend`:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=strive_db

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI APIs (Optional - untuk fitur AI)
GROQ_API_KEY=your_groq_api_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

### 5. Setup Frontend
```bash
cd frontend
npm install
```

Buat file `.env.local` di folder `frontend`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6. Jalankan Aplikasi

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📊 Database Schema

Database terdiri dari 20+ tabel dengan relasi yang lengkap:

### Tabel Utama
- `users` - Data pengguna
- `skills` - Daftar skill yang tersedia
- `user_skills` - Skill yang dimiliki pengguna
- `jobs` - Lowongan kerja
- `roadmaps` - Roadmap pembelajaran
- `roadmap_steps` - Langkah-langkah dalam roadmap
- `challenges` - Tantangan coding
- `community_posts` - Post di komunitas
- `activities` - Aktivitas pengguna
- `cv_reviews` - Review CV

### Tabel Relasional
- `user_challenges` - Progress tantangan pengguna
- `user_roadmap_progress` - Progress roadmap pengguna
- `job_recommendations` - Rekomendasi pekerjaan
- `post_likes` - Like pada post komunitas
- `post_comments` - Komentar pada post
- `user_xp_history` - Riwayat XP pengguna

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Daftar akun baru
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get user profile

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `GET /api/users/:id/activities` - Get user activities
- `GET /api/users/:id/progress` - Get learning progress

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills/users/:id/skills` - Add user skill
- `GET /api/skills/users/:id` - Get user skills

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/users/:id/recommended` - Get recommended jobs

### Roadmaps
- `GET /api/roadmaps` - Get all roadmaps
- `GET /api/roadmaps/:id/steps` - Get roadmap steps
- `GET /api/roadmaps/:roadmapId/step/:stepId/quiz` - Get quiz
- `POST /api/roadmaps/:roadmapId/step/:stepId/submit-quiz` - Submit quiz

### Challenges
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/type/:type` - Get challenges by type
- `POST /api/challenges/:id/start` - Start challenge
- `POST /api/challenges/:id/submit` - Submit challenge

### Community
- `GET /api/community/posts` - Get community posts
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/:id/like` - Like post
- `POST /api/community/posts/:id/comments` - Add comment

### CV Review
- `POST /api/cv/upload` - Upload CV
- `GET /api/cv/:id/result` - Get CV analysis result

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/streaks` - Get streaks leaderboard

## 🎯 Sample Data

Database sudah dilengkapi dengan sample data:
- 7 avatar images
- 12 skills dalam berbagai kategori
- 6 challenges (daily, weekly, monthly)
- 3 courses
- 3 roadmaps dengan steps
- 3 job listings
- 3 sample users dengan progress
- Community posts dan activities

## 🔐 Authentication

Aplikasi menggunakan JWT untuk authentication. Password di-hash menggunakan bcrypt.

### Sample Users
- Email: `arya@example.com` | Password: `password`
- Email: `sari@example.com` | Password: `password`
- Email: `budi@example.com` | Password: `password`

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Toggle theme
- **Loading States** - Skeleton loading
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Success/error feedback
- **Modal Components** - Interactive modals
- **Drag & Drop** - File upload dengan drag & drop

## 🚀 Deployment

### Backend (Railway/Heroku)
```bash
# Set environment variables
# Deploy to your preferred platform
```

### Frontend (Vercel/Netlify)
```bash
# Set NEXT_PUBLIC_API_URL to your backend URL
# Deploy to Vercel or Netlify
```

### Database (PlanetScale/Railway)
```bash
# Create MySQL database
# Import schema and sample data
# Update connection string
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License - lihat file LICENSE untuk detail.

## 🆘 Support

Jika mengalami masalah:
1. Check logs di console
2. Verify database connection
3. Check environment variables
4. Create issue di repository

## 🎉 Credits

- Design inspiration dari berbagai platform learning
- Icons dari Lucide React
- Images dari Unsplash
- Font dari Google Fonts