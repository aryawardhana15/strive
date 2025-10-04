'use client';

import { CheckCircle, Lock, Play } from 'lucide-react';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  completed: number;
  locked: number;
}

export default function ProgressIndicator({ current, total, completed, locked }: ProgressIndicatorProps) {
  const getStepIcon = (index: number) => {
    if (index < completed) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (index === current) {
      return <Play className="w-4 h-4 text-primary-600" />;
    } else if (index < locked) {
      return <Lock className="w-4 h-4 text-gray-400" />;
    } else {
      return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStepColor = (index: number) => {
    if (index < completed) {
      return 'bg-green-100 border-green-300';
    } else if (index === current) {
      return 'bg-primary-100 border-primary-300';
    } else if (index < locked) {
      return 'bg-gray-100 border-gray-300';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStepColor(index)}`}
        >
          {getStepIcon(index)}
        </div>
      ))}
    </div>
  );
}
