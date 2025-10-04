'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Roadmap, User, LearningProgress, Quiz, QuizQuestion } from '@/types';
import { auth } from '@/lib/auth';
import { roadmapsAPI, usersAPI, leaderboardAPI } from '@/lib/api';
import { ChevronRight, BookOpen } from 'lucide-react';
import QuizModal from '@/components/Quiz/QuizModal';
import QuizResult from '@/components/Quiz/QuizResult';
import StepsList from '@/components/Progress/StepsList';
import RoadmapSelector from '@/components/Progress/RoadmapSelector';
import StatisticsWidget from '@/components/Progress/StatisticsWidget';
import RoadmapHeader from '@/components/Progress/RoadmapHeader';
import EmptyState from '@/components/Progress/EmptyState';
import LoadingState from '@/components/Progress/LoadingState';
import ErrorState from '@/components/Progress/ErrorState';

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
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

        // Fetch roadmaps, progress data, and user rank
        const [roadmapsResponse, progressResponse, rankResponse] = await Promise.all([
          roadmapsAPI.getAll(),
          usersAPI.getProgress(currentUser.id),
          leaderboardAPI.getUserContext(currentUser.id)
        ]);

        setRoadmaps(roadmapsResponse.data.data || []);
        setProgress(progressResponse.data.data || null);
        setUserRank(rankResponse.data.data?.user_rank || 0);

        // Set first roadmap as selected by default and load its steps with progress
        if (roadmapsResponse.data.data && roadmapsResponse.data.data.length > 0) {
          const firstRoadmap = roadmapsResponse.data.data[0];
          await handleRoadmapSelect(firstRoadmap);
        }

      } catch (error) {
        console.error('Error initializing progress page:', error);
        setError('Gagal memuat data progress. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    initializeProgress();
  }, [router]);

  const handleRoadmapSelect = async (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    try {
      // Load roadmap steps and user progress in parallel
      const [stepsResponse, progressResponse] = await Promise.all([
        roadmapsAPI.getSteps(roadmap.id),
        roadmapsAPI.getProgress(roadmap.id)
      ]);
      
      const stepsData = stepsResponse.data.data;
      const progressData = progressResponse.data.data;
      
      // Mark completed steps based on user progress
      const stepsWithProgress = stepsData.map((step: any) => {
        const userProgress = progressData.step_progress?.find((p: any) => p.id === step.id);
        return {
          ...step,
          completed: userProgress?.completed || false,
          completed_at: userProgress?.completed_at || null
        };
      });
      
      // Combine roadmap data with steps and progress
      setSelectedRoadmap({
        ...roadmap,
        steps: stepsWithProgress,
        progress: progressData.overall_progress
      });
    } catch (error) {
      console.error('Error fetching roadmap details:', error);
      setError('Gagal memuat detail roadmap. Silakan coba lagi.');
    }
  };

  const handleQuizOpen = async (stepId: number) => {
    if (!selectedRoadmap) return;
    
    setQuizLoading(true);
    try {
      const response = await roadmapsAPI.getQuiz(selectedRoadmap.id, stepId);
      setCurrentQuiz(response.data.data);
      setCurrentStepId(stepId);
      setShowQuiz(true);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Gagal memuat quiz. Silakan coba lagi.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizSubmit = async (answers: { question_id: number; answer: string }[]) => {
    if (!selectedRoadmap || !currentStepId) return;

    try {
      const response = await roadmapsAPI.submitQuiz(selectedRoadmap.id, currentStepId, answers);
      const result = response.data.data;
      
      setQuizResult(result);
      setShowQuiz(false);
      setShowQuizResult(true);
      
      // Always refresh roadmap data to show updated progress
      await handleRoadmapSelect(selectedRoadmap);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Gagal mengirim jawaban. Silakan coba lagi.');
    }
  };

  const handleQuizRetry = () => {
    setShowQuizResult(false);
    setQuizResult(null);
    if (currentStepId) {
      handleQuizOpen(currentStepId);
    }
  };

  const handleQuizContinue = () => {
    setShowQuizResult(false);
    setQuizResult(null);
    setCurrentStepId(null);
    setCurrentQuiz(null);
  };

  const handleQuizClose = () => {
    setShowQuiz(false);
    setShowQuizResult(false);
    setCurrentQuiz(null);
    setCurrentStepId(null);
    setQuizResult(null);
  };

  const handleStartStep = (stepId: number) => {
    // For now, just show an alert. In the future, this could open a learning module
    alert('Fitur belajar interaktif akan segera hadir!');
  };

  if (loading) {
    return <LoadingState message="Memuat progress belajar..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Terjadi Kesalahan"
        message={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          // Re-initialize the page
          window.location.reload();
        }}
      />
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
          <h1 className="text-2xl font-bold text-gray-900">Progress Belajar</h1>
          <p className="text-gray-600 mt-1">
            Pantau kemajuanmu dan lanjutkan perjalanan belajar
          </p>
        </div>
      </div>

      {/* Statistics Widget */}
      <StatisticsWidget
        user={user}
        progress={progress}
        userRank={userRank}
      />

      {/* Roadmap Selection */}
      <RoadmapSelector
        roadmaps={roadmaps}
        selectedRoadmap={selectedRoadmap}
        onSelect={handleRoadmapSelect}
        loading={loading}
      />

      {/* Selected Roadmap Content */}
      {selectedRoadmap ? (
        <div className="space-y-6">
          {/* Roadmap Header */}
          <RoadmapHeader roadmap={selectedRoadmap} />

          {/* Sequential Steps */}
          {selectedRoadmap.steps && (
            <StepsList
              steps={selectedRoadmap.steps}
              onQuizOpen={handleQuizOpen}
              onStart={handleStartStep}
              quizLoading={quizLoading}
            />
                        )}
                      </div>
      ) : (
        <EmptyState
          title="Pilih roadmap untuk memulai"
          description="Pilih roadmap dari daftar di atas untuk melihat progress dan langkah-langkah belajar."
        />
      )}

       {/* Quiz Modal */}
       {showQuiz && currentQuiz && (
         <QuizModal
           quiz={currentQuiz}
           onSubmit={handleQuizSubmit}
           onClose={handleQuizClose}
         />
       )}

       {/* Quiz Result Modal */}
       {showQuizResult && quizResult && (
         <QuizResult
           result={quizResult}
           onRetry={handleQuizRetry}
           onContinue={handleQuizContinue}
           onClose={handleQuizClose}
         />
       )}
    </div>
  );
}
