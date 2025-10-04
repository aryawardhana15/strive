'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Challenge, User } from '@/types';
import { auth } from '@/lib/auth';
import { challengesAPI } from '@/lib/api';
import { Trophy, Clock, Zap, Target, Play, CheckCircle } from 'lucide-react';
import ConfirmationModal from '@/components/Challenges/ConfirmationModal';
import PodiumLeaderboard from '@/components/Leaderboard/PodiumLeaderboard';

export default function ChallengesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<{
    daily: Challenge[];
    weekly: Challenge[];
    monthly: Challenge[];
  }>({ daily: [], weekly: [], monthly: [] });
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const initializeChallenges = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch challenges and leaderboard data
        const [challengesResponse, leaderboardResponse] = await Promise.all([
          challengesAPI.getAll(),
          challengesAPI.getLeaderboard()
        ]);
        
        setChallenges(challengesResponse.data.data || { daily: [], weekly: [], monthly: [] });
        setLeaderboardData(leaderboardResponse.data.data || []);

      } catch (error) {
        console.error('Error initializing challenges page:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeChallenges();
  }, [router]);

  const handleStartChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowConfirmation(true);
  };

  const handleConfirmChallenge = async () => {
    if (!selectedChallenge) return;
    
    try {
      await challengesAPI.start(selectedChallenge.id);
      setShowConfirmation(false);
      setSelectedChallenge(null);
      router.push(`/challenges/${selectedChallenge.id}`);
    } catch (error) {
      console.error('Error starting challenge:', error);
    }
  };

  const handleCancelChallenge = () => {
    setShowConfirmation(false);
    setSelectedChallenge(null);
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Clock className="w-5 h-5" />;
      case 'weekly':
        return <Zap className="w-5 h-5" />;
      case 'monthly':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'weekly':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'monthly':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getChallengeStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-600';
      case 'failed':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Level Up dengan Tantangan 🔥
        </h1>
        <p className="text-gray-600 text-lg">
          Uji kemampuanmu, kumpulkan XP, dan pertahankan streak belajarmu!
        </p>
      </div>

      {/* Challenge Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Challenges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800">Tantangan Harian</h2>
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {challenges.daily.length}
            </span>
          </div>
          <div className="space-y-4">
            {challenges.daily.map((challenge) => (
              <div key={challenge.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {challenge.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {challenge.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-green-600">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Reward: +{challenge.xp_reward} XP</span>
                  </div>
                  {challenge.user_progress?.status === 'completed' ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Selesai</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartChallenge(challenge)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Kerjakan Sekarang
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800">Tantangan Mingguan</h2>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {challenges.weekly.length}
            </span>
          </div>
          <div className="space-y-4">
            {challenges.weekly.map((challenge) => (
              <div key={challenge.id} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {challenge.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {challenge.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Reward: +{challenge.xp_reward} XP</span>
                  </div>
                  {challenge.user_progress?.status === 'completed' ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Selesai</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartChallenge(challenge)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Kerjakan Sekarang
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Challenges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <h2 className="text-lg font-semibold text-purple-800">Tantangan Bulanan</h2>
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {challenges.monthly.length}
            </span>
          </div>
          <div className="space-y-4">
            {challenges.monthly.map((challenge) => (
              <div key={challenge.id} className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {challenge.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {challenge.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-purple-600">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Reward: +{challenge.xp_reward} XP</span>
                  </div>
                  {challenge.user_progress?.status === 'completed' ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Selesai</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartChallenge(challenge)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      Kerjakan Sekarang
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Challenge Leaderboard */}
      <PodiumLeaderboard 
        users={leaderboardData}
        title="Leaderboard Tantangan"
        showViewAll={true}
        onViewAll={() => router.push('/leaderboard')}
      />

      {/* Confirmation Modal */}
      {showConfirmation && selectedChallenge && (
        <ConfirmationModal
          challenge={selectedChallenge}
          onConfirm={handleConfirmChallenge}
          onCancel={handleCancelChallenge}
        />
      )}
    </div>
  );
}