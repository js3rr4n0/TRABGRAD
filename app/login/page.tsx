'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const roleRedirects: Record<string, string> = {
  administrador: '/dashboard/admin',
  coordinador: '/dashboard/coordinador',
  asesor: '/dashboard/asesor',
  egresado: '/dashboard/egresado',
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      correo: formData.get('correo'),
      password: formData.get('password'),
      redirect: false,
    });

    if (result?.error) {
      setError('Correo o contraseña incorrectos');
      setLoading(false);
      return;
    }

    setSuccess(true);
    const res = await fetch('/api/me');
    const data = await res.json();
    const destino = roleRedirects[data.role] ?? '/dashboard';
    setTimeout(() => router.push(destino), 800);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      
      {/* Tarjeta de Login */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 flex flex-col items-center">
        
        {/* Logo Placeholder (Similar a la imagen) */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-[#8b2020] rounded-full flex items-center justify-center text-white font-serif italic font-bold">
            U
          </div>
          <span className="text-[#8b2020] font-bold text-xl tracking-tight">UNICAES</span>
        </div>

        <h1 className="text-2xl sm:text-[26px] font-bold text-[#c92a2a] mb-2 text-center">
          Sistema de Gestión de TG
        </h1>
        <p className="text-gray-500 text-sm mb-8 text-center font-medium">
          Inicia sesión con tu cuenta institucional
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 border border-red-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Campo Correo */}
          <div>
            <label className="block text-[#4a5568] text-sm font-semibold mb-2">
              Correo institucional
            </label>
            <div className="relative">
              <input
                name="correo"
                type="email"
                required
                placeholder="usuario@trabgrad.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-[#4a5568] text-sm font-semibold mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#c92a2a] focus:ring-1 focus:ring-[#c92a2a] transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Opciones extras */}
          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4 border border-gray-300 rounded bg-white group-hover:border-[#c92a2a] transition-colors">
                <input type="checkbox" className="peer opacity-0 absolute w-full h-full cursor-pointer" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white peer-checked:text-[#c92a2a] transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 select-none">Recordarme</span>
            </label>
            <a href="#" className="text-sm font-medium text-[#c92a2a] hover:underline">
              Olvidé mi contraseña
            </a>
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base transition-all mt-4 flex items-center justify-center gap-2
              ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-[#c92a2a] hover:bg-[#b02222] shadow-[0_4px_14px_0_rgba(201,42,42,0.39)]'}
              ${(loading || success) ? 'opacity-80 cursor-not-allowed' : ''}
            `}
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {success ? 'Acceso concedido' : loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>

      {/* Tarjeta de Demo Credenciales */}
      <div className="w-full max-w-[500px] bg-white border border-gray-100 rounded-2xl p-6 mt-8 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4 border-b border-gray-100 pb-3">
          Credenciales de Acceso (Demo):
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-[13px]">
          {/* Admin */}
          <div className="flex flex-col">
            <div><span className="font-bold text-[#c92a2a]">Admin:</span> <span className="text-gray-600">admin@trabgrad.com</span></div>
            <div className="text-gray-400 mt-0.5">Pass: password</div>
          </div>
          
          {/* Coordinador */}
          <div className="flex flex-col">
            <div><span className="font-bold text-[#c92a2a]">Coord:</span> <span className="text-gray-600">coordinador@trabgrad.com</span></div>
            <div className="text-gray-400 mt-0.5">Pass: password</div>
          </div>

          {/* Asesor */}
          <div className="flex flex-col">
            <div><span className="font-bold text-[#c92a2a]">Asesor:</span> <span className="text-gray-600">asesor@trabgrad.com</span></div>
            <div className="text-gray-400 mt-0.5">Pass: password</div>
          </div>

          {/* Egresado */}
          <div className="flex flex-col">
            <div><span className="font-bold text-[#c92a2a]">Egresado:</span> <span className="text-gray-600">egresado@trabgrad.com</span></div>
            <div className="text-gray-400 mt-0.5">Pass: password</div>
          </div>
        </div>
      </div>
      
    </div>
  );
}