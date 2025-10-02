'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Job, UserSkill, Activity, Roadmap } from '@/types';
import { auth } from '@/lib/auth';
import { usersAPI, jobsAPI, roadmapsAPI } from '@/lib/api';
import WelcomeBanner from '@/components/Dashboard/WelcomeBanner';
import { StreakCard, RankCard, TitleCard } from '@/components/Dashboard/StatsCard';
import AddSkillSection from '@/components/Dashboard/AddSkillSection';
import JobRecommendationCard from '@/components/Dashboard/JobRecommendationCard';
import ProfileWidget from '@/components/Dashboard/ProfileWidget';
import StreakCalendar from '@/components/Dashboard/StreakCalendar';
import ActivityHistory from '@/components/Dashboard/ActivityHistory';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [jobRecommendations, setJobRecommendations] = useState<Job[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activeCourse, setActiveCourse] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch user data in parallel
        const [profileResponse, skillsResponse, jobsResponse, activitiesResponse, roadmapsResponse] = await Promise.all([
          usersAPI.getProfile(currentUser.id),
          skillsAPI.getUserSkills(currentUser.id),
          jobsAPI.getRecommended(currentUser.id, { limit: 6 }),
          usersAPI.getActivities(currentUser.id, { limit: 4 }),
          roadmapsAPI.getAll()
        ]);

        setUser(profileResponse.data.data);
        setUserSkills(skillsResponse.data.data.skills || []);
        setJobRecommendations(jobsResponse.data.data || []);
        setRecentActivities(activitiesResponse.data.data.activities || []);

        // Set active course (first roadmap for demo)
        if (roadmapsResponse.data.data.length > 0) {
          setActiveCourse(roadmapsResponse.data.data[0]);
        }

      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const handleSkillAdded = async () => {
    if (user) {
      try {
        const [profileResponse, skillsResponse] = await Promise.all([
          usersAPI.getProfile(user.id),
          skillsAPI.getUserSkills(user.id)
        ]);
        setUser(profileResponse.data.data);
        setUserSkills(skillsResponse.data.data.skills || []);
      } catch (error) {
        console.error('Error refreshing data after skill added:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner user={user} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StreakCard streakCount={user.streak_count} />
        <RankCard rank={user.rank || 0} />
        <TitleCard title={user.title} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Skill Section */}
          <AddSkillSection
            userSkills={userSkills}
            userId={user.id}
            onSkillAdded={handleSkillAdded}
          />

          {/* Career Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Rekomendasi Karier Untukmu 💼
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Berdasarkan skill dan minatmu, berikut jalur karier yang bisa kamu kejar.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobRecommendations.slice(0, 4).map((job) => (
                <JobRecommendationCard
                  key={job.id}
                  job={job}
                  onClick={() => router.push(`/careers/${job.id}`)}
                />
              ))}
            </div>
          </div>

          {/* Active Course */}
          {activeCourse && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Kursus yang Diambil 📚
              </h2>
              <p className="text-gray-600 mb-6">
                Lanjutkan perjalananmu dan selesaikan roadmap menuju karier impian.
              </p>
              
              <div className="card">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {activeCourse.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {activeCourse.description}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progres</span>
                        <span className="font-medium">56%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: '56%' }}></div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/progress')}
                    className="btn btn-primary"
                  >
                    Lanjutkan →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Discover Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Temukan Kursus 🔍
              </h2>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Lihat Semua →
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Temukan kursus sesuai minatmu dan mulailah kembangkan skill baru.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Science</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Pelajari Python, machine learning, dan analisis data. Siap jadi Data Scientist dengan project praktis.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>👥 1K Pengguna</span>
                    <span>Menengah</span>
                    <span>400 XP</span>
                  </div>
                  <button className="w-full btn btn-primary">
                    Lanjutkan →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Widget */}
          <ProfileWidget user={user} />

          {/* Streak Calendar */}
          {user.streak_calendar && (
            <StreakCalendar
              streakCount={user.streak_count}
              streakCalendar={user.streak_calendar}
            />
          )}

          {/* Activity History */}
          <ActivityHistory activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}
