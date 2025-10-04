'use client';

import { BookOpen, Clock, Target, Trophy, Users, Star } from 'lucide-react';

interface RoadmapFooterProps {
  roadmap: {
    id: number;
    title: string;
    description: string;
    progress?: {
      total_steps: number;
      completed_steps: number;
      progress_percentage: number;
    };
  };
  stats?: {
    totalStudents?: number;
    averageCompletionTime?: number;
    xpReward?: number;
    rating?: number;
  };
}

export default function RoadmapFooter({ roadmap, stats }: RoadmapFooterProps) {
  return (
    <div className="bg-white border-t border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {roadmap.title}
            </h3>
            <p className="text-sm text-gray-600">
              {roadmap.progress?.completed_steps || 0} dari {roadmap.progress?.total_steps || 0} langkah selesai
            </p>
          </div>
        </div>
        
        {stats && (
          <div className="flex items-center space-x-6">
            {stats.totalStudents && (
              <div className="text-center">
                <div className="flex items-center space-x-1 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">{stats.totalStudents}</span>
                </div>
                <p className="text-xs text-gray-600">Siswa</p>
              </div>
            )}
            
            {stats.averageCompletionTime && (
              <div className="text-center">
                <div className="flex items-center space-x-1 mb-1">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">{stats.averageCompletionTime}h</span>
                </div>
                <p className="text-xs text-gray-600">Waktu Rata-rata</p>
              </div>
            )}
            
            {stats.xpReward && (
              <div className="text-center">
                <div className="flex items-center space-x-1 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-900">{stats.xpReward}</span>
                </div>
                <p className="text-xs text-gray-600">XP Reward</p>
              </div>
            )}
            
            {stats.rating && (
              <div className="text-center">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">{stats.rating}/5</span>
                </div>
                <p className="text-xs text-gray-600">Rating</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}