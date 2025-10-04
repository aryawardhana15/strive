'use client';

import { Trophy, Clock, BookOpen, CheckCircle, Target } from 'lucide-react';
import { User, LearningProgress } from '@/types';

interface StatisticsWidgetProps {
  user: User | null;
  progress: LearningProgress | null;
  userRank: number | null;
}

export default function StatisticsWidget({ user, progress, userRank }: StatisticsWidgetProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Rank */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Rank</p>
            <p className="text-xl font-semibold text-gray-900">
              #{userRank || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Total XP */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total XP</p>
            <p className="text-xl font-semibold text-gray-900">
              {user?.xp_total || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Study Time */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Study Time</p>
            <p className="text-xl font-semibold text-gray-900">
              {user?.study_time || 0}h
            </p>
          </div>
        </div>
      </div>

      {/* Active Courses */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Courses</p>
            <p className="text-xl font-semibold text-gray-900">
              {progress?.active_courses || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Completed Courses */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed Courses</p>
            <p className="text-xl font-semibold text-gray-900">
              {progress?.completed_courses || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
