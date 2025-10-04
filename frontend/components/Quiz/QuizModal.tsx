'use client';

import { useState } from 'react';
import { X, CheckCircle, Clock, Trophy, Star } from 'lucide-react';
import { Quiz } from '@/types';

interface QuizModalProps {
  quiz: Quiz;
  onSubmit: (answers: { question_id: number; answer: string }[]) => void;
  onClose: () => void;
}

export default function QuizModal({ quiz, onSubmit, onClose }: QuizModalProps) {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: parseInt(questionId),
      answer
    }));

    if (answerArray.length !== quiz.questions.length) {
      alert('Silakan jawab semua pertanyaan');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(answerArray);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isAnswered = (questionId: number) => {
    return answers[questionId] !== undefined;
  };

  const progressPercentage = (Object.keys(answers).length / quiz.questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">Quiz</h2>
            <p className="text-sm text-gray-600 mt-1">
              Jawab {quiz.questions.length} pertanyaan untuk menyelesaikan step ini
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{Object.keys(answers).length}/{quiz.questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Navigation */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-primary-600 text-white'
                      : isAnswered(quiz.questions[index].id)
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Pertanyaan {currentQuestion + 1} dari {quiz.questions.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {quiz.questions.map((question, index) => (
              <div 
                key={question.id} 
                className={`space-y-4 ${index === currentQuestion ? 'block' : 'hidden'}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {question.question}
                    </h3>
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                            answers[question.id] === option
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-700 flex-1">{option}</span>
                          {answers[question.id] === option && (
                            <CheckCircle className="w-5 h-5 text-primary-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </form>
        </div>

        {/* Navigation & Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={nextQuestion}
                disabled={currentQuestion === quiz.questions.length - 1}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {Object.keys(answers).length === quiz.questions.length ? (
                  <span className="text-green-600 font-medium flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Semua pertanyaan sudah dijawab</span>
                  </span>
                ) : (
                  <span>Jawab {quiz.questions.length - Object.keys(answers).length} pertanyaan lagi</span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
                  className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="loading-spinner w-4 h-4"></div>
                  ) : (
                    <Trophy className="w-4 h-4" />
                  )}
                  <span>Submit Quiz</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
