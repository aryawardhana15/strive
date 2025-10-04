'use client';

import { Search, Filter, SortAsc, SortDesc, Grid3X3, List, LayoutGrid } from 'lucide-react';

interface RoadmapToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'title' | 'progress' | 'date';
  onSortChange: (sortBy: 'title' | 'progress' | 'date') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  filterBy: 'all' | 'completed' | 'in_progress' | 'not_started';
  onFilterChange: (filter: 'all' | 'completed' | 'in_progress' | 'not_started') => void;
  view: 'grid' | 'list' | 'card';
  onViewChange: (view: 'grid' | 'list' | 'card') => void;
}

export default function RoadmapToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  filterBy,
  onFilterChange,
  view,
  onViewChange
}: RoadmapToolbarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {/* Search and Filters */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari roadmap..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterBy}
              onChange={(e) => onFilterChange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Semua</option>
              <option value="completed">Selesai</option>
              <option value="in_progress">Sedang Berjalan</option>
              <option value="not_started">Belum Dimulai</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="title">Judul</option>
              <option value="progress">Progress</option>
              <option value="date">Tanggal</option>
            </select>
            
            <button
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* View Toggle */}
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
      </div>
    </div>
  );
}