'use client';

import { CheckCircle, XCircle, RotateCcw, ArrowRight, Trophy, Star } from 'lucide-react';

interface QuizResultProps {
  result: {
    score: number;
    total_questions: number;
    correct_answers: number;
    feedback: string;
    detailed_results: Array<{
      question: string;
      user_answer: string;
      correct_answer: string;
      is_correct: boolean;
    }>;
    xp_earned: number;
    completed: boolean;
  };
  onRetry: () => void;
  onContinue: () => void;
  onClose: () => void;
}

export default function QuizResult({ result, onRetry, onContinue, onClose }: QuizResultProps) {
  const isPassed = result.score >= 50;
  const scoreColor = isPassed ? 'text-green-600' : 'text-red-600';
  const bgColor = isPassed ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isPassed ? 'border-green-200' : 'border-red-200';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${borderColor} ${bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isPassed ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isPassed ? 'Selamat! Quiz Berhasil!' : 'Quiz Belum Lulus'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isPassed 
                    ? 'Anda dapat melanjutkan ke step berikutnya' 
                    : 'Silakan coba lagi untuk melanjutkan'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Score Section */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Score */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${scoreColor} mb-2`}>
                {result.score}%
              </div>
              <div className="text-sm text-gray-600">Skor Akhir</div>
            </div>

            {/* Correct Answers */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {result.correct_answers}/{result.total_questions}
              </div>
              <div className="text-sm text-gray-600">Jawaban Benar</div>
            </div>

            {/* XP Earned */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2 flex items-center justify-center">
                <Star className="w-6 h-6 mr-1" />
                {result.xp_earned}
              </div>
              <div className="text-sm text-gray-600">XP Diperoleh</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress Quiz</span>
              <span className="font-medium">{result.correct_answers}/{result.total_questions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  isPassed ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${(result.correct_answers / result.total_questions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Feedback</h3>
            <p className="text-blue-800">{result.feedback}</p>
          </div>

          {/* Detailed Results */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Detail Jawaban</h3>
            <div className="space-y-3">
              {result.detailed_results.map((detail, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      detail.is_correct ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {detail.is_correct ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">{detail.question}</p>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Jawaban Anda:</span>
                          <span className={`text-sm font-medium ${
                            detail.is_correct ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {detail.user_answer}
                          </span>
                        </div>
                        {!detail.is_correct && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Jawaban Benar:</span>
                            <span className="text-sm font-medium text-green-600">
                              {detail.correct_answer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Tutup
            </button>
            
            <div className="flex space-x-3">
              {!isPassed && (
                <button
                  onClick={onRetry}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Coba Lagi</span>
                </button>
              )}
              
              {isPassed && (
                <button
                  onClick={onContinue}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Lanjut ke Step Berikutnya</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}