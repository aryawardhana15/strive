'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectTestPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to test login page
    router.push('/test-login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to test login...</p>
      </div>
    </div>
  );
}
