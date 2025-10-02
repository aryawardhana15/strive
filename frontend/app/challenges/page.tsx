'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Challenge, UserChallenge } from '@/types';
import { auth } from '@/lib/auth';
import { usersAPI, challengesAPI } from '@/lib/api';
import { Flame, Play, Trophy, Clock, Target } from 'lucide-react';

export default function ChallengesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([]);
  const [monthlyChallenges, setMonthlyChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
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

        // Fetch challenges by type
        const [dailyResponse, weeklyResponse, monthlyResponse] = await Promise.all([
          challengesAPI.getByType('daily'),
          challengesAPI.getByType('weekly'),
          challengesAPI.getByType('monthly')
        ]);

        setDailyChallenges(dailyResponse.data.data || []);
        setWeeklyChallenges(weeklyResponse.data.data || []);
        setMonthlyChallenges(monthlyResponse.data.data || []);
        setUserChallenges([]);

      } catch (error) {
        console.error('Error initializing challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeChallenges();
  }, [router]);

  const getUserChallengeStatus = (challengeId: number) => {
    return userChallenges.find(uc => uc.challenge_id === challengeId);
  };

  const handleStartChallenge = async (challenge: Challenge) => {
    try {
      await challengesAPI.start(challenge.id);
      router.push(`/challenges/${challenge.id}`);
    } catch (error) {
      console.error('Error starting challenge:', error);
    }
  };

  const getChallengeButtonText = (challenge: Challenge) => {
    const userChallenge = getUserChallengeStatus(challenge.id);
    if (!userChallenge) return 'Kerjakan Sekarang';
    
    switch (userChallenge.status) {
      case 'completed':
        return 'Lihat Hasil';
      case 'in_progress':
        return 'Lanjutkan';
      case 'failed':
        return 'Coba Lagi';
      default:
        return 'Kerjakan Sekarang';
    }
  };

  const getChallengeButtonColor = (challenge: Challenge) => {
    const userChallenge = getUserChallengeStatus(challenge.id);
    if (!userChallenge) return 'bg-green-600 hover:bg-green-700';
    
    switch (userChallenge.status) {
      case 'completed':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'in_progress':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'failed':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-green-600 hover:bg-green-700';
    }
  };

  const ChallengeCard = ({ challenge, type }: { challenge: Challenge; type: 'daily' | 'weekly' | 'monthly' }) => {
    const colors = {
      daily: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        button: 'bg-green-600 hover:bg-green-700',
        header: 'bg-green-100'
      },
      weekly: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700',
        header: 'bg-blue-100'
      },
      monthly: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700',
        header: 'bg-purple-100'
      }
    };

    const typeColors = colors[type];

    return (
      <div className={`${typeColors.bg} ${typeColors.border} border rounded-xl p-4`}>
        <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-gray-900">Reward: +{challenge.xp_reward} XP</span>
        </div>
        
        <button
          onClick={() => handleStartChallenge(challenge)}
          className={`w-full ${getChallengeButtonColor(challenge)} text-white font-medium py-2 px-4 rounded-lg transition-colors`}
        >
          {getChallengeButtonText(challenge)}
        </button>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-orange-500" />
            Level Up dengan Tantangan 🔥
          </h1>
          <p className="text-gray-600 mt-2">
            Uji kemampuanmu, kumpulkan XP, dan pertahankan streak belajarmu!
          </p>
        </div>
      </div>

      {/* Challenge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{dailyChallenges.length}</div>
          <div className="text-sm text-gray-600">Tantangan Harian</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{weeklyChallenges.length}</div>
          <div className="text-sm text-gray-600">Tantangan Mingguan</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{monthlyChallenges.length}</div>
          <div className="text-sm text-gray-600">Tantangan Bulanan</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {userChallenges.filter(uc => uc.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Selesai</div>
        </div>
      </div>

      {/* Challenge Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Challenges */}
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tantangan Harian</h2>
            <span className="bg-green-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
              {dailyChallenges.length}
            </span>
          </div>
          
          <div className="space-y-4">
            {dailyChallenges.length > 0 ? (
              dailyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="daily" />
              ))
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <Target className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600">Tidak ada tantangan harian tersedia</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div className="space-y-4">
          <div className="bg-blue-100 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tantangan Mingguan</h2>
            <span className="bg-blue-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
              {weeklyChallenges.length}
            </span>
          </div>
          
          <div className="space-y-4">
            {weeklyChallenges.length > 0 ? (
              weeklyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="weekly" />
              ))
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <Target className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-gray-600">Tidak ada tantangan mingguan tersedia</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Challenges */}
        <div className="space-y-4">
          <div className="bg-purple-100 border border-purple-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tantangan Bulanan</h2>
            <span className="bg-purple-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
              {monthlyChallenges.length}
            </span>
          </div>
          
          <div className="space-y-4">
            {monthlyChallenges.length > 0 ? (
              monthlyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="monthly" />
              ))
            ) : (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
                <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <p className="text-gray-600">Tidak ada tantangan bulanan tersedia</p>
              </div>
            )}
          </div>
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
