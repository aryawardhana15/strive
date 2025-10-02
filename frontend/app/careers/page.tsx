'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Job } from '@/types';
import { auth } from '@/lib/auth';
import { usersAPI, jobsAPI } from '@/lib/api';
import { Search, Filter, MapPin, Clock, Briefcase, Star, Building2 } from 'lucide-react';

export default function CareersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
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

        // Fetch jobs and recommended jobs
        const [jobsResponse, recommendedResponse] = await Promise.all([
          jobsAPI.getAll({ limit: 20 }),
          jobsAPI.getRecommended(currentUser.id, { limit: 6 })
        ]);

        setJobs(jobsResponse.data.data || []);
        setRecommendedJobs(recommendedResponse.data.data || []);
        setFilteredJobs(jobsResponse.data.data || []);

      } catch (error) {
        console.error('Error initializing careers:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCareers();
  }, [router]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.tags && JSON.stringify(job.tags).toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs]);

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Gaji tidak disebutkan';
    if (!min) return `Rp${(max / 1000000).toFixed(0)} juta`;
    if (!max) return `Rp${(min / 1000000).toFixed(0)} juta+`;
    return `Rp${(min / 1000000).toFixed(0)}-${(max / 1000000).toFixed(0)} juta`;
  };

  const getJobTypeTags = (job: Job) => {
    const tags = [];
    if (job.is_fulltime) tags.push('Full-time');
    if (job.is_remote) tags.push('Remote');
    return tags;
  };

  const JobCard = ({ job, isRecommended = false }: { job: Job; isRecommended?: boolean }) => (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/careers/${job.id}`)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
          <div className="text-green-600 font-medium text-sm">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
        </div>
        {isRecommended && (
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-medium">Recommended</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <Building2 className="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm">{job.company}</div>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <MapPin className="w-3 h-3" />
            {job.location}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {getJobTypeTags(job).map((tag, index) => (
          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <button className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
        Lihat Selengkapnya
      </button>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Rekomendasi Karier Untukmu
          </h1>
          <p className="text-gray-600 mt-2">
            Lanjutkan perjalananmu dan selesaikan roadmap menuju karier impian.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari karier"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">Filter</span>
        </button>
      </div>

      {/* Recommended Jobs Section */}
      {recommendedJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Rekomendasi untuk Anda
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Lihat Semua →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} isRecommended={true} />
            ))}
          </div>
        </div>
      )}

      {/* All Jobs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Semua Lowongan Kerja
          </h2>
          <div className="text-sm text-gray-600">
            {filteredJobs.length} dari {jobs.length} lowongan
          </div>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada lowongan ditemukan</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Coba ubah kata kunci pencarian Anda' : 'Belum ada lowongan kerja tersedia'}
            </p>
          </div>
        )}
      </div>

      {/* AI Assistant Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span className="text-sm font-medium">Tanya StriveAI ✨</span>
        </button>
      </div>
    </div>
  );
}
