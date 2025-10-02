'use client';

import { StreakDay } from '@/types';

interface StreakCalendarProps {
  streakCount: number;
  streakCalendar: StreakDay[];
}

export default function StreakCalendar({ streakCount, streakCalendar }: StreakCalendarProps) {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {streakCount} Streaks 🔥
        </h3>
        <p className="text-sm text-gray-600">dalam satu bulan</p>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {streakCalendar.map((day, index) => (
          <div
            key={day.date}
            className={`
              aspect-square rounded-sm text-xs flex items-center justify-center
              ${day.isActive 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-400'
              }
            `}
            title={`${day.date} - ${day.isActive ? 'Active' : 'Inactive'}`}
          >
            {index < 7 ? day.date.split('-')[2] : ''}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Kurang</span>
        <span>Lebih</span>
      </div>
    </div>
  );
}
