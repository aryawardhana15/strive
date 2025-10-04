'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Skill, SkillsByCategory, AddSkillForm } from '@/types';
import { skillsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillAdded: () => void;
  userId: number;
}

export default function AddSkillModal({ isOpen, onClose, onSkillAdded, userId }: AddSkillModalProps) {
  const [skills, setSkills] = useState<SkillsByCategory>({});
  const [loading, setLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSkills();
    }
  }, [isOpen]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await skillsAPI.getAll();
      setSkills(response.data.data.skillsByCategory);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;

    setSubmitting(true);
    try {
      await skillsAPI.addSkill(userId, selectedSkill.id, selectedLevel);
      onSkillAdded();
      onClose();
      setSelectedSkill(null);
      setSelectedLevel('beginner');
    } catch (error) {
      console.error('Error adding skill:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Tambah Skill Baru 🚀</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-gray-600 mb-6">
            Pilih skill yang relevan dengan tujuan kariermu dan mulailah belajar hari ini.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Skill Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pilih Skill
                </label>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="loading-spinner"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(skills).map(([category, categorySkills]) => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {categorySkills.map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => setSelectedSkill(skill)}
                              className={cn(
                                'p-3 text-left border rounded-lg transition-colors',
                                selectedSkill?.id === skill.id
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                            >
                              <span className="text-sm font-medium">{skill.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Level Selection */}
              {selectedSkill && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Level Kemampuan
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
                      { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
                      { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' },
                    ].map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setSelectedLevel(level.value as any)}
                        className={cn(
                          'p-3 border rounded-lg transition-colors text-sm font-medium',
                          selectedLevel === level.value
                            ? `${level.color} border-current`
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!selectedSkill || submitting}
              onClick={handleSubmit}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Tambah Skill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
