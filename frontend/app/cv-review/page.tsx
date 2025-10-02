'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { User, CVReview } from '@/types';
import { auth } from '@/lib/auth';
import { usersAPI, cvAPI } from '@/lib/api';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Download, Eye, Trash2 } from 'lucide-react';

export default function CVReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cvHistory, setCvHistory] = useState<CVReview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
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

        // Fetch CV history
        setCvHistory([]);

      } catch (error) {
        console.error('Error initializing CV review:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCVReview();
  }, [router]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File terlalu besar. Maksimal 2MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan PDF atau DOC/DOCX.');
      return;
    }

    setUploading(true);
    try {
      const response = await cvAPI.upload(file);
      const newCVReview = response.data.data;
      
      // Add to history
      setCvHistory(prev => [newCVReview, ...prev]);
      
      // Redirect to result page
      router.push(`/cv-review/${newCVReview.id}`);
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Gagal mengunggah CV. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'processing':
        return 'Sedang diproses';
      case 'failed':
        return 'Gagal';
      default:
        return 'Menunggu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleViewResult = (cvId: number) => {
    router.push(`/cv-review/${cvId}`);
  };

  const handleDeleteCV = async (cvId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus CV ini?')) return;
    
    try {
      await cvAPI.delete(cvId);
      setCvHistory(prev => prev.filter(cv => cv.id !== cvId));
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert('Gagal menghapus CV. Silakan coba lagi.');
    }
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Unggah CV-mu
          </h1>
          <p className="text-gray-600 mt-2">
            Mulai langkah pertamamu dengan mengunggah CV agar Strive AI bisa menganalisis dan memberikan masukan terbaik.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={uploading} />
          
          {uploading ? (
            <div className="space-y-4">
              <div className="loading-spinner mx-auto"></div>
              <p className="text-gray-600">Mengunggah CV...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-16 h-16 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Klik untuk unggah, atau drag & drop file kamu
                </p>
                <p className="text-sm text-gray-500">
                  Pastikan CV tidak lebih dari 2MB
                </p>
              </div>
              <div className="text-xs text-gray-400">
                Format yang didukung: PDF, DOC, DOCX
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CV History */}
      {cvHistory.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Riwayat CV Review
          </h2>
          
          <div className="space-y-4">
            {cvHistory.map((cv) => (
              <div key={cv.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        CV Review #{cv.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Diunggah pada {new Date(cv.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cv.status)}`}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cv.status)}
                        {getStatusText(cv.status)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cv.status === 'completed' && (
                        <button
                          onClick={() => handleViewResult(cv.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat Hasil
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteCV(cv.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Tips untuk CV yang Baik</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>• Pastikan CV dalam format PDF untuk hasil terbaik</li>
          <li>• Gunakan font yang mudah dibaca (Arial, Calibri, Times New Roman)</li>
          <li>• Sertakan informasi kontak yang lengkap dan valid</li>
          <li>• Tulis pengalaman kerja dengan detail dan hasil yang dicapai</li>
          <li>• Sertakan skill dan sertifikasi yang relevan</li>
          <li>• Pastikan tidak ada typo atau kesalahan penulisan</li>
        </ul>
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
