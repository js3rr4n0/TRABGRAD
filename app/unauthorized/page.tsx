export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Acceso denegado</h1>
        <p className="text-gray-600">No tienes permisos para ver esta página.</p>
        <a href="/login" className="mt-4 inline-block text-blue-600 underline">Volver al login</a>
      </div>
    </div>
  );
}