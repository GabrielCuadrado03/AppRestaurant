import React from 'react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
        <span className="text-6xl font-black text-slate-300 block mb-2 tracking-tighter">404</span>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Página no encontrada</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          La dirección que ingresaste no existe en nuestros servidores o ha sido movida temporalmente.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          Regresar a la página principal
        </a>
      </div>
      <span className="text-[11px] text-slate-400 mt-6">HTTP 404 Not Found • Servidor Seguro</span>
    </div>
  );
};

export default NotFound;
