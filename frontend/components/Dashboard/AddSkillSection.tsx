'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { UserSkill } from '@/types';
import AddSkillModal from './AddSkillModal';

interface AddSkillSectionProps {
  userSkills: UserSkill[];
  userId: number;
  onSkillAdded: () => void;
}

export default function AddSkillSection({ userSkills, userId, onSkillAdded }: AddSkillSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tambah Skill Baru 🚀</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Pilih skill yang relevan dengan tujuan kariermu dan mulailah belajar hari ini.
      </p>

      {/* Current Skills */}
      {userSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {userSkills.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
              >
                {skill.name}
                <span className="ml-1 text-xs opacity-75">({skill.level})</span>
              </span>
            ))}
            {userSkills.length > 3 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                +{userSkills.length - 3} lainnya
              </span>
            )}
          </div>
        </div>
      )}

      {/* Add Skill Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
      >
        <Plus className="w-5 h-5 text-gray-400" />
        <span className="text-gray-600 font-medium">Tambah Skill</span>
      </button>

      <AddSkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSkillAdded={onSkillAdded}
        userId={userId}
      />
    </div>
  );
}
