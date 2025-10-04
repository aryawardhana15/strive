'use client';

import { Grid3X3, List, LayoutGrid } from 'lucide-react';

interface RoadmapViewToggleProps {
  view: 'grid' | 'list' | 'card';
  onViewChange: (view: 'grid' | 'list' | 'card') => void;
}

export default function RoadmapViewToggle({ view, onViewChange }: RoadmapViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-md transition-colors ${
          view === 'grid'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        title="Grid View"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-md transition-colors ${
          view === 'list'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        title="List View"
      >
        <List className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onViewChange('card')}
        className={`p-2 rounded-md transition-colors ${
          view === 'card'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        title="Card View"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );
}