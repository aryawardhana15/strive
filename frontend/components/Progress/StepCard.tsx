'use client';

import { CheckCircle, Lock, Play, BookOpen, Trophy } from 'lucide-react';
import { RoadmapStep } from '@/types';

interface StepCardProps {
  step: RoadmapStep;
  index: number;
  isLocked: boolean;
  canTakeQuiz: boolean;
  onQuizOpen: (stepId: number) => void;
  onStart: (stepId: number) => void;
  quizLoading: boolean;
}

export default function StepCard({
  step,
  index,
  isLocked,
  canTakeQuiz,
  onQuizOpen,
  onStart,
  quizLoading
}: StepCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        step.completed
          ? 'border-green-200 bg-green-50'
          : isLocked
          ? 'border-gray-200 bg-gray-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            step.completed
              ? 'bg-green-600 text-white'
              : isLocked
              ? 'bg-gray-300 text-gray-500'
              : 'bg-primary-100 text-primary-600'
          }`}
        >
          {step.completed ? (
            <CheckCircle className="w-5 h-5" />
          ) : isLocked ? (
            <Lock className="w-5 h-5" />
          ) : (
            index + 1
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900">
              {step.title}
            </h4>
            {step.completed && (
              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                Selesai
              </span>
            )}
            {isLocked && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                Terkunci
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {step.content}
          </p>
          {step.completed && step.completed_at && (
            <p className="text-xs text-green-600 mt-1">
              Selesai pada {new Date(step.completed_at).toLocaleDateString('id-ID')}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!step.completed && !isLocked && canTakeQuiz && (
            <button
              onClick={() => onQuizOpen(step.id)}
              disabled={quizLoading}
              className="btn btn-primary text-sm flex items-center space-x-2"
            >
              {quizLoading ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : (
                <Trophy className="w-4 h-4" />
              )}
              <span>Mulai Quiz</span>
            </button>
          )}
          
          {!step.completed && !isLocked && !canTakeQuiz && (
            <button
              onClick={() => onStart(step.id)}
              className="btn btn-secondary text-sm flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Pelajari</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



