'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Roadmap, RoadmapStep, UserRoadmapProgress } from '@/types';
import { auth } from '@/lib/auth';
import { usersAPI, roadmapsAPI } from '@/lib/api';
import { ChevronDown, BookOpen, Clock, Trophy, Star } from 'lucide-react';

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);
  const [userProgress, setUserProgress] = useState<UserRoadmapProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeProgress = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch roadmaps and user progress
        const [roadmapsResponse, progressResponse] = await Promise.all([
          roadmapsAPI.getAll(),
          usersAPI.getProgress(currentUser.id)
        ]);

        setRoadmaps(roadmapsResponse.data.data || []);
        setUserProgress(progressResponse.data.data || []);

        // Set default roadmap (first one)
        if (roadmapsResponse.data.data.length > 0) {
          const firstRoadmap = roadmapsResponse.data.data[0];
          setSelectedRoadmap(firstRoadmap);
          
          // Fetch steps for the first roadmap
          const stepsResponse = await roadmapsAPI.getSteps(firstRoadmap.id);
          setRoadmapSteps(stepsResponse.data.data || []);
        }

      } catch (error) {
        console.error('Error initializing progress:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeProgress();
  }, [router]);

  const handleRoadmapChange = async (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setShowDropdown(false);
    
    try {
      const stepsResponse = await roadmapsAPI.getSteps(roadmap.id);
      setRoadmapSteps(stepsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching roadmap steps:', error);
    }
  };

  const getStepProgress = (stepId: number) => {
    return userProgress.find(p => p.step_id === stepId);
  };

  const calculateOverallProgress = () => {
    if (!roadmapSteps.length) return 0;
    const completedSteps = roadmapSteps.filter(step => 
      getStepProgress(step.id)?.completed
    ).length;
    return Math.round((completedSteps / roadmapSteps.length) * 100);
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
            <BookOpen className="w-8 h-8 text-green-600" />
            Progres Belajar
          </h1>
          <p className="text-gray-600 mt-2">
            Lanjutkan perjalananmu dan selesaikan roadmap menuju karier impian.
          </p>
        </div>
      </div>

      {/* Roadmap Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full max-w-md bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-yellow-100 transition-colors"
        >
          <span className="text-gray-900 font-medium">
            {selectedRoadmap?.title || 'Pilih Roadmap'}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg z-10">
            {roadmaps.map((roadmap) => (
              <button
                key={roadmap.id}
                onClick={() => handleRoadmapChange(roadmap)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="font-medium text-gray-900">{roadmap.title}</div>
                <div className="text-sm text-gray-600">{roadmap.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress Content */}
      {selectedRoadmap && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Progress Overview
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progress Keseluruhan</span>
                  <span className="font-semibold">{calculateOverallProgress()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${calculateOverallProgress()}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">
                  {roadmapSteps.filter(step => getStepProgress(step.id)?.completed).length} dari {roadmapSteps.length} langkah selesai
                </div>
              </div>
            </div>

            {/* Roadmap Steps */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Langkah-langkah Pembelajaran
              </h2>
              
              {roadmapSteps.map((step, index) => {
                const progress = getStepProgress(step.id);
                const isCompleted = progress?.completed;
                const isCurrent = !isCompleted && (index === 0 || getStepProgress(roadmapSteps[index - 1].id)?.completed);
                
                return (
                  <div
                    key={step.id}
                    className={`card border-l-4 ${
                      isCompleted 
                        ? 'border-green-500 bg-green-50' 
                        : isCurrent 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : isCurrent 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-4 ml-11">
                          {step.content}
                        </p>
                        {progress?.completed_at && (
                          <div className="text-sm text-green-600 ml-11">
                            Selesai pada {new Date(progress.completed_at).toLocaleDateString('id-ID')}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {step.quiz_id && (
                          <button
                            onClick={() => router.push(`/progress/quiz/${step.quiz_id}`)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              isCompleted
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : isCurrent
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!isCurrent && !isCompleted}
                          >
                            {isCompleted ? 'Lihat Quiz' : isCurrent ? 'Mulai Quiz' : 'Terkunci'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar - Statistics */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistik Belajarmu
              </h3>
              
              {/* Rank */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-blue-600">#128</span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Lihat semua peringkat
                </button>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-600">Total XP</span>
                  </div>
                  <span className="font-semibold">{user.xp_total?.toLocaleString() || '0'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-600">Total Waktu Belajar</span>
                  </div>
                  <span className="font-semibold">{user.study_time || 0} jam</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Kursus Aktif</span>
                  </div>
                  <span className="font-semibold">1</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-600">Kursus Selesai</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span className="text-sm font-medium">Tanya StriveAI ✨</span>
        </button>
      </div>
    </div>
  );
}
