'use client';

import { Flame, Trophy, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  onClick?: () => void;
}

export default function StatsCard({ icon, title, value, color, onClick }: StatsCardProps) {
  return (
    <div
      className={`card cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function StreakCard({ streakCount }: { streakCount: number }) {
  const router = useRouter();
  
  return (
    <StatsCard
      icon={<Flame className="w-6 h-6 text-yellow-600" />}
      title="Streaks"
      value={`${streakCount} Hari`}
      color="bg-yellow-100"
      onClick={() => router.push('/activities')}
    />
  );
}

export function RankCard({ rank }: { rank: number }) {
  const router = useRouter();
  
  return (
    <StatsCard
      icon={<Trophy className="w-6 h-6 text-green-600" />}
      title="Peringkat"
      value={`⬆ ${rank}`}
      color="bg-green-100"
      onClick={() => router.push('/leaderboard')}
    />
  );
}

export function TitleCard({ title }: { title: string }) {
  return (
    <StatsCard
      icon={<Award className="w-6 h-6 text-purple-600" />}
      title="Julukan"
      value={title}
      color="bg-purple-100"
    />
  );
}
