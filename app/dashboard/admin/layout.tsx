'use client';
import { LayoutDashboard, Users, UploadCloud, LogOut, Search, Bell, Building } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#c92a2a] text-white flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#c92a2a] font-serif italic font-bold text-xl shadow-sm">
            U
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight tracking-wide">Gestión TG</h2>
            <p className="text-[10px] uppercase tracking-wider opacity-80">UNICAES</p>
          </div>
        </div>

        <nav className="flex-1 mt-6 flex flex-col gap-2 px-4">
          <Link 
            href="/dashboard/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard/admin' ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-90'}`}
          >
            <LayoutDashboard size={20} className={pathname === '/dashboard/admin' ? 'opacity-100' : 'opacity-70'} />
            <span className="text-sm">Dashboard</span>
          </Link>
          
          <Link 
            href="/dashboard/admin/usuarios" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.includes('/dashboard/admin/usuarios') ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-90'}`}
          >
            <Users size={20} className={pathname.includes('/dashboard/admin/usuarios') ? 'opacity-100' : 'opacity-70'} />
            <span className="text-sm">Usuarios</span>
          </Link>

          <Link 
            href="/dashboard/admin/facultades-carreras" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.includes('/dashboard/admin/facultades-carreras') ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-90'}`}
          >
            <Building size={20} className={pathname.includes('/dashboard/admin/facultades-carreras') ? 'opacity-100' : 'opacity-70'} />
            <span className="text-sm">Facultades y Carreras</span>
          </Link>

          <Link 
            href="/dashboard/admin/carga-masiva" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard/admin/carga-masiva' ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-90'}`}
          >
            <UploadCloud size={20} className={pathname === '/dashboard/admin/carga-masiva' ? 'opacity-100' : 'opacity-70'} />
            <span className="text-sm">Carga Masiva</span>
          </Link>
        </nav>

        <div className="p-4 mb-2">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-white/10 transition-all opacity-90 text-sm"
          >
            <LogOut size={20} className="opacity-70" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px] flex flex-col">
        {/* Topbar */}
        <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-[#c92a2a] transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#c92a2a] rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#c92a2a]">Admin</p>
                <p className="text-[10px] font-bold text-white bg-[#c92a2a] px-1.5 py-0.5 rounded uppercase">ADMIN</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-[#c92a2a] overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=f4f6f9" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
