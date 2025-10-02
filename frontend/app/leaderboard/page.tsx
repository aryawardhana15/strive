'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { auth } from '@/lib/auth';
import { usersAPI, leaderboardAPI } from '@/lib/api';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  Flame, 
  TrendingUp,
  Users,
  Target,
  Zap
} from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  xp_total: number;
  streak_count: number;
  title: string;
  rank: number;
}

export default function LeaderboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'streaks' | 'challenges' | 'community'>('global');
  const router = useRouter();

  useEffect(() => {
    const initializeLeaderboard = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch leaderboard data
        const [globalResponse] = await Promise.all([
          leaderboardAPI.getGlobal({ limit: 50 })
        ]);

        setLeaderboard(globalResponse.data.data || []);
        setUserRank(null);

      } catch (error) {
        console.error('Error initializing leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeLeaderboard();
  }, [router]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatXP = (xp: number) => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toLocaleString();
  };

  const tabs = [
    { id: 'global', label: 'Global', icon: Trophy },
    { id: 'streaks', label: 'Streaks', icon: Flame },
    { id: 'challenges', label: 'Tantangan', icon: Target },
    { id: 'community', label: 'Komunitas', icon: Users }
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
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-600 mt-2">
            Lihat peringkat pengguna terbaik di platform Strive.
          </p>
        </div>
      </div>

      {/* User Rank Card */}
      {userRank && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {userRank.avatar_url ? (
                  <img 
                    src={userRank.avatar_url} 
                    alt={userRank.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-blue-600">
                    {userRank.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{userRank.name}</h3>
                <p className="text-gray-600">{userRank.title}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{formatXP(userRank.xp_total)} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{userRank.streak_count} hari</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getRankBadgeColor(userRank.rank)}`}>
                {getRankIcon(userRank.rank)}
                <span className="font-semibold">Peringkat #{userRank.rank}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="space-y-4">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                  entry.id === user?.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {entry.avatar_url ? (
                      <img 
                        src={entry.avatar_url} 
                        alt={entry.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-600">
                        {entry.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {entry.name}
                      {entry.id === user?.id && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          Kamu
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm">{entry.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4" />
                      <span className="font-semibold">{formatXP(entry.xp_total)}</span>
                    </div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-600">
                      <Flame className="w-4 h-4" />
                      <span className="font-semibold">{entry.streak_count}</span>
                    </div>
                    <div className="text-xs text-gray-500">Streak</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data</h3>
              <p className="text-gray-600">Leaderboard akan muncul setelah ada aktivitas pengguna.</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{leaderboard.length}</div>
          <div className="text-sm text-gray-600">Total Pengguna</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {leaderboard.length > 0 ? formatXP(leaderboard[0]?.xp_total || 0) : '0'}
          </div>
          <div className="text-sm text-gray-600">XP Tertinggi</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {leaderboard.length > 0 ? leaderboard[0]?.streak_count || 0 : 0}
          </div>
          <div className="text-sm text-gray-600">Streak Terpanjang</div>
        </div>
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
