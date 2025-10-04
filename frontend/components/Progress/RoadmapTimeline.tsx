'use client';

import { CheckCircle, Lock, Play, Clock } from 'lucide-react';

interface RoadmapTimelineProps {
  steps: Array<{
    id: number;
    title: string;
    completed: boolean;
    is_locked?: boolean;
    completed_at?: string;
  }>;
  currentStep?: number;
}

export default function RoadmapTimeline({ steps, currentStep }: RoadmapTimelineProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = step.completed;
        const isLocked = step.is_locked;

        return (
          <div key={step.id} className="flex items-start space-x-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
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
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-8 mt-2 ${
                  isCompleted ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${
                isCompleted ? 'text-green-800' : isActive ? 'text-primary-800' : 'text-gray-600'
              }`}>
                {step.title}
              </h4>
              {isCompleted && step.completed_at && (
                <p className="text-xs text-green-600 mt-1">
                  Selesai pada {new Date(step.completed_at).toLocaleDateString('id-ID')}
                </p>
              )}
              {isLocked && (
                <p className="text-xs text-gray-500 mt-1">
                  Langkah ini terkunci
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
