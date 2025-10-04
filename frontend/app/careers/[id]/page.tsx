'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, Job } from '@/types';
import { auth } from '@/lib/auth';
import { jobsAPI } from '@/lib/api';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Users, 
  Calendar,
  ExternalLink,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';

export default function JobDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  useEffect(() => {
    const initializeJobDetail = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch job details and similar jobs
        const [jobResponse, similarResponse] = await Promise.all([
          jobsAPI.getById(parseInt(jobId)),
          jobsAPI.getSimilar(parseInt(jobId), { limit: 3 })
        ]);

        setJob(jobResponse.data.data || null);
        setSimilarJobs(similarResponse.data.data || []);

      } catch (error) {
        console.error('Error initializing job detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      initializeJobDetail();
    }
  }, [jobId, router]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `Rp ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `Rp ${min.toLocaleString()}+`;
    if (max) return `Up to Rp ${max.toLocaleString()}`;
  };

  const handleApply = () => {
    if (job?.application_url) {
      window.open(job.application_url, '_blank');
    } else {
      alert('Link aplikasi tidak tersedia. Silakan hubungi perusahaan langsung.');
    }
  };

  const handleSimilarJobClick = (jobId: number) => {
    router.push(`/careers/${jobId}`);
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

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <div className="card">
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Lowongan tidak ditemukan
            </h3>
            <p className="text-gray-600 mb-4">
              Lowongan yang Anda cari mungkin sudah tidak tersedia.
            </p>
            <button
              onClick={() => router.push('/careers')}
              className="btn btn-primary"
            >
              Kembali ke Daftar Lowongan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {/* Job Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              {job.isRecommended && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-xl text-primary-600 font-medium mb-4">{job.company}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Posted {new Date(job.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-red-500">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-500">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-yellow-500">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleApply}
            className="btn btn-primary flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Apply Now</span>
          </button>
          <button className="btn btn-secondary">
            Save Job
          </button>
        </div>
      </div>

      {/* Job Description */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Deskripsi Pekerjaan</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Persyaratan</h2>
          <ul className="space-y-2">
            {job.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills/Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills yang Dibutuhkan</h2>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Company Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tentang Perusahaan</h2>
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{job.company}</h3>
            <p className="text-gray-600 text-sm">
              Informasi perusahaan tidak tersedia. Silakan kunjungi website resmi untuk informasi lebih lanjut.
            </p>
          </div>
        </div>
      </div>

      {/* Similar Jobs */}
      {similarJobs.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lowongan Serupa</h2>
          <div className="space-y-4">
            {similarJobs.map((similarJob) => (
              <div
                key={similarJob.id}
                onClick={() => handleSimilarJobClick(similarJob.id)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{similarJob.title}</h3>
                    <p className="text-primary-600 text-sm mb-2">{similarJob.company}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{similarJob.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{formatSalary(similarJob.salary_min, similarJob.salary_max)}</span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Section */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Tertarik dengan posisi ini?
          </h2>
          <p className="text-gray-600 mb-4">
            Klik tombol di bawah untuk melamar atau simpan lowongan ini untuk nanti.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleApply}
              className="btn btn-primary"
            >
              Apply Now
            </button>
            <button className="btn btn-secondary">
              Save for Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
