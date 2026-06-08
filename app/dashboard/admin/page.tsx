import { Users, GraduationCap, UserCheck, FileText, Building, BookOpen } from 'lucide-react';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Consultas a la base de datos
  const [resUsuariosActivos, resAsesores, resFacultades, resCarreras, resEstados] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM sistema_tg.usuarios WHERE activo = true`,
    sql`SELECT COUNT(*) as count FROM sistema_tg.usuarios WHERE rol = 'asesor'`,
    sql`SELECT COUNT(*) as count FROM sistema_tg.facultades`,
    sql`SELECT COUNT(*) as count FROM sistema_tg.carreras`,
    sql`SELECT estado, COUNT(*) as count FROM sistema_tg.tg GROUP BY estado`
  ]);

  const stats = {
    usuariosActivos: parseInt(resUsuariosActivos[0].count) || 0,
    asesores: parseInt(resAsesores[0].count) || 0,
    facultades: parseInt(resFacultades[0].count) || 0,
    carreras: parseInt(resCarreras[0].count) || 0,
  };

  const estadosData = resEstados.reduce((acc: any, curr: any) => {
    acc[curr.estado] = parseInt(curr.count) || 0;
    return acc;
  }, { borrador: 0, enviada: 0, rechazada: 0, aprobada: 0, en_progreso: 0, finalizada: 0, abandonada: 0 });

  const totalTgs = Object.values(estadosData).reduce((a: any, b: any) => a + b, 0) as number;
  const maxTg = Math.max(...(Object.values(estadosData) as number[]), 10); // Minimum 10 for scale
  const scale = [maxTg, Math.round(maxTg * 0.75), Math.round(maxTg * 0.5), Math.round(maxTg * 0.25), 0];

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

      {/* Gráficos Reales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#c92a2a] mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            TGs por Estado
          </h3>
          <div className="h-64 flex items-end justify-around pb-6 relative border-b border-gray-100 pl-8">
            {/* Y Axis */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs font-bold text-gray-400">
              {scale.map((val, i) => <span key={i}>{val}</span>)}
            </div>
            
            {/* Bars */}
            {[
              { label: 'Borrador', val: estadosData.borrador, color: 'bg-gray-400' },
              { label: 'Enviada', val: estadosData.enviada, color: 'bg-blue-500' },
              { label: 'Rechazada', val: estadosData.rechazada, color: 'bg-red-500' },
              { label: 'Aprobada', val: estadosData.aprobada, color: 'bg-green-500' },
              { label: 'Progreso', val: estadosData.en_progreso, color: 'bg-[#c92a2a]' },
              { label: 'Finalizada', val: estadosData.finalizada, color: 'bg-emerald-600' },
              { label: 'Abandono', val: estadosData.abandonada, color: 'bg-gray-800' }
            ].map(item => (
              <div key={item.label} className={`w-12 sm:w-16 ${item.color} rounded-t-md relative group transition-all hover:opacity-80`} style={{ height: `${totalTgs === 0 ? 0 : Math.max(5, (item.val / maxTg) * 100)}%` }}>
                <span className="absolute -top-6 w-full text-center text-xs font-bold text-gray-700">{item.val}</span>
                <span className="absolute -bottom-6 w-full text-center text-[10px] sm:text-xs font-medium text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#c92a2a] mb-6">Distribución General</h3>
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="w-40 h-40 rounded-full border-[16px] relative overflow-hidden" 
              style={{
                background: totalTgs > 0 ? `conic-gradient(
                  #9ca3af 0% ${(estadosData.borrador/totalTgs)*100}%,
                  #3b82f6 ${(estadosData.borrador/totalTgs)*100}% ${((estadosData.borrador+estadosData.enviada)/totalTgs)*100}%,
                  #ef4444 ${((estadosData.borrador+estadosData.enviada)/totalTgs)*100}% ${((estadosData.borrador+estadosData.enviada+estadosData.rechazada)/totalTgs)*100}%,
                  #22c55e ${((estadosData.borrador+estadosData.enviada+estadosData.rechazada)/totalTgs)*100}% ${((estadosData.borrador+estadosData.enviada+estadosData.rechazada+estadosData.aprobada)/totalTgs)*100}%,
                  #c92a2a ${((estadosData.borrador+estadosData.enviada+estadosData.rechazada+estadosData.aprobada)/totalTgs)*100}% ${((estadosData.borrador+estadosData.enviada+estadosData.rechazada+estadosData.aprobada+estadosData.en_progreso)/totalTgs)*100}%,
                  #059669 ${((estadosData.borrador+estadosData.enviada+estadosData.rechazada+estadosData.aprobada+estadosData.en_progreso)/totalTgs)*100}% ${((estadosData.borrador+estadosData.enviada+estadosData.rechazada+estadosData.aprobada+estadosData.en_progreso+estadosData.finalizada)/totalTgs)*100}%,
                  #1f2937 ${((estadosData.borrador+estadosData.enviada+estadosData.rechazada+estadosData.aprobada+estadosData.en_progreso+estadosData.finalizada)/totalTgs)*100}% 100%
                )` : '#f3f4f6'
              }}>
              <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center font-bold text-gray-800 text-xl shadow-inner">
                {totalTgs}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-700 font-semibold">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div>Borrador ({estadosData.borrador})</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Enviada ({estadosData.enviada})</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Rechazada ({estadosData.rechazada})</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#c92a2a]"></div>En Progreso ({estadosData.en_progreso})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}