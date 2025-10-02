'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BarChart3, 
  Trophy, 
  Briefcase, 
  FileText, 
  Users,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'Progress Belajar', href: '/progress', icon: BarChart3 },
  { name: 'Tantangan', href: '/challenges', icon: Trophy },
  { name: 'Karier', href: '/careers', icon: Briefcase },
  { name: 'CV Review', href: '/cv-review', icon: FileText },
  { name: 'Komunitas', href: '/community', icon: Users },
];

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-primary-600">Strive</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'sidebar-item',
                isActive && 'active'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Card */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">St+</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Upgrade ke Strive+
              </h3>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Dapatkan akses penuh ke fitur eksklusif untuk mempercepat perjalanan kariermu.
          </p>
          <button className="w-full bg-primary-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors">
            Pelajari →
          </button>
        </div>
      </div>
    </div>
  );
}
