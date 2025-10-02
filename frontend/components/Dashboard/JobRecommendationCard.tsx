'use client';

import { Job } from '@/types';
import { MapPin, Building, DollarSign, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface JobRecommendationCardProps {
  job: Job;
  onClick?: () => void;
}

export default function JobRecommendationCard({ job, onClick }: JobRecommendationCardProps) {
  return (
    <div
      className="card hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
        {job.salary_min && job.salary_max && (
          <span className="text-sm font-medium text-green-600">
            {formatCurrency(job.salary_min)} - {formatCurrency(job.salary_max)}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Building className="w-4 h-4" />
          <span>{job.company}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.is_remote && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            Remote
          </span>
        )}
        {job.is_fulltime && (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            Full-time
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      <button className="w-full btn btn-primary flex items-center justify-center space-x-2">
        <span>Lihat Selengkapnya</span>
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
}
