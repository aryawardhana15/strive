// User types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  random_image_id: number;
  xp_total: number;
  streak_count: number;
  last_active_date?: string;
  title: string;
  study_time: number;
  rank?: number;
  recent_activities?: Activity[];
  skills?: UserSkill[];
  streak_calendar?: StreakDay[];
}

export interface UserSkill {
  id: number;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

export interface StreakDay {
  date: string;
  isActive: boolean;
}

// Skill types
export interface Skill {
  id: number;
  name: string;
  category: string;
  created_at: string;
}

export interface SkillsByCategory {
  [category: string]: Skill[];
}

// Job types
export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  tags: string[];
  description: string;
  requirements: string[];
  is_remote: boolean;
  is_fulltime: boolean;
  created_at: string;
  isRecommended?: boolean;
  recommendationScore?: number;
  recommendationReason?: string;
}

export interface JobRecommendation {
  score: number;
  reason: string;
  created_at: string;
  job: Job;
}

// Roadmap types
export interface Roadmap {
  id: number;
  title: string;
  description: string;
  created_at: string;
  steps?: RoadmapStep[];
  progress?: RoadmapProgress;
}

export interface RoadmapStep {
  id: number;
  title: string;
  order_index: number;
  content: string;
  quiz_id?: number;
  completed?: boolean;
  completed_at?: string;
}

export interface RoadmapProgress {
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
}

export interface UserRoadmapProgress {
  id: number;
  user_id: number;
  roadmap_id: number;
  step_id: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface Quiz {
  id: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizSubmission {
  answers: {
    question_id: number;
    answer: string;
  }[];
}

export interface QuizResult {
  score: number;
  total_questions: number;
  correct_answers: number;
  feedback: string;
  detailed_results: {
    question_id: number;
    correct: boolean;
    explanation: string;
  }[];
  xp_earned: number;
  completed: boolean;
}

// Challenge types
export interface Challenge {
  id: number;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  description: string;
  xp_reward: number;
  created_at: string;
  user_progress?: UserChallenge;
}

export interface UserChallenge {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  score: number;
  completed_at?: string;
}

export interface ChallengeSubmission {
  code: string;
  language: string;
}

export interface ChallengeResult {
  passed: boolean;
  score: number;
  feedback: string;
  hints: string[];
  test_results: {
    test_case: string;
    passed: boolean;
    output: string;
  }[];
  xp_earned: number;
  status: string;
}

// CV Review types
export interface CVReview {
  id: number;
  file_path: string;
  status: 'processing' | 'completed' | 'failed';
  result?: CVAnalysis;
  created_at: string;
  updated_at: string;
}

export interface CVAnalysis {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keyword_analysis: {
    present: string[];
    missing: string[];
  };
}

// Community types
export interface CommunityPost {
  id: number;
  content: string;
  image_url?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  user?: {
    name: string;
    avatar_url?: string;
    title: string;
  };
  is_liked?: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  user?: {
    name: string;
    avatar_url?: string;
    title: string;
  };
}

// Activity types
export interface Activity {
  id: number;
  user_id: number;
  type: 'quiz_complete' | 'challenge_complete' | 'cv_review' | 'streak_achieved' | 'community_post' | 'rank_change' | 'skill_added';
  meta?: any;
  xp_earned: number;
  created_at: string;
  user?: {
    name: string;
    avatar_url?: string;
  };
}

export interface ActivityStats {
  type: string;
  count: number;
  total_xp: number;
}

export interface TotalStats {
  total_activities: number;
  total_xp_earned: number;
  first_activity: string;
  last_activity: string;
}

// Search types
export interface SearchResults {
  search_term: string;
  total_results: number;
  results: {
    jobs: Job[];
    courses: Roadmap[];
    community_posts: CommunityPost[];
    users: User[];
  };
}

// Leaderboard types
export interface LeaderboardEntry {
  id: number;
  name: string;
  avatar_url?: string;
  title: string;
  xp_total: number;
  streak_count: number;
  rank: number;
  created_at: string;
}

export interface ChallengeLeaderboardEntry {
  id: number;
  name: string;
  avatar_url?: string;
  title: string;
  completed_challenges: number;
  total_challenge_xp: number;
  average_score: number;
  rank: number;
}

export interface CommunityLeaderboardEntry {
  id: number;
  name: string;
  avatar_url?: string;
  title: string;
  total_posts: number;
  total_likes: number;
  total_comments: number;
  rank: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AddSkillForm {
  skill_id: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface CreatePostForm {
  content: string;
  image_url?: string;
}

export interface CommentForm {
  content: string;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Component props types
export interface SidebarProps {
  currentPath: string;
}

export interface HeaderProps {
  user?: User;
}

export interface DashboardStats {
  rank: number;
  total_xp: number;
  study_time: number;
  active_courses: number;
  completed_courses: number;
}

export interface LearningProgress {
  roadmap_progress: {
    roadmap_id: number;
    roadmap_title: string;
    description: string;
    total_steps: number;
    completed_steps: number;
    progress_percentage: number;
  }[];
  challenge_progress: {
    type: string;
    total_challenges: number;
    completed_challenges: number;
  }[];
}
