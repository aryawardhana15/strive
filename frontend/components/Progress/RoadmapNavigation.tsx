'use client';

import { ChevronLeft, ChevronRight, Home, BookOpen } from 'lucide-react';

interface RoadmapNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onHome: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export default function RoadmapNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onHome,
  canGoPrevious,
  canGoNext
}: RoadmapNavigationProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <button
          onClick={onHome}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Langkah {currentStep} dari {totalSteps}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>
        
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
