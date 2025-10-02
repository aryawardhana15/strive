'use client';

import { User } from '@/types';
import { Pencil, User as UserIcon } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ProfileWidgetProps {
  user: User;
}

export default function ProfileWidget({ user }: ProfileWidgetProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profil</h3>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Pencil className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="w-8 h-8 text-primary-600" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{user.name}</h4>
          <p className="text-sm text-gray-600">{user.title}</p>
          <p className="text-sm text-primary-600 font-medium">
            +{formatNumber(user.xp_total)} XP
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total XP</span>
          <span className="font-medium">{formatNumber(user.xp_total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Streak</span>
          <span className="font-medium">{user.streak_count} hari</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Peringkat</span>
          <span className="font-medium">#{user.rank || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
