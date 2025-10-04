'use client';

import { Target, Clock, CheckCircle } from 'lucide-react';

interface RoadmapProgressProps {
  completedSteps: number;
  totalSteps: number;
  progressPercentage: number;
}

export default function RoadmapProgress({ 
  completedSteps, 
  totalSteps, 
  progressPercentage 
}: RoadmapProgressProps) {
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">{completedSteps}</span>
          </div>
          <p className="text-xs text-gray-600">Selesai</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-900">{totalSteps - completedSteps}</span>
          </div>
          <p className="text-xs text-gray-600">Tersisa</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Target className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">{totalSteps}</span>
          </div>
          <p className="text-xs text-gray-600">Total</p>
        </div>
      </div>
    </div>
  );
}
