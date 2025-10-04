// Mock data for development and testing
export const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar_url: '/avatars/avatar1.png',
  xp_total: 1250,
  streak_count: 7,
  last_active_date: new Date().toISOString(),
  title: 'Rising Star',
  study_time: 45,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockSkills = [
  { id: 1, name: 'JavaScript', category: 'Programming' },
  { id: 2, name: 'React', category: 'Frontend' },
  { id: 3, name: 'Node.js', category: 'Backend' },
  { id: 4, name: 'Python', category: 'Programming' },
  { id: 5, name: 'SQL', category: 'Database' },
  { id: 6, name: 'Git', category: 'Tools' }
];

export const mockUserSkills = [
  { id: 1, user_id: 1, skill_id: 1, level: 'intermediate', created_at: new Date().toISOString() },
  { id: 2, user_id: 1, skill_id: 2, level: 'beginner', created_at: new Date().toISOString() },
  { id: 3, user_id: 1, skill_id: 3, level: 'beginner', created_at: new Date().toISOString() }
];

export const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Tech Corp',
    location: 'Jakarta',
    salary_min: 8000000,
    salary_max: 12000000,
    tags: ['React', 'JavaScript', 'CSS'],
    description: 'We are looking for a skilled Frontend Developer to join our team...',
    requirements: ['3+ years React experience', 'Strong JavaScript skills', 'CSS/HTML proficiency'],
    is_fulltime: true,
    is_remote: false,
    created_at: new Date().toISOString(),
    isRecommended: true,
    recommendationScore: 85,
    recommendationReason: 'Your React and JavaScript skills match this position perfectly!'
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Bandung',
    salary_min: 10000000,
    salary_max: 15000000,
    tags: ['Node.js', 'React', 'MongoDB'],
    description: 'Join our growing startup as a Full Stack Developer...',
    requirements: ['Node.js experience', 'React knowledge', 'Database skills'],
    is_fulltime: true,
    is_remote: true,
    created_at: new Date().toISOString(),
    isRecommended: true,
    recommendationScore: 78,
    recommendationReason: 'Your Node.js and React skills align well with this role!'
  }
];

export const mockRoadmaps = [
  {
    id: 1,
    title: 'Full Stack Web Development',
    description: 'Complete roadmap to become a full stack web developer',
    steps: [
      {
        id: 1,
        title: 'HTML & CSS Fundamentals',
        order_index: 1,
        content: 'Learn the basics of HTML and CSS...',
        completed: true
      },
      {
        id: 2,
        title: 'JavaScript Basics',
        order_index: 2,
        content: 'Master JavaScript fundamentals...',
        completed: true
      },
      {
        id: 3,
        title: 'React Introduction',
        order_index: 3,
        content: 'Learn React component-based development...',
        completed: false
      }
    ]
  }
];

export const mockChallenges = [
  {
    id: 1,
    title: 'Daily: FizzBuzz',
    type: 'daily',
    description: 'Write a function that prints numbers 1-100, but for multiples of 3 print "Fizz", for multiples of 5 print "Buzz", and for multiples of both print "FizzBuzz".',
    xp_reward: 50,
    difficulty: 'easy',
    language: 'javascript',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Weekly: Todo App',
    type: 'weekly',
    description: 'Build a complete todo application with add, edit, delete, and mark complete functionality.',
    xp_reward: 200,
    difficulty: 'medium',
    language: 'javascript',
    created_at: new Date().toISOString()
  }
];

