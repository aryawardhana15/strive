'use client';

import { BookOpen, CheckCircle, Lock, Play, Clock, ChevronRight } from 'lucide-react';

interface RoadmapListProps {
  roadmaps: Array<{
    id: number;
    title: string;
    description: string;
    progress?: {
      total_steps: number;
      completed_steps: number;
      progress_percentage: number;
    };
    status?: 'completed' | 'in_progress' | 'not_started';
  }>;
  onSelect: (roadmap: any) => void;
}

export default function RoadmapList({ roadmaps, onSelect }: RoadmapListProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-primary-600" />;
      case 'not_started':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in_progress':
        return 'border-primary-200 bg-primary-50';
      case 'not_started':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="space-y-4">
      {roadmaps.map((roadmap) => (
        <div
          key={roadmap.id}
          onClick={() => onSelect(roadmap)}
          className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getStatusColor(roadmap.status)}`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getStatusIcon(roadmap.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                {roadmap.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {roadmap.description}
              </p>
              
              {roadmap.progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {roadmap.progress.completed_steps}/{roadmap.progress.total_steps} langkah
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${roadmap.progress.progress_percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{roadmap.progress.progress_percentage}% selesai</span>
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{roadmap.progress.total_steps} langkah</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}