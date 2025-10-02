'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Activity } from '@/types';
import { auth } from '@/lib/auth';
import { usersAPI } from '@/lib/api';
import { 
  Trophy, 
  BookOpen, 
  FileText, 
  Flame, 
  Users, 
  TrendingUp, 
  Plus,
  Star,
  Clock,
  Filter,
  Calendar
} from 'lucide-react';

export default function ActivitiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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

        // Fetch activities
        const response = await usersAPI.getActivities(currentUser.id, { 
          limit: 20, 
          page: 1
        });

        setActivities(response.data.data.activities || []);
        setHasMore(response.data.data.hasMore || false);

      } catch (error) {
        console.error('Error initializing activities:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeActivities();
  }, [router, filter]);

  const loadMoreActivities = async () => {
    if (!hasMore || loading) return;

    try {
      const response = await usersAPI.getActivities(user!.id, { 
        limit: 20, 
        page: page + 1
      });

      setActivities(prev => [...prev, ...(response.data.data.activities || [])]);
      setHasMore(response.data.data.hasMore || false);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more activities:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_complete':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'challenge_complete':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'cv_review':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'streak_achieved':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'community_post':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'rank_change':
        return <TrendingUp className="w-5 h-5 text-indigo-500" />;
      case 'skill_added':
        return <Plus className="w-5 h-5 text-pink-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityTitle = (type: string, meta: any) => {
    switch (type) {
      case 'quiz_complete':
        return `Menyelesaikan Quiz: ${meta?.quiz_title || 'Quiz'}`;
      case 'challenge_complete':
        return `Menyelesaikan Tantangan: ${meta?.challenge_title || 'Tantangan'}`;
      case 'cv_review':
        return 'Mengunggah CV untuk Review';
      case 'streak_achieved':
        return `Mencapai Streak ${meta?.streak_count || 0} hari`;
      case 'community_post':
        return 'Membuat Post di Komunitas';
      case 'rank_change':
        return `Peringkat naik ke #${meta?.new_rank || 0}`;
      case 'skill_added':
        return `Menambahkan Skill: ${meta?.skill_name || 'Skill Baru'}`;
      default:
        return 'Aktivitas Baru';
    }
  };

  const getActivityDescription = (type: string, meta: any) => {
    switch (type) {
      case 'quiz_complete':
        return `Skor: ${meta?.score || 0}%`;
      case 'challenge_complete':
        return `Tantangan ${meta?.challenge_type || 'umum'} selesai`;
      case 'cv_review':
        return 'CV sedang dianalisis oleh AI';
      case 'streak_achieved':
        return 'Terus pertahankan streak belajarmu!';
      case 'community_post':
        return 'Post berhasil dipublikasikan';
      case 'rank_change':
        return `Dari peringkat #${meta?.old_rank || 0}`;
      case 'skill_added':
        return `Level: ${meta?.skill_level || 'Beginner'}`;
      default:
        return '';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filterOptions = [
    { value: 'all', label: 'Semua Aktivitas' },
    { value: 'quiz_complete', label: 'Quiz' },
    { value: 'challenge_complete', label: 'Tantangan' },
    { value: 'cv_review', label: 'CV Review' },
    { value: 'streak_achieved', label: 'Streak' },
    { value: 'community_post', label: 'Komunitas' },
    { value: 'skill_added', label: 'Skill' },
    { value: 'rank_change', label: 'Peringkat' }
  ];

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            Aktivitas & Riwayat
          </h1>
          <p className="text-gray-600 mt-2">
            Lihat semua aktivitas dan pencapaianmu di platform Strive.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
          <div className="text-sm text-gray-600">Total Aktivitas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {activities.filter(a => a.type === 'quiz_complete').length}
          </div>
          <div className="text-sm text-gray-600">Quiz Selesai</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {activities.filter(a => a.type === 'challenge_complete').length}
          </div>
          <div className="text-sm text-gray-600">Tantangan Selesai</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {activities.reduce((sum, a) => sum + (a.xp_earned || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total XP</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {getActivityTitle(activity.type, activity.meta)}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {getActivityDescription(activity.type, activity.meta)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatTimeAgo(activity.created_at)}
                    </div>
                    {activity.xp_earned > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Star className="w-4 h-4" />
                        +{activity.xp_earned} XP
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada aktivitas</h3>
            <p className="text-gray-600">Mulai belajar untuk melihat aktivitasmu di sini!</p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && activities.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadMoreActivities}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </div>

      {/* AI Assistant Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span className="text-sm font-medium">Tanya StriveAI ✨</span>
        </button>
      </div>
    </div>
  );
}
