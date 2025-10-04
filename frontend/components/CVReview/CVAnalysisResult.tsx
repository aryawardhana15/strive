'use client';

import { Star, TrendingUp, AlertCircle, CheckCircle, Target, Award, FileText, Download, Share2 } from 'lucide-react';

interface CVAnalysisResultProps {
  analysis: {
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    keyword_analysis: {
      present: string[];
      missing: string[];
    };
    sections_analysis: {
      [key: string]: {
        score: number;
        feedback: string;
      };
    };
    ats_compatibility: {
      score: number;
      feedback: string;
    };
    improvement_priority: string[];
  };
  onDownload?: () => void;
  onShare?: () => void;
}

export default function CVAnalysisResult({ analysis, onDownload, onShare }: CVAnalysisResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const renderStars = (score: number) => {
    const stars = [];
    const filledStars = Math.floor(score / 20);
    const hasHalfStar = (score % 20) >= 10;

    for (let i = 0; i < 5; i++) {
      if (i < filledStars) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
      } else if (i === filledStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Overall CV Score</h3>
              <p className="text-gray-600">Comprehensive analysis results</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Download Report"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share Results"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full ${getScoreColor(analysis.overall_score)}`}>
              <span className="text-2xl font-bold">{analysis.overall_score}</span>
              <span className="text-sm ml-1">/100</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{getScoreLabel(analysis.overall_score)}</p>
              <div className="flex items-center space-x-1">
                {renderStars(analysis.overall_score)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">ATS Compatibility</p>
            <p className="text-lg font-semibold text-gray-900">{analysis.ats_compatibility.score}/100</p>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-semibold text-green-800">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-green-700 text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="text-lg font-semibold text-red-800">Areas for Improvement</h4>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-red-700 text-sm">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sections Analysis */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900">Section Analysis</h4>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analysis.sections_analysis).map(([section, data]) => (
            <div key={section} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 capitalize">{section.replace('_', ' ')}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(data.score)}`}>
                  {data.score}/100
                </span>
              </div>
              <p className="text-sm text-gray-600">{data.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Analysis */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-purple-600" />
          <h4 className="text-lg font-semibold text-gray-900">Keyword Analysis</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-green-700 mb-3">Present Keywords</h5>
            <div className="flex flex-wrap gap-2">
              {analysis.keyword_analysis.present.map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-medium text-orange-700 mb-3">Missing Keywords</h5>
            <div className="flex flex-wrap gap-2">
              {analysis.keyword_analysis.missing.map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900">Improvement Suggestions</h4>
        </div>
        <div className="space-y-3">
          {analysis.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-700">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Actions */}
      {analysis.improvement_priority.length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-yellow-600" />
            <h4 className="text-lg font-semibold text-yellow-800">Priority Actions</h4>
          </div>
          <div className="space-y-2">
            {analysis.improvement_priority.map((priority, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-800 text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-yellow-800 font-medium">{priority}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
