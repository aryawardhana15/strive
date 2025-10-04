'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Challenge, User } from '@/types';
import { auth } from '@/lib/auth';
import { challengesAPI } from '@/lib/api';
import { ArrowLeft, Play, CheckCircle, XCircle, Clock, Trophy, Zap } from 'lucide-react';

export default function ChallengePage() {
  const [user, setUser] = useState<User | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const router = useRouter();
  const params = useParams();
  const challengeId = params.id as string;

  useEffect(() => {
    const initializeChallenge = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch challenge details
        const response = await challengesAPI.getById(parseInt(challengeId));
        setChallenge(response.data.data);

        // Set default code template
        if (response.data.data?.code_template) {
          setCode(response.data.data.code_template);
        }

      } catch (error) {
        console.error('Error initializing challenge page:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeChallenge();
  }, [challengeId, router]);

  const handleSubmitCode = async () => {
    if (!challenge) return;

    setSubmitting(true);
    try {
      const response = await challengesAPI.submit(challenge.id, { code });
      setResult(response.data.data);
      setShowResult(true);
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (challenge?.code_template) {
      setCode(challenge.code_template);
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Clock className="w-5 h-5 text-green-600" />;
      case 'weekly':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'monthly':
        return <Trophy className="w-5 h-5 text-purple-600" />;
      default:
        return <Play className="w-5 h-5 text-gray-600" />;
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'weekly':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'monthly':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user || !challenge) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getChallengeColor(challenge.type)}`}>
                {challenge.type === 'daily' ? 'Harian' : 
                 challenge.type === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </span>
              <div className="flex items-center space-x-1 text-gray-600">
                {getChallengeIcon(challenge.type)}
                <span className="text-sm">+{challenge.xp_reward} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challenge Description */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deskripsi Tantangan</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-4">{challenge.description}</p>
              
              {challenge.requirements && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Requirements:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {challenge.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {challenge.examples && challenge.examples.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Examples:</h3>
                  {challenge.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                      <p className="text-sm text-gray-600 mb-1">Input: {example.input}</p>
                      <p className="text-sm text-gray-600">Output: {example.output}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Test Cases */}
          {challenge.test_cases && challenge.test_cases.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Cases</h2>
              <div className="space-y-3">
                {challenge.test_cases.map((testCase, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Test Case {index + 1}</span>
                      <span className="text-xs text-gray-500">Expected: {testCase.expected_output}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Input: <code className="bg-gray-100 px-1 rounded">{testCase.input}</code></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Code Editor</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">JavaScript</span>
                <button
                  onClick={handleResetCode}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border-0 resize-none focus:outline-none focus:ring-0"
                placeholder="// Write your solution here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSubmitCode}
              disabled={submitting || !code.trim()}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{submitting ? 'Evaluating...' : 'Submit Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className={`p-6 border-b ${result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-3">
                {result.passed ? (
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
                    {result.passed ? 'Selamat! Kode Anda Berhasil!' : 'Kode Belum Benar'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {result.passed 
                      ? `Anda mendapat ${result.xp_earned || challenge.xp_reward} XP!`
                      : 'Coba lagi dan perbaiki kode Anda.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Feedback:</h3>
                <p className="text-gray-700">{result.feedback}</p>
              </div>

              {result.test_results && result.test_results.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Test Results:</h3>
                  <div className="space-y-2">
                    {result.test_results.map((test: any, index: number) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        test.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{test.test_case}</span>
                          <div className="flex items-center space-x-2">
                            {test.passed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              test.passed ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {test.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        </div>
                        {test.output && (
                          <p className="text-sm text-gray-600 mt-1">Output: {test.output}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.hints && result.hints.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Hints:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {result.hints.map((hint: string, index: number) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowResult(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Tutup
                </button>
                
                <div className="flex space-x-3">
                  {!result.passed && (
                    <button
                      onClick={() => {
                        setShowResult(false);
                        // Focus on code editor
                      }}
                      className="btn btn-secondary"
                    >
                      Coba Lagi
                    </button>
                  )}
                  
                  {result.passed && (
                    <button
                      onClick={() => router.push('/challenges')}
                      className="btn btn-primary"
                    >
                      Kembali ke Challenges
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
