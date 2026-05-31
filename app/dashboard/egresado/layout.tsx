import Link from 'next/link';
import { LogOut, User, Bell, GraduationCap } from 'lucide-react';
import { signOut } from '@/auth'; // Assuming auth is properly configured
import { redirect } from 'next/navigation';

export default async function EgresadoLayout({ children }: { children: React.ReactNode }) {
  // Aquí podemos cargar la sesión para el nombre
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-[#1b263b] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#c92a2a] flex items-center justify-center text-white shadow-lg">
                <GraduationCap size={22} />
              </div>
              <span className="text-xl font-bold tracking-wide">TRAB<span className="text-[#c92a2a]">GRAD</span></span>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="relative text-gray-300 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#c92a2a] rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-gray-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-tight">Egresado</p>
                  <p className="text-xs text-gray-400">Portal Estudiantil</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                  <User size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
