import React from 'react';
import { ImpersonationState, ImpersonationRole } from '../../types';
import { Eye, ShieldAlert, ArrowLeft, Lock, Unlock, Users, Tv, Settings } from 'lucide-react';

interface ImpersonationBarProps {
  state: ImpersonationState;
  onChangeRole: (role: ImpersonationRole, tableNumber?: number) => void;
  onToggleReadOnly: (readOnly: boolean) => void;
  onExitImpersonation: () => void;
}

export const ImpersonationBar: React.FC<ImpersonationBarProps> = ({
  state,
  onChangeRole,
  onToggleReadOnly,
  onExitImpersonation
}) => {
  if (!state.isActive) return null;

  return (
    <div className="bg-slate-950 border-b-2 border-orange-500 text-white px-4 py-2 sticky top-0 z-50 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-600 font-black text-[11px] tracking-wider animate-pulse">
          <Eye className="w-3.5 h-3.5" />
          <span>MODO DIOS (SIMULACIÓN)</span>
        </div>
        <span className="hidden sm:inline text-slate-400 font-medium text-[11px]">
          Verificando experiencia de sala sin credenciales del personal
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Selector de Rol al Vuelo */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => onChangeRole('WAITER', 1)}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition ${
              state.role === 'WAITER' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            Mesero
          </button>

          <button
            onClick={() => onChangeRole('KDS')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition ${
              state.role === 'KDS' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3 h-3" />
            Cocina (KDS)
          </button>

          <button
            onClick={() => onChangeRole('ADMIN')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition ${
              state.role === 'ADMIN' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3 h-3" />
            Admin Local
          </button>
        </div>

        {/* Toggle Solo Lectura vs Interactivo */}
        <button
          onClick={() => onToggleReadOnly(!state.readOnly)}
          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
            state.readOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
          title={state.readOnly ? 'Modo Fantasma (Sin alterar datos)' : 'Modo Interactivo (Permite acciones)'}
        >
          {state.readOnly ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          <span>{state.readOnly ? 'Solo Lectura' : 'Interactivo'}</span>
        </button>

        {/* Botón Volver a Consola Master */}
        <button
          onClick={onExitImpersonation}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-200 hover:text-white rounded-xl font-black text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Master</span>
        </button>
      </div>
    </div>
  );
};
