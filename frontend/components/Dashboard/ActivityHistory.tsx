'use client';

import { Activity } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { 
  BookOpen, 
  Trophy, 
  FileText, 
  Flame, 
  MessageSquare, 
  TrendingUp,
  Plus
} from 'lucide-react';

interface ActivityHistoryProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'quiz_complete':
      return <BookOpen className="w-4 h-4 text-blue-600" />;
    case 'challenge_complete':
      return <Trophy className="w-4 h-4 text-yellow-600" />;
    case 'cv_review':
      return <FileText className="w-4 h-4 text-green-600" />;
    case 'streak_achieved':
      return <Flame className="w-4 h-4 text-orange-600" />;
    case 'community_post':
      return <MessageSquare className="w-4 h-4 text-purple-600" />;
    case 'rank_change':
      return <TrendingUp className="w-4 h-4 text-indigo-600" />;
    case 'skill_added':
      return <Plus className="w-4 h-4 text-pink-600" />;
    default:
      return <BookOpen className="w-4 h-4 text-gray-600" />;
  }
};

const getActivityText = (activity: Activity) => {
  switch (activity.type) {
    case 'quiz_complete':
      return `Diselesaikan dengan skor ${activity.meta?.score || 'N/A'}%`;
    case 'challenge_complete':
      return `Challenge selesai dengan skor ${activity.meta?.score || 'N/A'}%`;
    case 'cv_review':
      return `StriveAI feedback: kata kunci sudah kuat, ta...`;
    case 'streak_achieved':
      return `Mencapai Streak ${activity.meta?.streak_days || 'N/A'} Hari!`;
    case 'community_post':
      return 'Membuat post di komunitas';
    case 'rank_change':
      return 'Peringkat naik!';
    case 'skill_added':
      return 'Menambahkan skill baru';
    default:
      return 'Aktivitas baru';
  }
};

export default function ActivityHistory({ activities }: ActivityHistoryProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Riwayat Aktivitas</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Lihat Semua →
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                {getActivityText(activity)}
              </p>
              <p className="text-xs text-gray-500">
                {formatRelativeTime(activity.created_at)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-sm font-medium text-green-600">
                +{activity.xp_earned} XP
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
