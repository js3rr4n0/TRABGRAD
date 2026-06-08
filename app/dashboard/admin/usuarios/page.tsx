'use client';
import { Plus, Search, Edit3, Eye, MoreHorizontal, Check, X, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Tipos basados en la BD
type Usuario = {
  id: number;
  nombre_completo: string;
  correo: string;
  rol: 'egresado' | 'asesor' | 'coordinador' | 'administrador';
  facultad_nombre: string | null;
  carrera_nombre: string | null;
  activo: boolean;
  ultimo_acceso: string | null;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modificados, setModificados] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [rolFilter, setRolFilter] = useState('Todos los Roles');
  const [estadoFilter, setEstadoFilter] = useState('Estado');
  const [facultadFilter, setFacultadFilter] = useState('Facultad');

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const response = await fetch('/api/admin/usuarios');
        if (response.ok) {
          const data = await response.json();
          setUsuarios(data.usuarios);
        } else {
          console.error('Error al cargar usuarios');
        }
      } catch (error) {
        console.error('Error de red al cargar usuarios:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsuarios();
  }, []);

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    // Solo cambiar estado local
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, activo: !currentStatus } : u));
    
    // Registrar que este usuario fue modificado
    const nuevosModificados = new Set(modificados);
    if (nuevosModificados.has(id)) nuevosModificados.delete(id); // Si lo regresa a como estaba (doble toggle)
    else nuevosModificados.add(id);
    
    setModificados(nuevosModificados);
  };

  const handleGuardarCambios = async () => {
    if (modificados.size === 0) return;
    setSaving(true);
    
    try {
      const promesas = Array.from(modificados).map(id => {
        const usuario = usuarios.find(u => u.id === id);
        if (!usuario) return Promise.resolve();
        
        return fetch(`/api/admin/usuarios/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activo: usuario.activo })
        });
      });

      await Promise.all(promesas);
      
      setModificados(new Set());
      alert('Cambios guardados correctamente.');
    } catch (error) {
      alert('Hubo un error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente a este usuario?')) return;
    
    setDeletingId(id);
    setDeleteMessage('');
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsuarios(usuarios.filter(u => u.id !== id));
        setDeleteMessage(`El usuario "${nombre}" ha sido borrado exitosamente.`);
        setTimeout(() => setDeleteMessage(''), 5000);
      } else {
        alert('Error al eliminar el usuario.');
      }
    } catch (error) {
      alert('Error de conexión.');
    } finally {
      setDeletingId(null);
    }
  };

  const getRolStyle = (rol: string) => {
    switch(rol) {
      case 'asesor': return 'bg-green-50 text-green-700 uppercase';
      case 'egresado': return 'bg-gray-100 text-gray-600 uppercase';
      case 'coordinador': return 'bg-blue-50 text-blue-700 uppercase';
      case 'administrador': return 'bg-red-50 text-[#c92a2a] uppercase';
      default: return 'bg-gray-100 text-gray-700 uppercase';
    }
  };

  const facultadesUnicas = Array.from(new Set(usuarios.map(u => u.facultad_nombre).filter(Boolean)));

  const usuariosFiltrados = usuarios.filter(user => {
    const term = searchQuery.toLowerCase();
    const carnetStr = (user as any).carnet ? (user as any).carnet.toLowerCase() : '';
    const matchesSearch = 
      user.nombre_completo.toLowerCase().includes(term) || 
      user.correo.toLowerCase().includes(term) ||
      carnetStr.includes(term);
    
    const matchesRol = rolFilter === 'Todos los Roles' || user.rol === rolFilter.toLowerCase();
    
    let matchesEstado = true;
    if (estadoFilter === 'Activos') matchesEstado = user.activo === true;
    if (estadoFilter === 'Inactivos') matchesEstado = user.activo === false;

    const matchesFacultad = facultadFilter === 'Facultad' || user.facultad_nombre === facultadFilter;

    return matchesSearch && matchesRol && matchesEstado && matchesFacultad;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#c92a2a]">Gestión de Usuarios</h1>
        <Link 
          href="/dashboard/admin/usuarios/nuevo"
          className="flex items-center gap-2 bg-[#1b263b] hover:bg-[#0d1627] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nuevo Usuario
        </Link>
      </div>

      {deleteMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 size={18} />
          {deleteMessage}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o correo..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <select 
            value={rolFilter} onChange={e => setRolFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 focus:outline-none"
          >
            <option>Todos los Roles</option>
            <option>Administrador</option>
            <option>Coordinador</option>
            <option>Asesor</option>
            <option>Egresado</option>
          </select>
          <select 
            value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 focus:outline-none"
          >
            <option>Estado</option>
            <option>Activos</option>
            <option>Inactivos</option>
          </select>
          <select 
            value={facultadFilter} onChange={e => setFacultadFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 focus:outline-none"
          >
            <option>Facultad</option>
            {facultadesUnicas.map(fac => <option key={fac} value={fac!}>{fac}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Cabecera de la tabla con el Botón Guardar si hay modificaciones */}
        {modificados.size > 0 && (
          <div className="bg-blue-50/50 p-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-blue-800 font-medium">
              Tienes {modificados.size} cambio(s) sin guardar en los estados de los usuarios.
            </p>
            <button 
              onClick={handleGuardarCambios}
              disabled={saving}
              className="bg-[#1b263b] hover:bg-[#0d1627] text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Guardar Cambios
            </button>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              <th className="px-6 py-4">Nombre Completo</th>
              <th className="px-6 py-4">Correo</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Facultad / Carrera</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-center">Último Acceso</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {usuariosFiltrados.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-[#c92a2a]">{user.nombre_completo}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{user.correo}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getRolStyle(user.rol)}`}>
                    {user.rol}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-[#c92a2a]">{user.facultad_nombre || 'Sin Asignar'}</p>
                  <p className="text-xs text-gray-600 font-medium">{user.carrera_nombre || 'Sin Asignar'}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleToggleActive(user.id, user.activo)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${user.activo ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${user.activo ? 'translate-x-5' : ''}`}></div>
                  </button>
                </td>
                <td className="px-6 py-4 text-center text-gray-600 font-medium text-xs">
                  {user.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : <span className="text-gray-400 italic">No ha accedido</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3 text-gray-500">
                    <Link href={`/dashboard/admin/usuarios/${user.id}/editar`} className="hover:text-blue-600 transition-colors" title="Editar">
                      <Edit3 size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(user.id, user.nombre_completo)}
                      disabled={deletingId === user.id}
                      className="hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {deletingId === user.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No se encontraron usuarios con estos filtros.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            Mostrar 
            <select className="border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none">
              <option>10</option>
              <option>20</option>
            </select>
            registros
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Anterior</button>
            <button className="px-3 py-1.5 bg-[#1b263b] text-white rounded-lg text-sm font-medium">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
