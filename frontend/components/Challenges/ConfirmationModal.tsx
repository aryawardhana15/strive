'use client';

import { X, Play, Clock, Trophy, Zap } from 'lucide-react';
import { Challenge } from '@/types';

interface ConfirmationModalProps {
  challenge: Challenge;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({ challenge, onConfirm, onCancel }: ConfirmationModalProps) {
  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Clock className="w-6 h-6 text-green-600" />;
      case 'weekly':
        return <Zap className="w-6 h-6 text-blue-600" />;
      case 'monthly':
        return <Trophy className="w-6 h-6 text-purple-600" />;
      default:
        return <Play className="w-6 h-6 text-gray-600" />;
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'weekly':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'monthly':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getButtonColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-green-600 hover:bg-green-700';
      case 'weekly':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'monthly':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getChallengeIcon(challenge.type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Konfirmasi Tantangan</h2>
              <p className="text-sm text-gray-600">Apakah Anda siap untuk memulai?</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`p-4 rounded-lg border-2 ${getChallengeColor(challenge.type)} mb-4`}>
            <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
            <p className="text-sm mb-3">{challenge.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Reward: +{challenge.xp_reward} XP</span>
              </div>
              <span className="text-xs font-medium uppercase">
                {challenge.type === 'daily' ? 'Harian' : 
                 challenge.type === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">📝 Yang akan Anda lakukan:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Membaca deskripsi tantangan</li>
              <li>• Menulis kode di editor</li>
              <li>• Mengirim solusi untuk dievaluasi</li>
              <li>• Mendapat feedback dan XP jika berhasil</li>
            </ul>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${getButtonColor(challenge.type)}`}
            >
              Mulai Tantangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
