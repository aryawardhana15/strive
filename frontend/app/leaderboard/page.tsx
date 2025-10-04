'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LeaderboardEntry, ChallengeLeaderboardEntry, CommunityLeaderboardEntry } from '@/types';
import { auth } from '@/lib/auth';
import { leaderboardAPI } from '@/lib/api';
import { Trophy, Medal, Star, TrendingUp, Users, Target, MessageCircle, Heart } from 'lucide-react';

export default function LeaderboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'streaks' | 'challenges' | 'community'>('global');
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streakLeaderboard, setStreakLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challengeLeaderboard, setChallengeLeaderboard] = useState<ChallengeLeaderboardEntry[]>([]);
  const [communityLeaderboard, setCommunityLeaderboard] = useState<CommunityLeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

        // Fetch all leaderboard data
        const [
          globalResponse,
          streakResponse,
          challengeResponse,
          communityResponse,
          userRankResponse
        ] = await Promise.all([
          leaderboardAPI.getGlobal({ limit: 50 }),
          leaderboardAPI.getStreaks({ limit: 50 }),
          leaderboardAPI.getChallenges({ limit: 50 }),
          leaderboardAPI.getCommunity({ limit: 50 }),
          leaderboardAPI.getUserContext(currentUser.id)
        ]);

        setGlobalLeaderboard(globalResponse.data.data || []);
        setStreakLeaderboard(streakResponse.data.data || []);
        setChallengeLeaderboard(challengeResponse.data.data || []);
        setCommunityLeaderboard(communityResponse.data.data || []);
        setUserRank(userRankResponse.data.data || null);

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
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const formatXP = (xp: number) => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  };

  const formatStreak = (streak: number) => {
    return `${streak} hari`;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">
            Lihat peringkat dan prestasi terbaik
          </p>
        </div>
        
        {/* User Rank Card */}
        {userRank && (
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Peringkatmu</p>
                <p className="text-lg font-bold text-gray-900">#{userRank.global_rank}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'global', label: 'Global', icon: Trophy },
            { id: 'streaks', label: 'Streak', icon: Star },
            { id: 'challenges', label: 'Challenge', icon: Target },
            { id: 'community', label: 'Komunitas', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global Leaderboard */}
      {activeTab === 'global' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Peringkat Global</h2>
            <span className="text-sm text-gray-600">Berdasarkan Total XP</span>
          </div>
          
          <div className="space-y-3">
            {globalLeaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`card ${getRankColor(index + 1)} ${
                  entry.user_id === user.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <img
                    src={entry.avatar_url || '/default-avatar.png'}
                    alt={entry.name}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                      {entry.user_id === user.id && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                          Kamu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{entry.title}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatXP(entry.xp_total)}</p>
                    <p className="text-sm text-gray-600">XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak Leaderboard */}
      {activeTab === 'streaks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Peringkat Streak</h2>
            <span className="text-sm text-gray-600">Berdasarkan Streak Terpanjang</span>
          </div>
          
          <div className="space-y-3">
            {streakLeaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`card ${getRankColor(index + 1)} ${
                  entry.user_id === user.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <img
                    src={entry.avatar_url || '/default-avatar.png'}
                    alt={entry.name}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                      {entry.user_id === user.id && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                          Kamu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{entry.title}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatStreak(entry.streak_count)}</p>
                    <p className="text-sm text-gray-600">Streak</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenge Leaderboard */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Peringkat Challenge</h2>
            <span className="text-sm text-gray-600">Berdasarkan Challenge Selesai</span>
          </div>
          
          <div className="space-y-3">
            {challengeLeaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`card ${getRankColor(index + 1)} ${
                  entry.user_id === user.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <img
                    src={entry.avatar_url || '/default-avatar.png'}
                    alt={entry.name}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                      {entry.user_id === user.id && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                          Kamu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{entry.title}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{entry.challenges_completed}</p>
                    <p className="text-sm text-gray-600">Challenge</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Leaderboard */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Peringkat Komunitas</h2>
            <span className="text-sm text-gray-600">Berdasarkan Aktivitas Komunitas</span>
          </div>
          
          <div className="space-y-3">
            {communityLeaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`card ${getRankColor(index + 1)} ${
                  entry.user_id === user.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <img
                    src={entry.avatar_url || '/default-avatar.png'}
                    alt={entry.name}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                      {entry.user_id === user.id && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                          Kamu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{entry.title}</p>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{entry.posts_count}</p>
                      <p className="text-gray-600">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{entry.likes_received}</p>
                      <p className="text-gray-600">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{entry.comments_count}</p>
                      <p className="text-gray-600">Comments</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'global' && globalLeaderboard.length === 0) ||
        (activeTab === 'streaks' && streakLeaderboard.length === 0) ||
        (activeTab === 'challenges' && challengeLeaderboard.length === 0) ||
        (activeTab === 'community' && communityLeaderboard.length === 0)) && (
        <div className="card">
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada data leaderboard
            </h3>
            <p className="text-gray-600">
              Mulai belajar dan berinteraksi untuk muncul di leaderboard!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}