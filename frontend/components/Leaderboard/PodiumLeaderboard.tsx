'use client';

import { Trophy, Medal, Award, Crown, Star, Zap } from 'lucide-react';

interface LeaderboardUser {
  id: number;
  name: string;
  title: string;
  challenges_completed: number;
  xp_total: number;
  avatar_url?: string;
  rank: number;
}

interface PodiumLeaderboardProps {
  users: LeaderboardUser[];
  title?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export default function PodiumLeaderboard({ 
  users, 
  title = "Leaderboard Tantangan", 
  showViewAll = true,
  onViewAll 
}: PodiumLeaderboardProps) {
  // Sort users by rank and take top 3 for podium
  const top3Users = users.slice(0, 3);
  const otherUsers = users.slice(3);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-gray-200 to-gray-400';
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-24';
      case 2:
        return 'h-20';
      case 3:
        return 'h-16';
      default:
        return 'h-12';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-purple-100 text-sm">Top performers this week</p>
            </div>
          </div>
          {showViewAll && (
            <button
              onClick={onViewAll}
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Lihat Semua →
            </button>
          )}
        </div>
      </div>

      {/* Podium Section */}
      <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="flex items-end justify-center space-x-4 mb-8">
          {/* 2nd Place */}
          {top3Users[1] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                  {top3Users[1].avatar_url ? (
                    <img 
                      src={top3Users[1].avatar_url} 
                      alt={top3Users[1].name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {top3Users[1].name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  2
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 text-sm">{top3Users[1].name}</h3>
                <p className="text-xs text-gray-600">{top3Users[1].title}</p>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Zap className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{top3Users[1].xp_total} XP</span>
                </div>
              </div>
              <div className={`w-20 ${getPodiumHeight(2)} bg-gradient-to-t ${getRankColor(2)} rounded-t-lg mt-4 shadow-lg flex items-center justify-center`}>
                <Medal className="w-6 h-6 text-white" />
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top3Users[0] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-yellow-200">
                  {top3Users[0].avatar_url ? (
                    <img 
                      src={top3Users[0].avatar_url} 
                      alt={top3Users[0].name}
                      className="w-18 h-18 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-18 h-18 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {top3Users[0].name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="absolute -top-1 -left-1">
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-900">{top3Users[0].name}</h3>
                <p className="text-sm text-gray-600">{top3Users[0].title}</p>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-600">{top3Users[0].xp_total} XP</span>
                </div>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Trophy className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{top3Users[0].challenges_completed} Tantangan</span>
                </div>
              </div>
              <div className={`w-24 ${getPodiumHeight(1)} bg-gradient-to-t ${getRankColor(1)} rounded-t-lg mt-4 shadow-xl flex items-center justify-center relative`}>
                <Crown className="w-8 h-8 text-white" />
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Star className="w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3Users[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                  {top3Users[2].avatar_url ? (
                    <img 
                      src={top3Users[2].avatar_url} 
                      alt={top3Users[2].name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {top3Users[2].name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  3
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 text-sm">{top3Users[2].name}</h3>
                <p className="text-xs text-gray-600">{top3Users[2].title}</p>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-gray-600">{top3Users[2].xp_total} XP</span>
                </div>
              </div>
              <div className={`w-20 ${getPodiumHeight(3)} bg-gradient-to-t ${getRankColor(3)} rounded-t-lg mt-4 shadow-lg flex items-center justify-center`}>
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Other Users List */}
        {otherUsers.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Other Top Performers</h3>
            <div className="space-y-3">
              {otherUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {user.rank}
                    </div>
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{user.name}</h4>
                    <p className="text-xs text-gray-600">{user.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{user.xp_total} XP</span>
                    </div>
                    <p className="text-xs text-gray-500">{user.challenges_completed} Tantangan</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
