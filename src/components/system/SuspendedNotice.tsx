import React from 'react';
import { AlertOctagon, Wrench, Clock, Phone } from 'lucide-react';
import { SystemBranding } from '../../types';

interface SuspendedNoticeProps {
  reason?: string;
  branding?: SystemBranding | null;
}

export const SuspendedNotice: React.FC<SuspendedNoticeProps> = ({
  reason = 'Mantenimiento Programado / Servicio temporalmente no disponible',
  branding
}) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <Wrench className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-xl font-extrabold text-white tracking-tight">
          {branding?.restaurantName || 'RestoSuite'}
        </h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold mt-2 mb-4">
          <AlertOctagon className="w-3.5 h-3.5" />
          Servicio Pausado
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          {reason}
        </p>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-left space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Clock className="w-4 h-4 text-orange-400" />
            <span>Estamos trabajando en la plataforma</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            La toma de pedidos y visualización de comandas se restablecerá a la brevedad. Gracias por su comprensión.
          </p>
          {branding?.contactPhone && (
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-300 font-medium">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>Contacto de recepción: {branding.contactPhone}</span>
            </div>
          )}
        </div>
      </div>
      <span className="text-[11px] text-slate-600 mt-6 font-mono">
        System Status: HALTED BY OPERATOR
      </span>
    </div>
  );
};
