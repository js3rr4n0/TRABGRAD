'use client';
import { ArrowLeft, Info, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

type Carrera = { id: number; nombre: string; facultad_nombre: string };

export default function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    carnet: '',
    rol: 'egresado',
    carrera_id: '',
    activo: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [carrerasRes, userRes] = await Promise.all([
          fetch('/api/admin/carreras'),
          fetch(`/api/admin/usuarios/${resolvedParams.id}`)
        ]);

        if (carrerasRes.ok) {
          const data = await carrerasRes.json();
          setCarreras(data.carreras || []);
        }

        if (userRes.ok) {
          const data = await userRes.json();
          const u = data.usuario;
          setFormData({
            nombre_completo: u.nombre_completo || '',
            correo: u.correo || '',
            carnet: u.carnet || '',
            rol: u.rol || 'egresado',
            carrera_id: u.carrera_id ? String(u.carrera_id) : '',
            activo: u.activo
          });
        } else {
          setErrorMsg('No se pudo cargar la información del usuario.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMsg('Error de red al cargar datos.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin/usuarios/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          carrera_id: formData.carrera_id ? parseInt(formData.carrera_id) : null
        })
      });

      if (res.ok) {
        router.push('/dashboard/admin/usuarios');
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Error al actualizar usuario');
      }
    } catch (error) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-[#c92a2a]" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/admin/usuarios"
          className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#1b263b]">Editar Usuario</h1>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-medium border border-red-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-[#1b263b] flex items-center gap-2 mb-6">
            <Info size={18} className="text-blue-500" />
            Información Personal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Nombre Completo</label>
              <input 
                type="text" required value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})}
                placeholder="Ej: Juan Pérez"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Correo Institucional</label>
              <input 
                type="email" required value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})}
                placeholder="usuario@universidad.edu"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Carnet (Opcional)</label>
              <input 
                type="text" value={formData.carnet} onChange={e => setFormData({...formData, carnet: e.target.value})}
                placeholder="Ej: 20240101"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Contraseña</label>
              <input 
                type="text" disabled placeholder="•••••••• (Solo lectura)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 font-medium cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2 font-medium">Por seguridad, la contraseña no se puede editar aquí.</p>
            </div>
          </div>
        </div>

        {/* Rol y Adscripción */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-[#1b263b] mb-6">
            Rol y Adscripción
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Rol</label>
              <select 
                value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all appearance-none"
              >
                <option value="egresado">Egresado</option>
                <option value="asesor">Asesor</option>
                <option value="coordinador">Coordinador</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Carrera Principal</label>
              <select 
                value={formData.carrera_id} onChange={e => setFormData({...formData, carrera_id: e.target.value})}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all appearance-none"
              >
                <option value="">Seleccionar carrera</option>
                {carreras.map(car => (
                  <option key={car.id} value={car.id}>{car.nombre} ({car.facultad_nombre})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative flex items-center justify-center w-5 h-5 bg-[#6366f1] rounded">
              <input 
                type="checkbox" 
                checked={formData.activo} 
                onChange={e => setFormData({...formData, activo: e.target.checked})}
                className="peer opacity-0 absolute w-full h-full cursor-pointer" 
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-[#1b263b] text-sm">Usuario Activo</span>
          </label>

          <div className="flex gap-4">
            <Link 
              href="/dashboard/admin/usuarios"
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#1b263b] hover:bg-[#0d1627] text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
