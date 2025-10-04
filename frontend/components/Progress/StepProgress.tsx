'use client';

import { CheckCircle, Lock, Play, Clock } from 'lucide-react';

interface StepProgressProps {
  step: {
    id: number;
    title: string;
    completed: boolean;
    is_locked?: boolean;
    completed_at?: string;
  };
  index: number;
  isActive: boolean;
}

export default function StepProgress({ step, index, isActive }: StepProgressProps) {
  const getStatusIcon = () => {
    if (step.completed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (step.is_locked) {
      return <Lock className="w-5 h-5 text-gray-400" />;
    } else if (isActive) {
      return <Play className="w-5 h-5 text-primary-600" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (step.completed) {
      return 'bg-green-100 border-green-300 text-green-800';
    } else if (step.is_locked) {
      return 'bg-gray-100 border-gray-300 text-gray-500';
    } else if (isActive) {
      return 'bg-primary-100 border-primary-300 text-primary-800';
    } else {
      return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">
            {step.title}
          </h4>
          {step.completed && step.completed_at && (
            <p className="text-xs text-green-600 mt-1">
              Selesai pada {new Date(step.completed_at).toLocaleDateString('id-ID')}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className="text-xs font-medium">
            {index + 1}
          </span>
        </div>
      </div>
    </div>
  );
}