export const mockActivities = [
  {
    id: 1,
    user_id: 1,
    type: 'quiz_complete',
    meta: { step_title: 'JavaScript Basics', score: 85 },
    xp_earned: 50,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 2,
    user_id: 1,
    type: 'challenge_complete',
    meta: { challenge_title: 'FizzBuzz', challenge_type: 'daily' },
    xp_earned: 50,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 3,
    user_id: 1,
    type: 'streak_achieved',
    meta: { streak_count: 7 },
    xp_earned: 25,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 4,
    user_id: 1,
    type: 'skill_added',
    meta: { skill_name: 'React', skill_level: 'beginner' },
    xp_earned: 30,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
];

export const mockCommunityPosts = [
  {
    id: 1,
    user: {
      id: 1,
      name: 'John Doe',
      avatar_url: '/avatars/avatar1.png'
    },
    content: 'Just completed my first React component! Feeling excited about this learning journey 🚀',
    image_url: null,
    likes_count: 12,
    comments_count: 3,
    is_liked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    comments: [
      {
        id: 1,
        user: { id: 2, name: 'Jane Smith', avatar_url: '/avatars/avatar2.png' },
        content: 'Congratulations! React is amazing once you get the hang of it.',
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      }
    ]
  },
  {
    id: 2,
    user: {
      id: 2,
      name: 'Jane Smith',
      avatar_url: '/avatars/avatar2.png'
    },
    content: 'Working on a full-stack project using Node.js and React. Any tips for handling authentication?',
    image_url: null,
    likes_count: 8,
    comments_count: 5,
    is_liked: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    comments: []
  }
];

export const mockLeaderboard = [
  {
    user_id: 1,
    name: 'John Doe',
    avatar_url: '/avatars/avatar1.png',
    xp_total: 1250,
    title: 'Rising Star',
    streak_count: 7
  },
  {
    user_id: 2,
    name: 'Jane Smith',
    avatar_url: '/avatars/avatar2.png',
    xp_total: 2100,
    title: 'Code Master',
    streak_count: 15
  },
  {
    user_id: 3,
    name: 'Mike Johnson',
    avatar_url: '/avatars/avatar3.png',
    xp_total: 1800,
    title: 'Learning Champion',
    streak_count: 12
  }
];

export const mockCVReviews = [
  {
    id: 1,
    user_id: 1,
    file_path: '/uploads/cv1.pdf',
    status: 'completed',
    result: {
      score: 78,
      strengths: [
        'Clear and concise formatting',
        'Good technical skills section',
        'Relevant project experience'
      ],
      areas_for_improvement: [
        'Add more quantifiable achievements',
        'Include soft skills section',
        'Consider adding a summary section'
      ],
      suggestions: [
        'Use action verbs in your experience descriptions',
        'Include specific technologies and tools used',
        'Add links to your portfolio or GitHub'
      ]
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export const mockSearchResults = {
  jobs: mockJobs.slice(0, 3),
  courses: [
    {
      id: 1,
      title: 'Complete React Course',
      description: 'Learn React from basics to advanced concepts',
      image_url: '/course-images/react-course.jpg',
      xp_reward: 100
    }
  ],
  posts: mockCommunityPosts.slice(0, 2),
  users: [
    {
      id: 2,
      name: 'Jane Smith',
      avatar_url: '/avatars/avatar2.png',
      title: 'Code Master'
    }
  ]
};

export const mockStats = {
  total_xp: 1250,
  quiz_completed: 8,
  challenges_completed: 3,
  longest_streak: 7,
  current_streak: 7,
  total_study_time: 45,
  courses_enrolled: 2,
  skills_learned: 6
};

export const mockRecentChats = [
  {
    id: 1,
    user: {
      id: 2,
      name: 'Jane Smith',
      avatar_url: '/avatars/avatar2.png'
    },
    last_message: 'Thanks for the help with React!',
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 2,
    user: {
      id: 3,
      name: 'Mike Johnson',
      avatar_url: '/avatars/avatar3.png'
    },
    last_message: 'Great job on the challenge!',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

// Mock API responses
export const mockApiResponses = {
  auth: {
    login: {
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    },
    register: {
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    }
  },
  dashboard: {
    user: mockUser,
    skills: mockSkills,
    recommendedJobs: mockJobs,
    recentActivities: mockActivities,
    roadmaps: mockRoadmaps
  },
  search: {
    global: mockSearchResults
  },
  leaderboard: {
    global: mockLeaderboard,
    streaks: mockLeaderboard,
    challenges: mockLeaderboard.map(entry => ({
      ...entry,
      challenges_completed: Math.floor(Math.random() * 10) + 1
    })),
    community: mockLeaderboard.map(entry => ({
      ...entry,
      posts_count: Math.floor(Math.random() * 20) + 1,
      likes_received: Math.floor(Math.random() * 100) + 1,
      comments_count: Math.floor(Math.random() * 50) + 1
    }))
  },
  activities: {
    list: mockActivities,
    stats: mockStats
  },
  community: {
    posts: mockCommunityPosts,
    recentChats: mockRecentChats
  },
  cv: {
    reviews: mockCVReviews,
    stats: {
      totalReviews: 1,
      averageScore: 78,
      improvementSuggestions: 3
    }
  }
};

export default mockApiResponses;