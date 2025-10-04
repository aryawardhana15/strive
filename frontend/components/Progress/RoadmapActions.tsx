'use client';

import { Play, BookOpen, Download, Share2, Heart } from 'lucide-react';

interface RoadmapActionsProps {
  onStart: () => void;
  onQuiz?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  canStart?: boolean;
  canTakeQuiz?: boolean;
}

export default function RoadmapActions({
  onStart,
  onQuiz,
  onDownload,
  onShare,
  onFavorite,
  isFavorite = false,
  canStart = true,
  canTakeQuiz = true
}: RoadmapActionsProps) {
  return (
    <div className="flex items-center space-x-3">
      {canStart && (
        <button
          onClick={onStart}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Mulai Belajar</span>
        </button>
      )}
      
      {canTakeQuiz && onQuiz && (
        <button
          onClick={onQuiz}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>Ambil Quiz</span>
        </button>
      )}
      
      <div className="flex items-center space-x-2">
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
        
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
        
        {onFavorite && (
          <button
            onClick={onFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}