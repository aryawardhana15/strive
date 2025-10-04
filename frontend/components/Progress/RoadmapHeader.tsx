'use client';

import { BookOpen, Clock, Target, Trophy, Users, Star } from 'lucide-react';

interface RoadmapHeaderProps {
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

export default function RoadmapHeader({ roadmap, stats }: RoadmapHeaderProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-8 h-8 text-primary-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {roadmap.title}
          </h1>
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
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${roadmap.progress.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.totalStudents && (
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">Siswa</p>
                <p className="text-sm font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            )}
            
            {stats.averageCompletionTime && (
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">Waktu Rata-rata</p>
                <p className="text-sm font-semibold text-gray-900">{stats.averageCompletionTime}h</p>
              </div>
            )}
            
            {stats.xpReward && (
              <div className="text-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-xs text-gray-600">XP Reward</p>
                <p className="text-sm font-semibold text-gray-900">{stats.xpReward}</p>
              </div>
            )}
            
            {stats.rating && (
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-gray-600">Rating</p>
                <p className="text-sm font-semibold text-gray-900">{stats.rating}/5</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}