'use client';
import Link from 'next/link';
import { LogOut, User, Bell, GraduationCap } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function EgresadoLayout({ children }: { children: React.ReactNode }) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };
  // Aquí podemos cargar la sesión para el nombre
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-[#c92a2a] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shadow-sm">
                <GraduationCap size={22} />
              </div>
              <span className="text-xl font-bold tracking-wide">TRABGRAD</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="relative text-white/80 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-[#c92a2a]"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-[#ff4d4d]/30">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-tight">Egresado</p>
                  <p className="text-xs text-white/70">Portal Estudiantil</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                  <User size={18} />
                </div>
              </div>
              
              <button 
                onClick={handleSignOut}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white ml-2"
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
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
