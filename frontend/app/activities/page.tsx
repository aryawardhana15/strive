'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Activity, ActivityStats } from '@/types';
import { auth } from '@/lib/auth';
import { activitiesAPI } from '@/lib/api';
import { 
  Trophy, 
  Target, 
  FileText, 
  MessageCircle, 
  TrendingUp, 
  Star,
  CheckCircle,
  Award,
  BookOpen,
  Code,
  Calendar,
  Filter
} from 'lucide-react';

export default function ActivitiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const initializeActivities = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch activities and stats
        const [activitiesResponse, statsResponse] = await Promise.all([
          activitiesAPI.getUserActivities(currentUser.id, { page: 1, limit: 20 }),
          activitiesAPI.getStats(currentUser.id)
        ]);

        setActivities(activitiesResponse.data.data || []);
        setStats(statsResponse.data.data || null);
        setHasMore(activitiesResponse.data.data.length === 20);

      } catch (error) {
        console.error('Error initializing activities page:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeActivities();
  }, [router]);

  const loadMoreActivities = async () => {
    if (!user || !hasMore) return;

    try {
      const nextPage = page + 1;
      const response = await activitiesAPI.getUserActivities(user.id, { 
        page: nextPage, 
        limit: 20,
        type: filter !== 'all' ? filter : undefined
      });

      const newActivities = response.data.data || [];
      setActivities(prev => [...prev, ...newActivities]);
      setPage(nextPage);
      setHasMore(newActivities.length === 20);

    } catch (error) {
      console.error('Error loading more activities:', error);
    }
  };

  const handleFilterChange = async (newFilter: string) => {
    if (!user) return;

    setFilter(newFilter);
    setPage(1);
    setLoading(true);

    try {
      const response = await activitiesAPI.getUserActivities(user.id, { 
        page: 1, 
        limit: 20,
        type: newFilter !== 'all' ? newFilter : undefined
      });

      setActivities(response.data.data || []);
      setHasMore(response.data.data.length === 20);

    } catch (error) {
      console.error('Error filtering activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'challenge_complete':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'cv_review':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'streak_achieved':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'community_post':
        return <MessageCircle className="w-5 h-5 text-indigo-500" />;
      case 'rank_change':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      case 'course_enrolled':
        return <BookOpen className="w-5 h-5 text-teal-500" />;
      case 'skill_added':
        return <Code className="w-5 h-5 text-pink-500" />;
      default:
        return <Award className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case 'quiz_complete':
        return `Menyelesaikan quiz: ${activity.meta?.step_title || 'Unknown Step'}`;
      case 'challenge_complete':
        return `Menyelesaikan challenge: ${activity.meta?.challenge_title || 'Unknown Challenge'}`;
      case 'cv_review':
        return 'Mengupload dan menganalisis CV';
      case 'streak_achieved':
        return `Mencapai streak ${activity.meta?.streak_count || 0} hari`;
      case 'community_post':
        return 'Membuat post di komunitas';
      case 'rank_change':
        return `Naik ke peringkat ${activity.meta?.new_rank || 'Unknown'}`;
      case 'course_enrolled':
        return `Mendaftar course: ${activity.meta?.course_title || 'Unknown Course'}`;
      case 'skill_added':
        return `Menambahkan skill: ${activity.meta?.skill_name || 'Unknown Skill'}`;
      default:
        return 'Aktivitas baru';
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'quiz_complete':
        return `Skor: ${activity.meta?.score || 0}%`;
      case 'challenge_complete':
        return `Tipe: ${activity.meta?.challenge_type || 'Unknown'}`;
      case 'cv_review':
        return `Skor CV: ${activity.meta?.cv_score || 0}/100`;
      case 'streak_achieved':
        return 'Pertahankan konsistensi belajarmu!';
      case 'community_post':
        return 'Terima kasih telah berbagi dengan komunitas';
      case 'rank_change':
        return `Dari peringkat ${activity.meta?.old_rank || 'Unknown'}`;
      case 'course_enrolled':
        return 'Selamat memulai perjalanan belajar baru!';
      case 'skill_added':
        return `Level: ${activity.meta?.skill_level || 'Unknown'}`;
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    if (diffInHours < 48) return 'Kemarin';
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filterOptions = [
    { value: 'all', label: 'Semua Aktivitas', icon: Calendar },
    { value: 'quiz_complete', label: 'Quiz', icon: CheckCircle },
    { value: 'challenge_complete', label: 'Challenge', icon: Target },
    { value: 'cv_review', label: 'CV Review', icon: FileText },
    { value: 'streak_achieved', label: 'Streak', icon: Star },
    { value: 'community_post', label: 'Komunitas', icon: MessageCircle },
    { value: 'rank_change', label: 'Peringkat', icon: TrendingUp }
  ];

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aktivitas</h1>
          <p className="text-gray-600 mt-1">
            Riwayat lengkap aktivitas dan pencapaianmu
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total XP</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_xp.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quiz Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{stats.quiz_completed}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Challenge Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{stats.challenges_completed}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak Terpanjang</p>
                <p className="text-2xl font-bold text-gray-900">{stats.longest_streak}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Riwayat Aktivitas</h2>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="card">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getActivityTitle(activity)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getActivityDescription(activity)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {activity.xp_earned > 0 && (
                      <div className="flex items-center space-x-1 text-sm text-green-600">
                        <span className="font-medium">+{activity.xp_earned}</span>
                        <span>XP</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMoreActivities}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {activities.length === 0 && !loading && (
        <div className="card">
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada aktivitas
            </h3>
            <p className="text-gray-600">
              Mulai belajar untuk melihat aktivitas dan pencapaianmu di sini.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}