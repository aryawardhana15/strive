'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Job, User } from '@/types';
import { auth } from '@/lib/auth';
import { jobsAPI } from '@/lib/api';
import { Search, MapPin, Clock, DollarSign, Star, Filter, Briefcase } from 'lucide-react';

export default function CareersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    remote: false,
    fulltime: true,
    minSalary: '',
    maxSalary: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeCareers = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch jobs and recommendations
        const [jobsResponse, recommendedResponse] = await Promise.all([
          jobsAPI.getAll({ limit: 20 }),
          jobsAPI.getRecommended(currentUser.id, { limit: 6 })
        ]);

        setJobs(jobsResponse.data.data.jobs || []);
        setRecommendedJobs(recommendedResponse.data.data || []);

      } catch (error) {
        console.error('Error initializing careers page:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCareers();
  }, [router]);

  const handleSearch = async () => {
    try {
      const params = {
        search: searchQuery,
        ...filters
      };
      const response = await jobsAPI.getAll(params);
      setJobs(response.data.data.jobs || []);
    } catch (error) {
      console.error('Error searching jobs:', error);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `Rp ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `Rp ${min.toLocaleString()}+`;
    if (max) return `Up to Rp ${max.toLocaleString()}`;
  };

  const handleJobClick = (job: Job) => {
    router.push(`/careers/${job.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peluang Karier</h1>
          <p className="text-gray-600 mt-1">
            Temukan pekerjaan impianmu berdasarkan skill dan minat
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
          <input
            type="text"
                placeholder="Cari posisi, perusahaan, atau skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="btn btn-primary"
          >
            Cari
        </button>
      </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  placeholder="Jakarta, Bandung..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gaji Minimum
                </label>
                <input
                  type="number"
                  placeholder="5000000"
                  value={filters.minSalary}
                  onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gaji Maksimum
                </label>
                <input
                  type="number"
                  placeholder="15000000"
                  value={filters.maxSalary}
                  onChange={(e) => setFilters({ ...filters, maxSalary: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex items-end space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.remote}
                    onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remote</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.fulltime}
                    onChange={(e) => setFilters({ ...filters, fulltime: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Full-time</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Jobs */}
      {recommendedJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Rekomendasi Untukmu
            </h2>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Berdasarkan skill dan minatmu</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="card cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-primary-600 font-medium text-sm">
                      {job.company}
                    </p>
                  </div>
                  {job.isRecommended && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Star className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {job.recommendationScore}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                    {job.is_remote && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                        Remote
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{job.is_fulltime ? 'Full-time' : 'Part-time'}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {job.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{job.tags.length - 3}
                    </span>
                  )}
                </div>

                {job.recommendationReason && (
                  <div className="mt-3 p-2 bg-primary-50 rounded-lg">
                    <p className="text-xs text-primary-700">
                      {job.recommendationReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Semua Lowongan Kerja
          </h2>
          <span className="text-sm text-gray-600">
            {jobs.length} lowongan ditemukan
          </span>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="card cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {job.title}
                            </h3>
                            <p className="text-primary-600 font-medium text-sm mb-2">
                              {job.company}
                            </p>
                          </div>
                          {job.isRecommended && (
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <Star className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                {job.recommendationScore}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                            {job.is_remote && (
                              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                                Remote
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{job.is_fulltime ? 'Full-time' : 'Part-time'}</span>
          </div>
        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {job.tags.slice(0, 5).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {job.tags.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{job.tags.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
          <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada lowongan ditemukan
              </h3>
            <p className="text-gray-600">
                Coba ubah kata kunci pencarian atau filter untuk menemukan lowongan yang sesuai.
            </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
