'use client';

import { BookOpen, CheckCircle, Lock, Play } from 'lucide-react';

interface RoadmapSidebarProps {
  steps: Array<{
    id: number;
    title: string;
    completed: boolean;
    is_locked?: boolean;
  }>;
  currentStep?: number;
  onStepSelect: (stepId: number) => void;
}

export default function RoadmapSidebar({ steps, currentStep, onStepSelect }: RoadmapSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Langkah-langkah</h3>
      
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = step.completed;
          const isLocked = step.is_locked;

          return (
            <button
              key={step.id}
              onClick={() => onStepSelect(step.id)}
              disabled={isLocked}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-100 border border-primary-300 text-primary-800'
                  : isCompleted
                  ? 'bg-green-50 border border-green-200 text-green-800 hover:bg-green-100'
                  : isLocked
                  ? 'bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : isActive ? (
                    <Play className="w-4 h-4 text-primary-600" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {index + 1}. {step.title}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}