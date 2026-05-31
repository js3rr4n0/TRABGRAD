'use client';
import { useState } from 'react';
import { UploadCloud, Send, FileText, CheckCircle2, MessageSquare, AlertCircle, Paperclip } from 'lucide-react';

export default function EgresadoDashboard() {
  const [activeTab, setActiveTab] = useState<'propuestas' | 'comentarios'>('propuestas');
  
  // State mockups
  const [propuestas, setPropuestas] = useState({
    p1: '', p2: '', p3: ''
  });
  
  return (
    <div className="space-y-6">
      {/* HEADER ESTATUS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1b263b]">Mi Trabajo de Graduación</h1>
          <p className="text-gray-500 text-sm mt-1">Sube tus tres propuestas de tema. El coordinador evaluará y seleccionará una.</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Estado Actual</p>
            <p className="text-sm font-semibold text-yellow-900">Redactando Propuestas</p>
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

              {/* PROPUESTAS TEXTO */}
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
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-red-50 hover:border-[#c92a2a] transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={28} className="text-[#c92a2a]" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">Arrastra tu PDF aquí o haz clic</h3>
                  <p className="text-sm text-gray-500">Tamaño máximo: 10MB</p>
                </div>
              </div>

              {/* SUBMIT */}
              <div className="pt-4 flex justify-end">
                <button className="bg-[#c92a2a] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-[#a02222] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <Send size={18} /> Enviar Propuestas al Coordinador
                </button>
              </div>
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
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">TÚ</div>
                <div>
                  <p className="text-sm font-bold text-[#1b263b]">Tú (Egresado Lider)</p>
                  <p className="text-xs text-gray-500">AA00123</p>
                </div>
              </li>
              {/* Ejemplo si hay compañeros */}
              <li className="flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400">+</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sin compañero asignado</p>
                  <p className="text-xs text-[#c92a2a] cursor-pointer hover:underline">Invitar Integrante</p>
                </div>
              </li>
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
    </div>
  );
}