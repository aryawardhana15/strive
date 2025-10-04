'use client';

import { ChevronDown, BookOpen, Target, Clock } from 'lucide-react';
import { Roadmap } from '@/types';

interface RoadmapSelectorProps {
  roadmaps: Roadmap[];
  selectedRoadmap: Roadmap | null;
  onSelect: (roadmap: Roadmap) => void;
  loading: boolean;
}

export default function RoadmapSelector({
  roadmaps,
  selectedRoadmap,
  onSelect,
  loading
}: RoadmapSelectorProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pilih Roadmap</h3>
        <div className="text-sm text-gray-600">
          {roadmaps.length} roadmap tersedia
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              onClick={() => onSelect(roadmap)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedRoadmap?.id === roadmap.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {roadmap.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {roadmap.description}
                  </p>
                  
                  {roadmap.progress && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {roadmap.progress.completed_steps}/{roadmap.progress.total_steps}
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
                          <Target className="w-3 h-3" />
                          <span>{roadmap.progress.total_steps} langkah</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {roadmaps.length === 0 && !loading && (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada roadmap
          </h3>
          <p className="text-gray-600">
            Roadmap akan segera tersedia untuk memulai perjalanan belajar Anda.
          </p>
        </div>
      )}
    </div>
  );
}
