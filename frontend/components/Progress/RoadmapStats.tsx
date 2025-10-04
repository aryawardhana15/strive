'use client';

import { BookOpen, Clock, Target, Trophy } from 'lucide-react';

interface RoadmapStatsProps {
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  estimatedTime?: number;
  xpEarned?: number;
}

export default function RoadmapStats({ 
  totalSteps, 
  completedSteps, 
  progressPercentage,
  estimatedTime,
  xpEarned
}: RoadmapStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Steps */}
      <div className="text-center">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <BookOpen className="w-5 h-5 text-primary-600" />
        </div>
        <p className="text-sm text-gray-600">Total Langkah</p>
        <p className="text-lg font-semibold text-gray-900">{totalSteps}</p>
      </div>

      {/* Completed Steps */}
      <div className="text-center">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Target className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-sm text-gray-600">Selesai</p>
        <p className="text-lg font-semibold text-gray-900">{completedSteps}</p>
      </div>

      {/* Progress */}
      <div className="text-center">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-sm text-gray-600">Progress</p>
        <p className="text-lg font-semibold text-gray-900">{progressPercentage}%</p>
      </div>

      {/* XP Earned */}
      <div className="text-center">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
        </div>
        <p className="text-sm text-gray-600">XP Diperoleh</p>
        <p className="text-lg font-semibold text-gray-900">{xpEarned || 0}</p>
      </div>
    </div>
  );
}
