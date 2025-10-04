'use client';

import { BookOpen, Play, CheckCircle, Lock } from 'lucide-react';

interface RoadmapContentProps {
  step: {
    id: number;
    title: string;
    content: string;
    completed: boolean;
    is_locked?: boolean;
    quiz_id?: number;
  };
  onStart: () => void;
  onQuiz: () => void;
  canStart: boolean;
  canTakeQuiz: boolean;
}

export default function RoadmapContent({ 
  step, 
  onStart, 
  onQuiz, 
  canStart, 
  canTakeQuiz 
}: RoadmapContentProps) {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            {step.completed ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : step.is_locked ? (
              <Lock className="w-8 h-8 text-gray-400" />
            ) : (
              <BookOpen className="w-8 h-8 text-primary-600" />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {step.title}
            </h1>
          </div>
          
          {step.completed && (
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              <CheckCircle className="w-4 h-4 mr-1" />
              Selesai
            </div>
          )}
          
          {step.is_locked && (
            <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
              <Lock className="w-4 h-4 mr-1" />
              Terkunci
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-gray-700 leading-relaxed">
            {step.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {canStart && (
            <button
              onClick={onStart}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Mulai Belajar</span>
            </button>
          )}
          
          {canTakeQuiz && step.quiz_id && (
            <button
              onClick={onQuiz}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ambil Quiz</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}