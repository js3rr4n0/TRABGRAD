'use client';
import { useState, useEffect } from 'react';
import { Building, BookOpen, Plus, Loader2, AlertCircle, Trash2 } from 'lucide-react';

type Facultad = { id: number; nombre: string; codigo: string; activa: boolean };
type Carrera = { id: number; nombre: string; codigo: string; facultad_id: number; facultad_nombre?: string; activa: boolean };

export default function FacultadesCarrerasPage() {
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [nuevaFacultad, setNuevaFacultad] = useState({ nombre: '', codigo: '' });
  const [nuevaCarrera, setNuevaCarrera] = useState({ nombre: '', codigo: '', facultad_id: '' });
  const [savingFacultad, setSavingFacultad] = useState(false);
  const [savingCarrera, setSavingCarrera] = useState(false);
  const [deletingId, setDeletingId] = useState<{tipo: 'facultad'|'carrera', id: number} | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [facRes, carRes] = await Promise.all([
        fetch('/api/admin/facultades'),
        fetch('/api/admin/carreras')
      ]);
      
      const facData = await facRes.json();
      const carData = await carRes.json();

      if (facRes.ok) setFacultades(facData.facultades || []);
      else setErrorMsg(facData.error || 'Error al cargar facultades');

      if (carRes.ok) setCarreras(carData.carreras || []);
      else if (!errorMsg) setErrorMsg(carData.error || 'Error al cargar carreras');

    } catch (err) {
      setErrorMsg('Error de conexión al obtener datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCrearFacultad = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFacultad(true);
    try {
      const res = await fetch('/api/admin/facultades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nuevaFacultad, activa: true })
      });
      if (res.ok) {
        setNuevaFacultad({ nombre: '', codigo: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al crear facultad');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setSavingFacultad(false);
    }
  };

  const handleCrearCarrera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCarrera.facultad_id) return alert('Selecciona una facultad');
    
    setSavingCarrera(true);
    try {
      const res = await fetch('/api/admin/carreras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nuevaCarrera, activa: true, facultad_id: parseInt(nuevaCarrera.facultad_id) })
      });
      if (res.ok) {
        setNuevaCarrera({ nombre: '', codigo: '', facultad_id: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al crear carrera');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setSavingCarrera(false);
    }
  };

  const handleDeleteFacultad = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta facultad? Si tiene carreras asignadas, no se podrá borrar.')) return;
    setDeletingId({ tipo: 'facultad', id });
    try {
      const res = await fetch(`/api/admin/facultades/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFacultades(facultades.filter(f => f.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de red');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCarrera = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta carrera?')) return;
    setDeletingId({ tipo: 'carrera', id });
    try {
      const res = await fetch(`/api/admin/carreras/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCarreras(carreras.filter(c => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de red');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#c92a2a]">Gestión de Facultades y Carreras</h1>
          <p className="text-gray-500 text-sm mt-1">Administra la estructura académica de la institución.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-sm">Aviso de Base de Datos</p>
            <p className="text-sm">{errorMsg}</p>
            <p className="text-xs mt-1 text-orange-600 font-medium">Nota: Asegúrate de haber ejecutado el script SQL para crear estas tablas en Neon.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-[#c92a2a]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SECCIÓN FACULTADES */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c92a2a] flex items-center justify-center">
                <Building size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Facultades</h2>
            </div>

            {/* Formulario Crear Facultad */}
            <form onSubmit={handleCrearFacultad} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de Facultad</label>
                <input 
                  type="text" required value={nuevaFacultad.nombre} onChange={e => setNuevaFacultad({...nuevaFacultad, nombre: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a]" 
                  placeholder="Ej: Ingeniería" 
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-bold text-gray-700 mb-1">Código</label>
                <input 
                  type="text" required value={nuevaFacultad.codigo} onChange={e => setNuevaFacultad({...nuevaFacultad, codigo: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] uppercase" 
                  placeholder="FING" 
                />
              </div>
              <button disabled={savingFacultad} type="submit" className="bg-[#1b263b] text-white p-2 rounded-lg hover:bg-[#0d1627] transition-colors disabled:opacity-50">
                {savingFacultad ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              </button>
            </form>

            {/* Lista de Facultades */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facultades.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No hay facultades registradas.</td></tr>
                  ) : facultades.map(fac => (
                    <tr key={fac.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-700">{fac.codigo}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{fac.nombre}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${fac.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {fac.activa ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleDeleteFacultad(fac.id)}
                          disabled={deletingId?.tipo === 'facultad' && deletingId.id === fac.id}
                          className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId?.tipo === 'facultad' && deletingId.id === fac.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {/* SECCIÓN CARRERAS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Carreras</h2>
            </div>

            {/* Formulario Crear Carrera */}
            <form onSubmit={handleCrearCarrera} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex flex-col gap-3">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de Carrera</label>
                  <input 
                    type="text" required value={nuevaCarrera.nombre} onChange={e => setNuevaCarrera({...nuevaCarrera, nombre: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a]" 
                    placeholder="Ej: Ing. Sistemas" 
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Código</label>
                  <input 
                    type="text" required value={nuevaCarrera.codigo} onChange={e => setNuevaCarrera({...nuevaCarrera, codigo: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] uppercase" 
                    placeholder="IINF" 
                  />
                </div>
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pertenece a la Facultad</label>
                  <select 
                    required value={nuevaCarrera.facultad_id} onChange={e => setNuevaCarrera({...nuevaCarrera, facultad_id: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a]"
                  >
                    <option value="">Seleccione...</option>
                    {facultades.map(f => (
                      <option key={f.id} value={f.id}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
                <button disabled={savingCarrera} type="submit" className="bg-[#1b263b] text-white px-4 py-2 rounded-lg hover:bg-[#0d1627] transition-colors disabled:opacity-50 font-medium text-sm flex items-center gap-2">
                  {savingCarrera ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Agregar
                </button>
              </div>
            </form>

            {/* Lista de Carreras */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Carrera y Facultad</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {carreras.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No hay carreras registradas.</td></tr>
                  ) : carreras.map(car => (
                    <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-700">{car.codigo}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 font-medium">{car.nombre}</p>
                        <p className="text-[11px] text-[#c92a2a] font-bold">{car.facultad_nombre}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${car.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {car.activa ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleDeleteCarrera(car.id)}
                          disabled={deletingId?.tipo === 'carrera' && deletingId.id === car.id}
                          className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId?.tipo === 'carrera' && deletingId.id === car.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
