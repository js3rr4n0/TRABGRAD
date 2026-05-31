'use client';
import { useState, useEffect, useRef } from 'react';
import { UploadCloud, Send, FileText, CheckCircle2, MessageSquare, AlertCircle, Paperclip, Loader2, Clock, Users } from 'lucide-react';

export default function EgresadoDashboard() {
  const [activeTab, setActiveTab] = useState<'propuestas' | 'comentarios'>('propuestas');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tg, setTg] = useState<any>(null);
  const [propuestaActiva, setPropuestaActiva] = useState<any>(null);
  const [equipo, setEquipo] = useState<any[]>([]);
  const [invitacion, setInvitacion] = useState<any>(null);
  
  // Estados para el Modal de Invitación
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCarnet, setInviteCarnet] = useState('');
  const [inviting, setInviting] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [propuestas, setPropuestas] = useState({
    p1: '', p2: '', p3: ''
  });
  const [tipoTg, setTipoTg] = useState('proyecto');

  const fetchTgInfo = async () => {
    try {
      const res = await fetch('/api/egresado/propuestas');
      if (res.ok) {
        const data = await res.json();
        setTg(data.tg);
        setPropuestaActiva(data.propuesta);
        setEquipo(data.equipo || []);
        setInvitacion(data.invitacion || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTgInfo();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propuestas.p1 || !propuestas.p2 || !propuestas.p3 || !file) {
      return alert('Por favor llena las 3 propuestas y adjunta tu documento de soporte.');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('p1', propuestas.p1);
      formData.append('p2', propuestas.p2);
      formData.append('p3', propuestas.p3);
      formData.append('tipo', tipoTg);
      formData.append('documento', file);

      const res = await fetch('/api/egresado/propuestas', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert('Propuestas enviadas correctamente.');
        fetchTgInfo();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al enviar');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = () => {
    setInviteCarnet('');
    setShowInviteModal(true);
  };

  const submitInvite = async () => {
    if (!inviteCarnet.trim()) return;
    setInviting(true);
    try {
      const res = await fetch('/api/egresado/invitaciones', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ carnet: inviteCarnet.trim().toUpperCase(), tipo: tipoTg })
      });
      if (res.ok) {
        alert('Invitación enviada');
        setShowInviteModal(false);
        fetchTgInfo();
      } else {
        alert((await res.json()).error);
      }
    } catch (err) {
      alert('Error de red');
    } finally {
      setInviting(false);
    }
  };

  const handleInvitationReply = async (action: 'accept' | 'reject') => {
    try {
      const res = await fetch('/api/egresado/invitaciones', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ action, tg_id: invitacion.tg_id })
      });
      if (res.ok) {
        setInvitacion(null);
        fetchTgInfo();
      } else {
        alert((await res.json()).error);
      }
    } catch(err) {
      alert('Error de red');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-[#c92a2a]" size={32} /></div>;
  }

  if (invitacion) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
          <Users size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1b263b] mb-2">¡Tienes una invitación!</h2>
          <p className="text-gray-600">
            <strong>{invitacion.lider_nombre}</strong> te ha invitado a formar parte de su Trabajo de Graduación: <br/>
            <span className="italic text-gray-500">"{invitacion.titulo}"</span>
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-4 border-t border-gray-100">
          <button onClick={() => handleInvitationReply('reject')} className="px-6 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Rechazar</button>
          <button onClick={() => handleInvitationReply('accept')} className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30">Aceptar Invitación</button>
        </div>
      </div>
    );
  }

  const estadoVisual = propuestaActiva 
    ? propuestaActiva.estado === 'pendiente' ? 'Esperando Revisión' : propuestaActiva.estado
    : 'Redactando Propuestas';
    
  let colorEstado = 'bg-yellow-50 border-yellow-200 text-yellow-800';
  if (propuestaActiva?.estado === 'aprobada') colorEstado = 'bg-green-50 border-green-200 text-green-800';
  if (propuestaActiva?.estado === 'rechazada') colorEstado = 'bg-red-50 border-red-200 text-red-800';
  
  return (
    <div className="space-y-6">
      {/* HEADER ESTATUS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1b263b]">Mi Trabajo de Graduación</h1>
          <p className="text-gray-500 text-sm mt-1">Sube tus tres propuestas de tema. El coordinador evaluará y seleccionará una.</p>
        </div>
        <div className={`${colorEstado} px-4 py-2 rounded-xl flex items-center gap-3`}>
          <div className={`w-2.5 h-2.5 rounded-full ${propuestaActiva?.estado === 'pendiente' ? 'bg-yellow-500 animate-pulse' : 'bg-current opacity-70'}`}></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Estado Actual</p>
            <p className="text-sm font-semibold capitalize">{estadoVisual}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA PRINCIPAL (FORMULARIO O COMENTARIOS) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TABS */}
          <div className="flex gap-4 border-b border-gray-200 pb-px">
            <button 
              onClick={() => setActiveTab('propuestas')}
              className={`pb-3 px-1 font-bold text-sm transition-colors border-b-2 ${activeTab === 'propuestas' ? 'border-[#c92a2a] text-[#c92a2a]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Envío de Propuestas
            </button>
            <button 
              onClick={() => setActiveTab('comentarios')}
              className={`pb-3 px-1 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'comentarios' ? 'border-[#c92a2a] text-[#c92a2a]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Foro y Comentarios <span className="bg-[#c92a2a] text-white text-[10px] px-2 py-0.5 rounded-full">2 Nuevos</span>
            </button>
          </div>

          {activeTab === 'propuestas' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">Describe brevemente de qué tratará cada propuesta. Adjunta al final un único documento PDF que contenga el desarrollo, justificación y bases de las tres alternativas planteadas.</p>
              </div>

              {/* TIPO DE TG */}
              {!tg && (
                <div>
                  <label className="block text-sm font-bold text-[#1b263b] mb-2 flex items-center gap-2">¿Qué tipo de trabajo realizarás?</label>
                  <select 
                    value={tipoTg} onChange={e => setTipoTg(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a]"
                  >
                    <option value="proyecto">Proyecto de Graduación</option>
                    <option value="pasantia">Pasantía</option>
                    <option value="investigacion">Trabajo de Investigación (Tesis)</option>
                  </select>
                </div>
              )}

              {/* PROPUESTAS TEXTO */}
              {propuestaActiva ? (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <CheckCircle2 className="text-green-600" size={20} />
                  Propuestas Enviadas Exitosamente
                  </h3>
                  {propuestaActiva.motivo_rechazo && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
                      <p className="font-bold text-sm mb-1">Motivo de Rechazo:</p>
                      <p className="text-sm">{propuestaActiva.motivo_rechazo}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">Has enviado tus propuestas. Por favor, espera a que el coordinador las revise y emita una resolución en la sección de comentarios.</p>
                  <div className="flex items-center gap-2 bg-white p-4 rounded-xl border border-gray-200">
                    <FileText className="text-gray-400" />
                    <a href={propuestaActiva.documento_url} target="_blank" className="text-blue-600 font-bold hover:underline text-sm">Ver Documento Soporte PDF</a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="group">
                        <label className="block text-sm font-bold text-[#1b263b] mb-2 flex items-center gap-2">
                          <span className="bg-[#1b263b] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                            {num}
                          </span>
                          Propuesta de Tema {num}
                        </label>
                        <textarea 
                          required
                          value={(propuestas as any)[`p${num}`]}
                          onChange={(e) => setPropuestas({...propuestas, [`p${num}`]: e.target.value})}
                          placeholder={`Escribe el título y un breve resumen de tu propuesta número ${num}...`}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all min-h-[100px] resize-y group-hover:border-gray-300"
                        ></textarea>
                      </div>
                    ))}
                  </div>

                  <hr className="border-gray-100" />

                  {/* ARCHIVO PDF */}
                  <div>
                    <label className="block text-sm font-bold text-[#1b263b] mb-4 flex items-center gap-2">
                      <FileText size={18} className="text-[#c92a2a]" />
                      Documento de Soporte (Único archivo PDF)
                    </label>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-red-50 hover:border-[#c92a2a] transition-all cursor-pointer group bg-gray-50/50"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        {file ? <FileText size={28} className="text-[#c92a2a]" /> : <UploadCloud size={28} className="text-gray-400 group-hover:text-[#c92a2a]" />}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">{file ? file.name : 'Arrastra tu PDF aquí o haz clic'}</h3>
                      <p className="text-sm text-gray-500">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Tamaño máximo: 10MB'}</p>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <div className="pt-4 flex justify-end">
                    <button disabled={submitting} type="submit" className="bg-[#c92a2a] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-[#a02222] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50">
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                      {submitting ? 'Enviando...' : 'Enviar Propuestas al Coordinador'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* TAB DE COMENTARIOS */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
                <MessageSquare size={20} className="text-gray-500" />
                <h3 className="font-bold text-gray-800">Historial de Revisiones y Feedback</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                {/* Mensaje Sistema */}
                <div className="flex justify-center">
                  <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">Inicio del proceso de Trabajo de Graduación</span>
                </div>

                {/* Mensaje Coordinador */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">CR</div>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-tl-sm w-[85%]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-gray-800">Carlos Ramírez (Coordinador)</span>
                      <span className="text-xs text-gray-400">Hoy, 10:30 AM</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Hola. Bienvenido al sistema. Recuerda que la Propuesta 1 debe ser tu tema principal y de mayor interés. Estaré revisando la información una vez la subas.
                    </p>
                  </div>
                </div>

                {/* Mensaje Asesor */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">AS</div>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-tl-sm w-[85%]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-gray-800">Ana Silva (Asesora)</span>
                      <span className="text-xs text-gray-400">Hoy, 11:15 AM</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Me han asignado temporalmente como tu posible asesora. Avísame por aquí si tienes dudas en la redacción de la justificación técnica en el PDF.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Comentario */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-2 relative focus-within:border-[#c92a2a] transition-colors">
                    <textarea 
                      placeholder="Escribe tu respuesta a los coordinadores/asesores..." 
                      className="w-full bg-transparent resize-none focus:outline-none text-sm p-2 max-h-32 min-h-[40px] custom-scrollbar"
                      rows={2}
                    ></textarea>
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-700 transition-colors p-1" title="Adjuntar Archivo">
                        <Paperclip size={18} />
                      </button>
                    </div>
                  </div>
                  <button className="bg-[#1b263b] text-white p-4 rounded-xl hover:bg-[#0d1627] transition-colors shadow-sm shrink-0">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* SIDEBAR DERECHO (INFO ADICIONAL) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Información del Grupo</h3>
            <ul className="space-y-4">
              {equipo.length > 0 ? equipo.map(miembro => (
                <li key={miembro.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${miembro.estado_participacion === 'invitado' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' : 'bg-gray-100 text-gray-500'}`}>
                    {miembro.nombre_completo.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1b263b] flex items-center gap-2">
                      {miembro.nombre_completo}
                      {miembro.rol_grupo === 'lider' && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded uppercase">Líder</span>}
                    </p>
                    <p className="text-xs text-gray-500">{miembro.carnet} {miembro.estado_participacion === 'invitado' && '(Invitación Pendiente)'}</p>
                  </div>
                </li>
              )) : (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">TÚ</div>
                  <div>
                    <p className="text-sm font-bold text-[#1b263b]">Tú (Egresado Lider)</p>
                    <p className="text-xs text-gray-500">Sin guardar aún</p>
                  </div>
                </li>
              )}
              
              {/* Botón Invitar */}
              {!tg || equipo.length < 3 ? (
                <li className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400">+</div>
                  <div>
                    <button onClick={handleInvite} className="text-sm font-medium text-[#c92a2a] hover:underline">Invitar Integrante</button>
                    <p className="text-[10px] text-gray-500">Con su número de carnet</p>
                  </div>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#1b263b] to-[#2d3a54] rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-white/10">
              <CheckCircle2 size={120} />
            </div>
            <h3 className="font-bold mb-2 relative z-10">Criterios de Aprobación</h3>
            <ul className="text-sm text-gray-300 space-y-2 relative z-10 list-disc pl-4 mt-4">
              <li>Innovación y aplicabilidad técnica.</li>
              <li>Justificación metodológica clara.</li>
              <li>Cumplimiento de 300 hrs (Pasantía) o entregables completos (Proyecto).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL DE INVITACIÓN */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-red-50 text-[#c92a2a] rounded-full flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg leading-tight">Invitar Integrante</h3>
                <p className="text-xs text-gray-500">Añade a un compañero a tu proyecto</p>
              </div>
            </div>
            
            <div className="mb-6 space-y-2">
              <label className="block text-sm font-bold text-gray-700">Carnet del Estudiante</label>
              <input 
                type="text" 
                value={inviteCarnet}
                onChange={(e) => setInviteCarnet(e.target.value)}
                placeholder="Ej. 2019TM602"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] uppercase transition-all"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">El estudiante debe estar registrado y no tener un proyecto activo.</p>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                disabled={inviting}
              >
                Cancelar
              </button>
              <button 
                onClick={submitInvite}
                disabled={!inviteCarnet.trim() || inviting}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1b263b] hover:bg-[#0d1627] shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {inviting && <Loader2 size={16} className="animate-spin" />}
                Enviar Invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}