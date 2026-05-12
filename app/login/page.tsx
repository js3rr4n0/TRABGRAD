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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: #0b1120;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Fondo con orbes animados */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: float 8s ease-in-out infinite;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #1e40af, transparent);
          top: -150px; left: -150px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #0e7490, transparent);
          bottom: -100px; right: -100px;
          animation-delay: -4s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #4f46e5, transparent);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -2s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        /* Grid de puntos */
        .dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        /* Card */
        .card {
          position: relative;
          width: 100%;
          max-width: 420px;
          margin: 20px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 48px 40px;
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Logo / Header */
        .logo-area {
          text-align: center;
          margin-bottom: 36px;
          animation: fadeIn 0.8s ease 0.2s both;
        }

        .logo-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #1d4ed8, #0891b2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 8px 24px rgba(29, 78, 216, 0.4);
        }

        .logo-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 600;
          color: #f1f5f9;
          letter-spacing: -0.5px;
        }

        .logo-sub {
          font-size: 12.5px;
          color: #64748b;
          margin-top: 6px;
          font-weight: 300;
          letter-spacing: 0.3px;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
          margin-bottom: 32px;
        }

        /* Form fields */
        .field {
          margin-bottom: 18px;
          animation: fadeIn 0.6s ease both;
        }
        .field:nth-child(1) { animation-delay: 0.35s; }
        .field:nth-child(2) { animation-delay: 0.45s; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 8px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .field input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 13px 16px;
          color: #e2e8f0;
          font-size: 14.5px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
        }

        .field input::placeholder { color: #475569; }

        .field input:focus {
          border-color: rgba(99, 162, 255, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        /* Error */
        .error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          padding: 11px 14px;
          margin-bottom: 18px;
          color: #fca5a5;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }

        /* Button */
        .btn {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          animation: fadeIn 0.6s ease 0.55s both;
        }

        .btn-normal {
          background: linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(29, 78, 216, 0.35);
        }

        .btn-normal:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(29, 78, 216, 0.5);
        }

        .btn-normal:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-success {
          background: linear-gradient(135deg, #059669, #0d9488);
          color: white;
          box-shadow: 0 4px 20px rgba(5, 150, 105, 0.35);
        }

        /* Spinner */
        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .footer-text {
          text-align: center;
          margin-top: 28px;
          font-size: 11.5px;
          color: #334155;
          animation: fadeIn 0.6s ease 0.7s both;
        }
      `}</style>

      <div className="login-root">
        {/* Fondo */}
        <div className="dot-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="card">
          {/* Header */}
          <div className="logo-area">
            <div className="logo-icon">🎓</div>
            <div className="logo-title">TRABGRAD</div>
            <div className="logo-sub">Sistema de Gestión de Trabajos de Graduación</div>
          </div>

          <div className="divider" />

          {/* Error */}
          {error && (
            <div className="error-box">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Correo electrónico</label>
              <input
                name="correo"
                type="email"
                required
                placeholder="usuario@universidad.edu"
              />
            </div>

            <div className="field">
              <label>Contraseña</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`btn ${success ? 'btn-success' : 'btn-normal'}`}
            >
              {loading && <span className="spinner" />}
              {success ? '✓ Acceso concedido' : loading ? 'Verificando...' : 'Ingresar al sistema'}
            </button>
          </form>

          <div className="footer-text">
            © {new Date().getFullYear()} TRABGRAD · Acceso restringido
          </div>
        </div>
      </div>
    </>
  );
}