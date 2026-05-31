'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, FileText, Loader2, Users, MessageSquare, Paperclip, Send } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

export default function DetalleTrabajoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [tg, setTg] = useState<any>(null);
  const [equipo, setEquipo] = useState<any[]>([]);
  const [propuesta, setPropuesta] = useState<any>(null);
  const [asesores, setAsesores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'propuestas'|'comentarios'>('propuestas');

  // Chat
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [comentarioFile, setComentarioFile] = useState<File | null>(null);
  const comentarioFileInputRef = useRef<HTMLInputElement>(null);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Estados para modales de aprobación/rechazo/asignar
  const [actionLoading, setActionLoading] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  
  const [tituloAprobado, setTituloAprobado] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [asesorSeleccionado, setAsesorSeleccionado] = useState<number | null>(null);
  const [modalError, setModalError] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/admin/trabajos-graduacion/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTg(data.tg);
        setEquipo(data.equipo);
        setPropuesta(data.propuesta);
        setAsesores(data.asesores || []);
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
    fetchComentarios();
  }, [id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [comentarios, activeTab]);

  const fetchComentarios = async () => {
    try {
      const res = await fetch(`/api/comentarios?tg_id=${id}`);
      if (res.ok) setComentarios(await res.json());
    } catch(err) {}
  };

  const enviarComentario = async () => {
    if (!nuevoComentario.trim() && !comentarioFile) return;
    setEnviandoComentario(true);
    try {
      const formData = new FormData();
      formData.append('tg_id', id as string);
      formData.append('mensaje', nuevoComentario);
      if (comentarioFile) formData.append('archivo', comentarioFile);

      const res = await fetch('/api/comentarios', { method: 'POST', body: formData });
      if (res.ok) {
        setComentarios([...comentarios, await res.json()]);
        setNuevoComentario('');
        setComentarioFile(null);
        if (comentarioFileInputRef.current) comentarioFileInputRef.current.value = '';
      }
    } catch(err) {}
    setEnviandoComentario(false);
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/trabajos-graduacion/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          titulo_aprobado: tituloAprobado,
          motivo_rechazo: motivoRechazo,
          asesor_id: asesorSeleccionado
        })
      });

      if (res.ok) {
        setShowApprove(false);
        setShowReject(false);
        setShowAssign(false);
        setModalError('');
        fetchDetails(); // Reload state
      } else {
        const errorData = await res.json();
        setModalError(errorData.error || 'Error al procesar la solicitud');
      }
    } catch(err) {
      setModalError('Error de conexión');
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
          <div className="flex gap-4 border-b border-gray-200 pb-px">
            <button 
              onClick={() => setActiveTab('propuestas')}
              className={`pb-3 px-1 font-bold text-sm transition-colors border-b-2 ${activeTab === 'propuestas' ? 'border-[#c92a2a] text-[#c92a2a]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Evaluación de Propuestas
            </button>
            <button 
              onClick={() => setActiveTab('comentarios')}
              className={`pb-3 px-1 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'comentarios' ? 'border-[#c92a2a] text-[#c92a2a]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Foro del Proyecto
            </button>
          </div>

          {activeTab === 'propuestas' ? (
            /* SECCIÓN DE PROPUESTAS */
            propuesta ? (
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
                    <div 
                      key={num} 
                      className={`p-4 rounded-xl border cursor-pointer transition-colors ${tituloAprobado === pText ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                      onClick={() => setTituloAprobado(pText)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold text-gray-500 uppercase">Propuesta {num}</p>
                        {tituloAprobado === pText && <CheckCircle2 size={16} className="text-green-600" />}
                      </div>
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
          )) : (
            /* TAB DE COMENTARIOS */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} className="text-gray-500" />
                  <h3 className="font-bold text-gray-800">Foro del Proyecto</h3>
                </div>
                <span className="text-xs text-gray-400">{comentarios.length} mensajes</span>
              </div>
              
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
                {comentarios.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 opacity-60">
                    <MessageSquare size={48} />
                    <p className="text-sm font-medium">Aún no hay mensajes en este proyecto</p>
                  </div>
                ) : (
                  comentarios.map((msg, idx) => {
                    const isMe = msg.rol === 'administrador'; 
                    return (
                      <div key={idx} className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isMe ? 'bg-[#c92a2a] text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {msg.nombre_completo.substring(0,2).toUpperCase()}
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[85%] ${isMe ? 'bg-[#c92a2a] text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                          <div className={`flex items-center justify-between mb-1 gap-4 ${isMe ? 'text-white/80' : 'text-gray-500'}`}>
                            <span className="font-bold text-xs">{msg.nombre_completo} ({msg.rol})</span>
                            <span className="text-[10px]">{new Date(msg.creado_en).toLocaleString()}</span>
                          </div>
                          {msg.mensaje && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.mensaje}</p>}
                          
                          {msg.archivo_url && (
                            <a href={msg.archivo_url} target="_blank" className={`mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                              {msg.archivo_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img src={msg.archivo_url} alt="Adjunto" className="max-h-32 rounded object-cover" />
                              ) : (
                                <><Paperclip size={14}/> Ver Archivo Adjunto</>
                              )}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Comentario */}
              <div className="p-4 bg-white border-t border-gray-100">
                {comentarioFile && (
                  <div className="mb-3 flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium w-fit">
                    <Paperclip size={14} />
                    {comentarioFile.name}
                    <button onClick={() => setComentarioFile(null)} className="ml-2 text-blue-400 hover:text-blue-800 font-bold">×</button>
                  </div>
                )}
                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-2 relative focus-within:border-[#c92a2a] transition-colors">
                    <textarea 
                      value={nuevoComentario}
                      onChange={e => setNuevoComentario(e.target.value)}
                      placeholder="Escribe un mensaje al grupo..." 
                      className="w-full bg-transparent resize-none focus:outline-none text-sm text-gray-900 placeholder-gray-500 p-2 max-h-32 min-h-[40px] custom-scrollbar"
                      rows={2}
                    ></textarea>
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <input type="file" ref={comentarioFileInputRef} className="hidden" onChange={e => e.target.files && setComentarioFile(e.target.files[0])} />
                      <button onClick={() => comentarioFileInputRef.current?.click()} className="text-gray-400 hover:text-[#c92a2a] transition-colors p-1" title="Adjuntar Archivo o Imagen">
                        <Paperclip size={18} />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={enviarComentario}
                    disabled={(!nuevoComentario.trim() && !comentarioFile) || enviandoComentario}
                    className="bg-[#1b263b] text-white p-4 rounded-xl hover:bg-[#0d1627] disabled:opacity-50 transition-colors shadow-sm shrink-0 flex items-center justify-center"
                  >
                    {enviandoComentario ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
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

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Asesor Asignado</h4>
              {tg.asesor_id ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {asesores.find(a => a.id === tg.asesor_id)?.nombre_completo?.substring(0,2).toUpperCase() || 'AS'}
                  </div>
                  <span className="font-bold text-sm text-gray-800">{asesores.find(a => a.id === tg.asesor_id)?.nombre_completo || `Asesor ID: ${tg.asesor_id}`}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-400 italic">No asignado</span>
                  {tg.estado === 'en_progreso' && (
                    <button onClick={() => setShowAssign(true)} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition-colors w-full">
                      Asignar Asesor
                    </button>
                  )}
                </div>
              )}
            </div>
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
            <p className="text-sm text-gray-500 mb-6">El título seleccionado será el título definitivo del proyecto. Puedes editarlo libremente.</p>
            
            <label className="block text-sm font-bold text-gray-700 mb-2">Título Definitivo del Proyecto (Max 255 caracteres)</label>
            <textarea 
              value={tituloAprobado}
              onChange={e => { setTituloAprobado(e.target.value); setModalError(''); }}
              maxLength={255}
              className={`w-full bg-gray-50 border rounded-xl p-3 text-sm text-gray-900 focus:outline-none min-h-[100px] ${modalError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-green-500'}`}
            />
            <p className="text-right text-xs text-gray-400 mt-1">{tituloAprobado.length}/255</p>

            {modalError && <p className="text-red-600 text-sm font-bold mt-2 text-center bg-red-50 py-2 rounded-lg">{modalError}</p>}

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
              onChange={e => { setMotivoRechazo(e.target.value); setModalError(''); }}
              placeholder="Ej. Las propuestas no cumplen con el alcance mínimo..."
              className={`w-full bg-gray-50 border rounded-xl p-3 text-sm text-gray-900 focus:outline-none min-h-[100px] ${modalError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-red-500'}`}
            />

            {modalError && <p className="text-red-600 text-sm font-bold mt-2 text-center bg-red-50 py-2 rounded-lg">{modalError}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowReject(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button onClick={() => handleAction('reject')} disabled={actionLoading || !motivoRechazo.trim()} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 flex justify-center items-center">
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Rechazar Propuestas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR ASESOR */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Asignar Asesor</h3>
            <p className="text-sm text-gray-500 mb-6">Selecciona el asesor que se encargará del seguimiento de este proyecto.</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {asesores.map(asesor => (
                <div 
                  key={asesor.id} 
                  onClick={() => { setAsesorSeleccionado(asesor.id); setModalError(''); }}
                  className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-colors ${asesorSeleccionado === asesor.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${asesorSeleccionado === asesor.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {asesor.nombre_completo.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{asesor.nombre_completo}</p>
                      <p className="text-xs text-gray-500">{asesor.tg_activos} proyectos activos</p>
                    </div>
                  </div>
                  {asesorSeleccionado === asesor.id && <CheckCircle2 size={18} className="text-blue-600" />}
                </div>
              ))}
              {asesores.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No hay asesores activos disponibles.</p>}
            </div>

            {modalError && <p className="text-red-600 text-sm font-bold mt-4 text-center bg-red-50 py-2 rounded-lg">{modalError}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAssign(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button 
                onClick={() => handleAction('assign_advisor')} 
                disabled={actionLoading || !asesorSeleccionado} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 flex justify-center items-center transition-colors"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Asignación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
