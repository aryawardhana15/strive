'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, CVReview, CVAnalysis } from '@/types';
import { auth } from '@/lib/auth';
import { cvAPI } from '@/lib/api';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Star, TrendingUp, Award, Download } from 'lucide-react';
import CVAnalysisResult from '@/components/CVReview/CVAnalysisResult';

export default function CVReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cvReviews, setCvReviews] = useState<CVReview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageScore: 0,
    improvementSuggestions: 0
  });
  const [processingReview, setProcessingReview] = useState<CVReview | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeCVReview = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch CV review history and stats
        const [historyResponse, statsResponse] = await Promise.all([
          cvAPI.getHistory(currentUser.id),
          cvAPI.getStats(currentUser.id)
        ]);

        setCvReviews(historyResponse.data.data || []);
        setStats(statsResponse.data.data || stats);

      } catch (error) {
        console.error('Error initializing CV review page:', error);
      }
    };

    initializeCVReview();
  }, [router]);

  const handleFileUpload = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await cvAPI.upload(formData);
      const newReview = response.data.data;
      
      console.log('Upload response:', response.data);
      console.log('New review:', newReview);

      // Validate newReview before adding to state
      if (!newReview || typeof newReview !== 'object') {
        throw new Error('Invalid review data received from server');
      }

      // Add to the beginning of the list
      setCvReviews(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return [newReview, ...prevArray];
      });
      setStats(prev => {
        const prevStats = prev || { totalReviews: 0, averageScore: 0, improvementSuggestions: 0 };
        return { ...prevStats, totalReviews: prevStats.totalReviews + 1 };
      });

      // Start polling for results
      pollForResults(newReview.id);

    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Gagal mengupload CV. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const pollForResults = async (reviewId: number) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    // Set the review as processing
    setProcessingReview(prev => {
      const reviewsArray = Array.isArray(cvReviews) ? cvReviews : [];
      return prev?.id === reviewId ? prev : reviewsArray.find(r => r.id === reviewId) || null;
    });

    const poll = async () => {
      try {
        const response = await cvAPI.getResult(reviewId);
        const review = response.data.data;

        if (review.status === 'completed') {
          // Update the review in the list
          setCvReviews(prev => {
            const prevArray = Array.isArray(prev) ? prev : [];
            return prevArray.map(r => r.id === reviewId ? review : r);
          });
          // Clear processing state
          setProcessingReview(null);
          return;
        }

        if (review.status === 'failed') {
          console.error('CV analysis failed');
          setProcessingReview(null);
          return;
        }

        // Continue polling if still processing
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          // Timeout
          setProcessingReview(null);
        }
      } catch (error) {
        console.error('Error polling for results:', error);
        setProcessingReview(null);
      }
    };

    poll();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && isValidFile(file)) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      handleFileUpload(file);
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan PDF atau Word document.');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('Ukuran file terlalu besar. Maksimal 2MB.');
      return false;
    }
    
    return true;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review CV</h1>
          <p className="text-gray-600 mt-1">
            Upload CV-mu dan dapatkan analisis mendalam dari AI
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Skor Rata-rata</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}/100</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Saran Perbaikan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.improvementSuggestions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CV Baru</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drag & drop CV-mu di sini
              </p>
              <p className="text-sm text-gray-600 mt-1">
                atau klik untuk memilih file
              </p>
            </div>

            <div className="text-xs text-gray-500">
              <p>Format yang didukung: PDF, DOC, DOCX</p>
              <p>Ukuran maksimal: 2MB</p>
            </div>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              disabled={uploading}
              className="hidden"
              id="cv-upload"
            />
            
            <label
              htmlFor="cv-upload"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                uploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
              }`}
            >
              {uploading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Mengupload...
                </>
              ) : (
                'Pilih File'
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Processing Review */}
      {processingReview && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sedang Menganalisis CV</h3>
              <p className="text-sm text-gray-600">AI sedang menganalisis CV Anda...</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">Menganalisis CV...</p>
                <p className="text-sm text-gray-600">Proses ini memakan waktu 1-2 menit</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Membaca dan memproses konten CV</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Menganalisis struktur dan format</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Memberikan saran perbaikan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CV Review History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Review</h2>
        
        {cvReviews.length > 0 ? (
          <div className="space-y-4">
            {cvReviews.map((review) => (
              <div key={review.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(review.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        CV Review #{review.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {review.status === 'completed' && review.result && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(review.result.overall_score)}`}>
                      {review.result.overall_score}/100
                    </div>
                  )}
                </div>

                {review.status === 'completed' && review.result && (
                  <CVAnalysisResult 
                    analysis={review.result}
                    onDownload={() => {
                      // TODO: Implement download functionality
                      console.log('Download CV');
                    }}
                    onShare={() => {
                      // TODO: Implement share functionality
                      console.log('Share results');
                    }}
                  />
                )}

                {review.status === 'processing' && (
                  <div className="text-center py-4">
                    <div className="loading-spinner mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Menganalisis CV...</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Proses ini memakan waktu 1-2 menit
                    </p>
                  </div>
                )}

                {review.status === 'failed' && (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Gagal menganalisis CV</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Silakan coba upload ulang
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada review CV
              </h3>
              <p className="text-gray-600">
                Upload CV pertamamu untuk mendapatkan analisis mendalam dari AI.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}