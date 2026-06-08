'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2, ArrowLeft, Users, Building, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NuevoTGPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'proyecto',
    estado: 'borrador',
    carrera_id: '',
    facultad_id: '',
    asesor_id: '',
    coordinador_id: '',
    estudiantes_carnets: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  const [facultades, setFacultades] = useState<any[]>([]);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [facRes, carRes, usrRes] = await Promise.all([
          fetch('/api/admin/facultades'),
          fetch('/api/admin/carreras'),
          fetch('/api/admin/usuarios')
        ]);
        if (facRes.ok) setFacultades((await facRes.json()).facultades || []);
        if (carRes.ok) setCarreras((await carRes.json()).carreras || []);
        if (usrRes.ok) setUsuarios((await usrRes.json()).usuarios || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const asesores = usuarios.filter(u => u.rol === 'asesor' || u.rol === 'coordinador' || u.rol === 'administrador');
  const coordinadores = usuarios.filter(u => u.rol === 'coordinador' || u.rol === 'administrador');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/admin/trabajos-graduacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          carrera_id: parseInt(formData.carrera_id),
          facultad_id: parseInt(formData.facultad_id),
          asesor_id: formData.asesor_id ? parseInt(formData.asesor_id) : null,
          coordinador_id: formData.coordinador_id ? parseInt(formData.coordinador_id) : null,
        })
      });

      if (res.ok) {
        router.push('/dashboard/admin/trabajos-graduacion');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al crear');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/trabajos-graduacion" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1b263b] flex items-center gap-2">
            <BookOpen size={24} className="text-[#c92a2a]" />
            Nuevo Trabajo de Graduación
          </h1>
          <p className="text-gray-500 text-sm mt-1">Registra manualmente un proyecto, pasantía o tesis.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
        
        {/* Título y Tipo */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
            <BookOpen size={18} className="text-[#c92a2a]" /> Datos del Trabajo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Título del Trabajo *</label>
              <input 
                type="text" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
                placeholder="Ej: Sistema Integrado de..." 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tipo *</label>
              <select 
                required value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              >
                <option value="proyecto">Proyecto</option>
                <option value="pasantia">Pasantía</option>
                <option value="investigacion">Investigación (Tesis)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
              <select 
                value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              >
                <option value="borrador">Borrador</option>
                <option value="enviada">Enviada</option>
                <option value="aprobada">Aprobada</option>
                <option value="en_progreso">En Progreso</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Inicio</label>
              <input 
                type="date" value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Fin</label>
              <input 
                type="date" value={formData.fecha_fin} onChange={e => setFormData({...formData, fecha_fin: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Académico */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Building size={18} className="text-[#c92a2a]" /> Entorno Académico
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Facultad *</label>
              <select 
                required value={formData.facultad_id} onChange={e => setFormData({...formData, facultad_id: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              >
                <option value="">Seleccione...</option>
                {facultades.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Carrera *</label>
              <select 
                required value={formData.carrera_id} onChange={e => setFormData({...formData, carrera_id: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              >
                <option value="">Seleccione...</option>
                {carreras.filter(c => !formData.facultad_id || c.facultad_id === parseInt(formData.facultad_id)).map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Participantes */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Users size={18} className="text-[#c92a2a]" /> Participantes
          </h2>
          <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>Puedes agregar múltiples alumnos escribiendo sus carnets separados por comas (Ej: AA001, BB002). Estos alumnos deben estar ya registrados en el sistema.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Carnets de Estudiantes</label>
              <input 
                type="text" value={formData.estudiantes_carnets} onChange={e => setFormData({...formData, estudiantes_carnets: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] uppercase transition-all"
                placeholder="EJ: 2020SS601, 2019TM602" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Asesor (Opcional)</label>
              <select 
                value={formData.asesor_id} onChange={e => setFormData({...formData, asesor_id: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              >
                <option value="">Ninguno asignado aún</option>
                {asesores.map(a => <option key={a.id} value={a.id}>{a.nombre_completo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Coordinador (Opcional)</label>
              <select 
                value={formData.coordinador_id} onChange={e => setFormData({...formData, coordinador_id: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              >
                <option value="">Ninguno asignado aún</option>
                {coordinadores.map(c => <option key={c.id} value={c.id}>{c.nombre_completo}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
          <Link href="/dashboard/admin/trabajos-graduacion" className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
            Cancelar
          </Link>
          <button disabled={saving} type="submit" className="bg-[#c92a2a] hover:bg-[#a02222] text-white px-8 py-2.5 rounded-xl font-bold shadow-md shadow-red-500/20 transition-all disabled:opacity-50 flex items-center gap-2 text-sm">
            {saving && <Loader2 size={16} className="animate-spin" />}
            Guardar Trabajo de Graduación
          </button>
        </div>

      </form>
    </div>
  );
}
