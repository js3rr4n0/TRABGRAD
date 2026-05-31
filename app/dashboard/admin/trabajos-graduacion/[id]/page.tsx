'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, FileText, Loader2, Users } from 'lucide-react';
import Link from 'next/link';

export default function DetalleTrabajoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [tg, setTg] = useState<any>(null);
  const [equipo, setEquipo] = useState<any[]>([]);
  const [propuesta, setPropuesta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados para modales de aprobación/rechazo
  const [actionLoading, setActionLoading] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  
  const [tituloAprobado, setTituloAprobado] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/admin/trabajos-graduacion/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTg(data.tg);
        setEquipo(data.equipo);
        setPropuesta(data.propuesta);
        if (data.propuesta) {
          try {
            const desc = JSON.parse(data.propuesta.descripcion);
            setTituloAprobado(desc.p1 || ''); // Default to P1 title
          } catch(e) {}
        }
      } else {
        router.push('/dashboard/admin/trabajos-graduacion');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAction = async (action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/trabajos-graduacion/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          titulo_aprobado: tituloAprobado,
          motivo_rechazo: motivoRechazo
        })
      });

      if (res.ok) {
        setShowApprove(false);
        setShowReject(false);
        fetchDetails(); // Reload state
      } else {
        alert('Error al procesar la solicitud');
      }
    } catch(err) {
      alert('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#c92a2a]" size={32} /></div>;
  if (!tg) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/trabajos-graduacion" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm border border-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1b263b]">{tg.titulo}</h1>
          <p className="text-gray-500 text-sm">Detalles y Evaluación de Propuestas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA PRINCIPAL */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECCIÓN DE PROPUESTAS */}
          {propuesta ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-800">Propuestas Enviadas</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${propuesta.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : propuesta.estado === 'aprobada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {propuesta.estado}
                </span>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map(num => {
                  let pText = '';
                  try {
                    const desc = typeof propuesta.descripcion === 'string' ? JSON.parse(propuesta.descripcion) : propuesta.descripcion;
                    pText = desc[`p${num}`];
                  } catch (e) {}

                  return pText ? (
                    <div key={num} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Propuesta {num}</p>
                      <p className="text-sm text-gray-800">{pText}</p>
                    </div>
                  ) : null;
                })}
              </div>

              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Documento Soporte PDF</p>
                    <p className="text-xs text-blue-600">Revisar para evaluar justificación</p>
                  </div>
                </div>
                <a href={propuesta.documento_url} target="_blank" className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                  Descargar
                </a>
              </div>

              {/* BOTONES DE ACCIÓN SOLO SI ESTÁ PENDIENTE */}
              {propuesta.estado === 'pendiente' && tg.estado === 'enviada' && (
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button onClick={() => setShowReject(true)} className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <XCircle size={18} /> Rechazar Propuestas
                  </button>
                  <button onClick={() => setShowApprove(true)} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Aprobar Propuesta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-800 mb-1">Aún no hay propuestas</h3>
              <p className="text-gray-500 text-sm">El grupo se encuentra redactando las propuestas o en fase de borrador.</p>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Información General</h3>
            <ul className="space-y-3 text-sm">
              <li><span className="text-gray-500 block text-xs">Tipo</span> <span className="font-bold capitalize">{tg.tipo}</span></li>
              <li><span className="text-gray-500 block text-xs">Facultad</span> <span className="font-bold">{tg.facultad_nombre || '-'}</span></li>
              <li><span className="text-gray-500 block text-xs">Carrera</span> <span className="font-bold">{tg.carrera_nombre || '-'}</span></li>
              <li><span className="text-gray-500 block text-xs">Estado General</span> <span className="font-bold uppercase text-[#c92a2a]">{tg.estado.replace('_', ' ')}</span></li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Users size={18} className="text-gray-400" /> Estudiantes
            </h3>
            <ul className="space-y-4">
              {equipo.map((est: any) => (
                <li key={est.id}>
                  <p className="font-bold text-sm text-[#1b263b] flex items-center gap-2">
                    {est.nombre_completo}
                    {est.rol_grupo === 'lider' && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded uppercase">Líder</span>}
                  </p>
                  <p className="text-xs text-gray-500">{est.carnet} • {est.estado_participacion}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL APROBAR */}
      {showApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aprobar Proyecto</h3>
            <p className="text-sm text-gray-500 mb-6">Selecciona o edita el título definitivo con el cual el proyecto será registrado de ahora en adelante.</p>
            
            <label className="block text-sm font-bold text-gray-700 mb-2">Título Definitivo del Proyecto</label>
            <textarea 
              value={tituloAprobado}
              onChange={e => setTituloAprobado(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-green-500 min-h-[100px]"
            />

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowApprove(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button onClick={() => handleAction('approve')} disabled={actionLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 flex justify-center items-center">
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Aprobación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECHAZAR */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-red-600">Rechazar Propuestas</h3>
            <p className="text-sm text-gray-500 mb-6">Las propuestas serán rechazadas y el grupo volverá a estado "Borrador" para que suban nuevas ideas.</p>
            
            <label className="block text-sm font-bold text-gray-700 mb-2">Motivo del rechazo (Feedback)</label>
            <textarea 
              value={motivoRechazo}
              onChange={e => setMotivoRechazo(e.target.value)}
              placeholder="Ej. Las propuestas no cumplen con el alcance mínimo..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-red-500 min-h-[100px]"
            />

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowReject(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button onClick={() => handleAction('reject')} disabled={actionLoading || !motivoRechazo.trim()} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 flex justify-center items-center">
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Rechazar Propuestas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
