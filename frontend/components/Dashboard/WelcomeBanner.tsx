'use client';

import { User } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WelcomeBannerProps {
  user: User;
}

export default function WelcomeBanner({ user }: WelcomeBannerProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
        <Sparkles className="w-full h-full text-white" />
      </div>
      <div className="absolute top-4 right-4 w-16 h-16 opacity-30">
        <Sparkles className="w-full h-full text-white" />
      </div>
      <div className="absolute bottom-4 right-8 w-12 h-12 opacity-25">
        <Sparkles className="w-full h-full text-white" />
      </div>
      <div className="absolute top-8 right-16 w-8 h-8 opacity-35">
        <Sparkles className="w-full h-full text-white" />
      </div>

      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">
          Halo, {user.name}! 👋
        </h1>
        <p className="text-xl mb-4 opacity-90">
          Siap naik level hari ini?
        </p>
        <p className="text-lg opacity-80 mb-6">
          Jelajahi course, ikuti roadmap, dan terus maju menuju karier impian.
        </p>
        <button
          onClick={() => router.push('/progress')}
          className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
        >
          <span>Jelajahi Course</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
