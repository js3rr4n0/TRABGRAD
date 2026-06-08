'use client';
import { BookOpen, Search, Trash2, Eye, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Trabajo = {
  id: number;
  titulo: string;
  tipo: string;
  estado: string;
  fecha_inicio: string | null;
  asesor_nombre: string | null;
  coordinador_nombre: string | null;
  facultad_nombre: string | null;
  carrera_nombre: string | null;
  estudiantes: { nombre: string; carnet: string }[] | null;
};

export default function TrabajosGraduacionPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');

  useEffect(() => {
    async function fetchTrabajos() {
      try {
        const res = await fetch('/api/admin/trabajos-graduacion');
        if (res.ok) {
          const data = await res.json();
          setTrabajos(data.trabajos || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrabajos();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este trabajo de graduación? Esta acción no se puede deshacer.')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/trabajos-graduacion/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTrabajos(trabajos.filter(t => t.id !== id));
      } else {
        alert('Error al eliminar el registro.');
      }
    } catch (error) {
      alert('Error de conexión.');
    } finally {
      setDeletingId(null);
    }
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 text-green-800';
      case 'rechazada': return 'bg-red-100 text-red-800';
      case 'en_progreso': return 'bg-blue-100 text-blue-800';
      case 'finalizada': return 'bg-purple-100 text-purple-800';
      case 'abandonada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800'; // borrador, enviada
    }
  };

  const trabajosFiltrados = trabajos.filter(tg => {
    // Buscar por título
    const matchTitulo = tg.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Buscar por estudiante (nombre o carnet)
    const matchEstudiante = studentQuery === '' || (tg.estudiantes && tg.estudiantes.some(e => 
      e.nombre.toLowerCase().includes(studentQuery.toLowerCase()) || 
      e.carnet.toLowerCase().includes(studentQuery.toLowerCase())
    ));

    // Filtrar por tipo
    const matchTipo = tipoFilter === 'Todos' || tg.tipo === tipoFilter.toLowerCase();

    // Filtrar por estado
    const matchEstado = estadoFilter === 'Todos' || tg.estado === estadoFilter.toLowerCase();

    return matchTitulo && matchEstudiante && matchTipo && matchEstado;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b263b] flex items-center gap-2">
            <BookOpen size={24} className="text-[#c92a2a]" />
            Trabajos de Graduación
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los temas históricos y proyectos activos de los estudiantes.</p>
        </div>
        <Link href="/dashboard/admin/trabajos-graduacion/nuevo" className="bg-[#1b263b] hover:bg-[#0d1627] text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm text-sm">
          <Plus size={18} />
          <span>Nuevo Registro</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por título de proyecto..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
          />
        </div>

        <div className="relative min-w-[200px]">
          <input 
            type="text" 
            value={studentQuery}
            onChange={e => setStudentQuery(e.target.value)}
            placeholder="Filtrar por estudiante..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
          />
        </div>

        <select 
          value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none min-w-[150px]"
        >
          <option>Todos</option>
          <option>Proyecto</option>
          <option>Investigacion</option>
          <option>Pasantia</option>
        </select>

        <select 
          value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none min-w-[150px]"
        >
          <option>Todos</option>
          <option value="borrador">Borrador</option>
          <option value="enviada">Enviada</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
          <option value="en_progreso">En Progreso</option>
          <option value="finalizada">Finalizada</option>
          <option value="abandonada">Abandonada</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              <th className="px-6 py-4">Título del Trabajo</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Estudiantes</th>
              <th className="px-6 py-4">Asesores / Coord.</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-center">Fecha Inicio</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-[#c92a2a] mb-2" />
                    Cargando trabajos de graduación...
                  </div>
                </td>
              </tr>
            ) : trabajosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No hay trabajos de graduación registrados. Sube el CSV en Carga Masiva.
                </td>
              </tr>
            ) : (
              trabajosFiltrados.map((tg) => (
                <tr key={tg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 max-w-[200px]">
                    <p className="font-bold text-[#1b263b] truncate" title={tg.titulo}>{tg.titulo}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase truncate" title={tg.carrera_nombre || ''}>
                      {tg.carrera_nombre}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-600 capitalize">{tg.tipo}</span>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    {tg.estudiantes && tg.estudiantes.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {tg.estudiantes.map((e, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800 truncate" title={e.nombre}>{e.nombre}</span>
                            <span className="text-[10px] text-gray-500 font-bold">{e.carnet}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin estudiantes</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800">{tg.asesor_nombre || 'Sin Asesor'}</p>
                    <p className="text-xs text-gray-500">{tg.coordinador_nombre || 'Sin Coord.'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getEstadoStyle(tg.estado)}`}>
                      {tg.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 text-xs font-medium">
                    {tg.fecha_inicio ? new Date(tg.fecha_inicio).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <Link href={`/dashboard/admin/trabajos-graduacion/${tg.id}`} className="text-gray-400 hover:text-blue-600 transition-colors" title="Ver Detalles">
                        <Eye size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(tg.id)}
                        disabled={deletingId === tg.id}
                        className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Eliminar de la Base de Datos"
                      >
                        {deletingId === tg.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
