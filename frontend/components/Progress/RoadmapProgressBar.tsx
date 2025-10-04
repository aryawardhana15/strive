'use client';

import { CheckCircle, Lock, Play } from 'lucide-react';

interface RoadmapProgressBarProps {
  steps: Array<{
    id: number;
    title: string;
    completed: boolean;
    is_locked?: boolean;
  }>;
  currentStep?: number;
}

export default function RoadmapProgressBar({ steps, currentStep }: RoadmapProgressBarProps) {
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Overview */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Progress Roadmap</h3>
            <p className="text-sm text-gray-600">
              {completedSteps} dari {steps.length} langkah selesai
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              {Math.round(progressPercentage)}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = step.completed;
            const isLocked = step.is_locked;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-100 border-2 border-green-300'
                    : isActive
                    ? 'bg-primary-100 border-2 border-primary-300'
                    : isLocked
                    ? 'bg-gray-100 border-2 border-gray-300'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : isActive ? (
                    <Play className="w-4 h-4 text-primary-600" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs font-medium text-center max-w-20 truncate">
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}