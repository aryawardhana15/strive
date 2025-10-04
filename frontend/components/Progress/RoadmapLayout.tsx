'use client';

import { useState } from 'react';
import RoadmapSidebar from './RoadmapSidebar';
import RoadmapContent from './RoadmapContent';
import RoadmapNavigation from './RoadmapNavigation';

interface RoadmapLayoutProps {
  steps: Array<{
    id: number;
    title: string;
    content: string;
    completed: boolean;
    is_locked?: boolean;
    quiz_id?: number;
  }>;
  onStart: (stepId: number) => void;
  onQuiz: (stepId: number) => void;
}

export default function RoadmapLayout({ steps, onStart, onQuiz }: RoadmapLayoutProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepSelect = (stepId: number) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleHome = () => {
    setCurrentStep(0);
  };

  const currentStepData = steps[currentStep];
  const canGoPrevious = currentStep > 0;
  const canGoNext = currentStep < steps.length - 1;

  const canStart = !currentStepData.completed && !currentStepData.is_locked;
  const canTakeQuiz = currentStepData.quiz_id && (!currentStepData.completed || !currentStepData.is_locked);

  return (
    <div className="flex h-screen bg-gray-50">
      <RoadmapSidebar
        steps={steps}
        currentStep={currentStepData?.id}
        onStepSelect={handleStepSelect}
      />
      
      <div className="flex-1 flex flex-col">
        <RoadmapContent
          step={currentStepData}
          onStart={() => onStart(currentStepData.id)}
          onQuiz={() => onQuiz(currentStepData.id)}
          canStart={canStart}
          canTakeQuiz={canTakeQuiz}
        />
        
        <div className="border-t border-gray-200">
          <RoadmapNavigation
            currentStep={currentStep + 1}
            totalSteps={steps.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onHome={handleHome}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
          />
        </div>
      </div>
    </div>
  );
}