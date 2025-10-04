'use client';

import { RoadmapStep } from '@/types';
import StepCard from './StepCard';

interface StepsListProps {
  steps: RoadmapStep[];
  onQuizOpen: (stepId: number) => void;
  onStart: (stepId: number) => void;
  quizLoading: boolean;
}

export default function StepsList({ steps, onQuizOpen, onStart, quizLoading }: StepsListProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Langkah-langkah Belajar
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          // Step pertama selalu terbuka, step selanjutnya terbuka jika step sebelumnya selesai
          const isLocked = index > 0 && !steps[index - 1]?.completed;
          // Bisa ambil quiz jika step tidak terkunci dan belum selesai
          const canTakeQuiz = !step.completed && !isLocked;
          
          return (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isLocked={isLocked}
              canTakeQuiz={canTakeQuiz}
              onQuizOpen={onQuizOpen}
              onStart={onStart}
              quizLoading={quizLoading}
            />
          );
        })}
      </div>
    </div>
  );
}
