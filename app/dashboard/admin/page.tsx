import { Users, GraduationCap, UserCheck, FileText, Building, BookOpen } from 'lucide-react';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Consultas a la base de datos
  const [resUsuariosActivos, resAsesores, resFacultades, resCarreras] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM sistema_tg.usuarios WHERE activo = true`,
    sql`SELECT COUNT(*) as count FROM sistema_tg.usuarios WHERE rol = 'asesor'`,
    sql`SELECT COUNT(*) as count FROM sistema_tg.facultades`,
    sql`SELECT COUNT(*) as count FROM sistema_tg.carreras`
  ]);

  const stats = {
    usuariosActivos: parseInt(resUsuariosActivos[0].count) || 0,
    asesores: parseInt(resAsesores[0].count) || 0,
    facultades: parseInt(resFacultades[0].count) || 0,
    carreras: parseInt(resCarreras[0].count) || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#c92a2a]">Panel de Administración</h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">Hoy es {hoy}</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-red-50 text-[#c92a2a] flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Usuarios Activos</p>
            <p className="text-2xl font-bold text-gray-800">{stats.usuariosActivos}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-wider">REGISTRADOS EN SISTEMA</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Asesores</p>
            <p className="text-2xl font-bold text-gray-800">{stats.asesores}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-wider">DOCENTES GUÍA</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Facultades</p>
            <p className="text-2xl font-bold text-gray-800">{stats.facultades}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-wider">ÁREAS ACADÉMICAS</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Carreras</p>
            <p className="text-2xl font-bold text-gray-800">{stats.carreras}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-wider">OFERTA ACADÉMICA</p>
          </div>
        </div>
      </div>

      {/* Gráficos Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#c92a2a] mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            TGs por Estado
          </h3>
          <div className="h-64 flex items-end justify-around pb-6 relative border-b border-gray-100">
            {/* Y Axis */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-6">
              <span>120</span><span>90</span><span>60</span><span>30</span><span>0</span>
            </div>
            
            {/* Bars */}
            <div className="w-16 h-[40%] bg-slate-500 rounded-t-md relative group"><span className="absolute -bottom-6 w-full text-center text-xs text-gray-500">Borrador</span></div>
            <div className="w-16 h-[30%] bg-[#cb2a2a] rounded-t-md relative group"><span className="absolute -bottom-6 w-full text-center text-xs text-gray-500">Enviada</span></div>
            <div className="w-16 h-[15%] bg-[#c92a2a] rounded-t-md relative group"><span className="absolute -bottom-6 w-full text-center text-xs text-gray-500">Rechazada</span></div>
            <div className="w-16 h-[60%] bg-green-700 rounded-t-md relative group"><span className="absolute -bottom-6 w-full text-center text-xs text-gray-500">Aprobada</span></div>
            <div className="w-16 h-[95%] bg-[#c92a2a] rounded-t-md relative group"><span className="absolute -bottom-6 w-full text-center text-xs text-gray-500">En Progreso</span></div>
            <div className="w-16 h-[40%] bg-green-700 rounded-t-md relative group"><span className="absolute -bottom-6 w-full text-center text-xs text-gray-500">Finalizada</span></div>
            <div className="w-16 h-[10%] bg-[#c92a2a] rounded-t-md relative group"><span className="absolute -bottom-6 w-full text-center text-xs text-gray-500">Abandonada</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#c92a2a] mb-6">Distribución General</h3>
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="w-40 h-40 rounded-full border-[16px] border-t-green-700 border-r-[#c92a2a] border-b-slate-500 border-l-[#c92a2a]"></div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500"></div>Borrador</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#cb2a2a]"></div>Enviada</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#c92a2a]"></div>Rechazada</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-700"></div>Aprobada</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}