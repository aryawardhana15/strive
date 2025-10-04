'use client';

import { CheckCircle, Trophy, Star } from 'lucide-react';

interface SuccessStateProps {
  title: string;
  message: string;
  xpEarned?: number;
  onContinue?: () => void;
}

export default function SuccessState({ 
  title, 
  message, 
  xpEarned,
  onContinue 
}: SuccessStateProps) {
  return (
    <div className="card">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {xpEarned && (
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-semibold text-yellow-600">
              +{xpEarned} XP
            </span>
          </div>
        )}
        
        {onContinue && (
          <button
            onClick={onContinue}
            className="btn btn-primary flex items-center space-x-2 mx-auto"
          >
            <span>Lanjutkan</span>
            <Star className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
