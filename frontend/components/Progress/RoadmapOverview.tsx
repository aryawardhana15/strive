'use client';

import { BookOpen, Clock, Target, Trophy, Users } from 'lucide-react';

interface RoadmapOverviewProps {
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
  };
}

export default function RoadmapOverview({ roadmap, stats }: RoadmapOverviewProps) {
  return (
    <div className="card">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-primary-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {roadmap.title}
          </h2>
          <p className="text-gray-600 mb-4">
            {roadmap.description}
          </p>
          
          {roadmap.progress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">
                  {roadmap.progress.completed_steps}/{roadmap.progress.total_steps} langkah
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${roadmap.progress.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            {stats.totalStudents && (
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">Siswa</p>
                <p className="text-sm font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            )}
            
            {stats.averageCompletionTime && (
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">Waktu Rata-rata</p>
                <p className="text-sm font-semibold text-gray-900">{stats.averageCompletionTime}h</p>
              </div>
            )}
            
            {stats.xpReward && (
              <div className="text-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-xs text-gray-600">XP Reward</p>
                <p className="text-sm font-semibold text-gray-900">{stats.xpReward}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
