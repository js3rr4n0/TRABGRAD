'use client';
import { UploadCloud, FileType, CheckCircle2, AlertCircle, X, Check, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';

const FORMATOS = {
  facultades: {
    nombre: 'Facultades.csv',
    columnas: ['nombre', 'codigo', 'activa']
  },
  carreras: {
    nombre: 'carreras.csv',
    columnas: ['nombre', 'codigo', 'facultad_id', 'activa']
  },
  usuarios: {
    nombre: 'usuarios.csv',
    columnas: ['nombre_completo', 'correo', 'password_hash', 'rol', 'activo', 'estado', 'rendimiento_pct', 'proyectos_activos', 'carnet', 'carrera_id', 'facultad_id', 'carreras_asignadas_json']
  },
  temas: {
    nombre: 'temas_historicos.csv',
    columnas: ['titulo', 'asesor_id', 'coordinador_id', 'tipo', 'estado', 'carrera_id', 'facultad_id', 'fecha_envio', 'fecha_aprobacion', 'fecha_inicio', 'fecha_fin']
  }
};

export default function CargaMasivaPage() {
  const [selectedType, setSelectedType] = useState<keyof typeof FORMATOS | null>(null);
  const [parsedData, setParsedData] = useState<{ headers: string[], rows: any[] } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return null;
    
    // Asumimos separador por coma
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      // Split básico por comas (no soporta comas dentro de comillas por ahora)
      const values = line.split(',');
      const row: any = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ? values[i].trim() : '';
      });
      return row;
    });
    return { headers, rows };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);
      if (data) {
        setParsedData(data);
      } else {
        alert('El archivo CSV parece estar vacío o mal formateado.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmarSubida = async () => {
    if (!parsedData || !selectedType) return;
    
    setIsUploading(true);
    try {
      const res = await fetch('/api/admin/carga-masiva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: selectedType,
          datos: parsedData.rows
        })
      });

      if (res.ok) {
        const result = await res.json();
        alert(`¡Éxito! Se han importado/actualizado ${result.insertados} registros en la base de datos.`);
        setParsedData(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'No se pudieron importar los datos'}`);
      }
    } catch (error) {
      alert('Error crítico de red al subir los datos a la base de datos.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#c92a2a]">Carga Masiva de Datos</h1>
        <p className="text-gray-500 text-sm mt-1">Importa registros masivamente verificando la información antes de guardarla.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Formularios Disponibles */}
        <div className="col-span-1 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">1. Selecciona Formato</h3>
          
          {(Object.keys(FORMATOS) as Array<keyof typeof FORMATOS>).map((key) => (
            <div 
              key={key}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedType === key ? 'border-[#c92a2a] bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'}`} 
              onClick={() => {
                setSelectedType(key);
                setParsedData(null); // Resetear datos si cambias de formato
                setFileName('');
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <FileType className={selectedType === key ? 'text-[#c92a2a]' : 'text-gray-400'} />
                <span className="font-bold text-gray-800">{FORMATOS[key].nombre}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">
                {FORMATOS[key].columnas.join(', ')}
              </p>
            </div>
          ))}
        </div>

        {/* Zona de Carga y Previsualización */}
        <div className="col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
            
            {!selectedType ? (
              <div className="flex-1 flex flex-col justify-center items-center opacity-50 py-20">
                <FileType size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Selecciona un formato</h3>
                <p className="text-gray-400 max-w-sm mt-2 text-center">Elige uno de los formatos soportados a la izquierda para comenzar la carga masiva.</p>
              </div>
            ) : !parsedData ? (
              // ZONA DE DRAG & DROP / UPLOAD
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-[#1b263b] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Sube el archivo {FORMATOS[selectedType].nombre}
                </h3>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-[#c92a2a] transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} className="text-[#c92a2a]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Haz clic para buscar en tu equipo</h3>
                  <p className="text-sm text-gray-500 mb-6">Archivo requerido en formato .CSV</p>
                  <button className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-xl font-medium shadow-sm hover:border-[#c92a2a] transition-colors pointer-events-none">
                    Seleccionar Archivo
                  </button>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    accept=".csv" 
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50 rounded-xl text-blue-700 text-sm text-left">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">Estructura requerida para {FORMATOS[selectedType].nombre}:</p>
                    <p className="font-mono text-xs mt-1 bg-white/50 p-2 rounded">
                      {FORMATOS[selectedType].columnas.join(',')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // ZONA DE PREVISUALIZACIÓN DE DATOS
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <span className="bg-[#1b263b] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                      Previsualización de Datos
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Archivo cargado: <span className="font-bold text-gray-700">{fileName}</span> ({parsedData.rows.length} registros encontrados)
                    </p>
                  </div>
                  <button 
                    onClick={() => { setParsedData(null); setFileName(''); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                  >
                    <X size={16} /> Cancelar y subir otro
                  </button>
                </div>

                {/* TABLA PREVIEW */}
                <div className="border border-gray-200 rounded-xl overflow-hidden flex-1 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 bg-gray-100">#</th>
                        {parsedData.headers.map((h, i) => (
                          <th key={i} className={`px-4 py-3 bg-gray-100 ${!FORMATOS[selectedType].columnas.includes(h) ? 'text-red-500' : ''}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedData.rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-400 font-bold">{i + 1}</td>
                          {parsedData.headers.map((h, colIndex) => (
                            <td key={colIndex} className="px-4 py-3 text-gray-700">
                              {row[h] || <span className="text-gray-300 italic">Vacio</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedData.rows.length > 10 && (
                  <p className="text-center text-sm text-gray-500 mb-6 italic">
                    Mostrando solo los primeros 10 registros de {parsedData.rows.length}.
                  </p>
                )}

                {/* ACCIONES FINALES */}
                <div className="bg-green-50 p-4 border border-green-100 rounded-xl flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3 text-green-800">
                    <CheckCircle2 size={24} />
                    <div>
                      <p className="font-bold">¿La información de la tabla es correcta?</p>
                      <p className="text-sm opacity-90">Verifica que las columnas coincidan con lo esperado antes de subir a Neon.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleConfirmarSubida}
                    disabled={isUploading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                    {isUploading ? 'Procesando subida...' : 'Confirmar y Subir a Base de Datos'}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
