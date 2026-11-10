import React, { useState } from 'react';
import { SystemLicense, FeatureFlags } from '../../types';
import {
  ShieldAlert,
  Power,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';

interface LicenseManagerProps {
  license: SystemLicense;
  onUpdateLicense: (updated: Partial<SystemLicense>) => Promise<void>;
}

export const LicenseManager: React.FC<LicenseManagerProps> = ({
  license,
  onUpdateLicense
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState(
    license.suspensionReason || 'Mantenimiento Programado / Servicio no disponible'
  );
  const [expiryDate, setExpiryDate] = useState<string>(() => {
    if (license.licenseExpiryDate?.toDate) {
      return license.licenseExpiryDate.toDate().toISOString().split('T')[0];
    }
    if (typeof license.licenseExpiryDate === 'string') {
      return license.licenseExpiryDate.split('T')[0];
    }
    return '2027-12-31';
  });

  const [confirmKillSwitchOpen, setConfirmKillSwitchOpen] = useState(false);

  // Toggle rápido de Kill Switch maestro
  const handleToggleKillSwitch = async (suspend: boolean) => {
    setIsUpdating(true);
    await onUpdateLicense({
      isSuspended: suspend,
      suspensionReason: suspend ? suspensionReason : undefined,
      updatedAt: new Date()
    });
    setConfirmKillSwitchOpen(false);
    setIsUpdating(false);
  };

  // Toggle individual de Feature Flags
  const handleToggleFeature = async (featureKey: keyof FeatureFlags) => {
    setIsUpdating(true);
    const updatedFlags: FeatureFlags = {
      ...license.featureFlags,
      [featureKey]: !license.featureFlags[featureKey]
    };
    await onUpdateLicense({
      featureFlags: updatedFlags,
      updatedAt: new Date()
    });
    setIsUpdating(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await onUpdateLicense({
      suspensionReason,
      licenseExpiryDate: expiryDate,
      updatedAt: new Date()
    });
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN KILL SWITCH MAESTRO */}
      <div className={`p-6 rounded-3xl border transition-all ${
        license.isSuspended
          ? 'bg-rose-950/40 border-rose-600/80 shadow-2xl shadow-rose-900/30'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              license.isSuspended
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <Power className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Interruptor Maestro (Kill Switch)
                </h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  license.isSuspended
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {license.isSuspended ? 'SISTEMA SUSPENDIDO' : 'OPERACIÓN NORMAL'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Si activas la suspensión, el sistema completo (meseros, cocina KDS, menú QR de clientes y administración local)
                mostrará una pantalla de "Servicio no disponible" bloqueando cualquier toma de comanda.
              </p>
            </div>
          </div>

          <div>
            {license.isSuspended ? (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleToggleKillSwitch(false)}
                className="px-5 py-3 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition cursor-pointer flex items-center gap-2"
              >
                <Power className="w-4 h-4" />
                Reactivar Sistema
              </button>
            ) : (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => setConfirmKillSwitchOpen(true)}
                className="px-5 py-3 rounded-2xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition cursor-pointer flex items-center gap-2"
              >
                <Power className="w-4 h-4" />
                Suspender Sistema (Kill Switch)
              </button>
            )}
          </div>
        </div>

        {/* Motivo de suspensión editable si está suspendido */}
        {license.isSuspended && (
          <div className="mt-4 pt-4 border-t border-rose-800/40 flex items-center gap-2 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Motivo actual mostrado a usuarios: <strong>"{license.suspensionReason || 'Mantenimiento Programado'}"</strong>
            </span>
          </div>
        )}
      </div>

      {/* 2. FEATURE FLAGS EN CALIENTE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <Sliders className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-extrabold text-white">
            Feature Flags del Sistema (Activación / Desactivación en Caliente)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Prende o apaga módulos individuales sin desplegar código ni reiniciar el servidor.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Menú QR */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Menú QR Móvil</span>
              <span className="text-[11px] text-slate-500">Catálogo web para comensales</span>
            </div>
            <button
              onClick={() => handleToggleFeature('qrMenu')}
              className={`p-1 text-2xl transition cursor-pointer ${
                license.featureFlags?.qrMenu !== false ? 'text-emerald-500' : 'text-slate-600'
              }`}
            >
              {license.featureFlags?.qrMenu !== false ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* KDS Cocina */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">KDS Cocina</span>
              <span className="text-[11px] text-slate-500">Monitor táctil de comanderas</span>
            </div>
            <button
              onClick={() => handleToggleFeature('kds')}
              className={`p-1 text-2xl transition cursor-pointer ${
                license.featureFlags?.kds !== false ? 'text-emerald-500' : 'text-slate-600'
              }`}
            >
              {license.featureFlags?.kds !== false ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* CRM Clientes */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">CRM de Clientes</span>
              <span className="text-[11px] text-slate-500">Fidelización e historial</span>
            </div>
            <button
              onClick={() => handleToggleFeature('crm')}
              className={`p-1 text-2xl transition cursor-pointer ${
                license.featureFlags?.crm !== false ? 'text-emerald-500' : 'text-slate-600'
              }`}
            >
              {license.featureFlags?.crm !== false ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Módulo Reseñas */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Módulo de Reseñas</span>
              <span className="text-[11px] text-slate-500">Feedback y 5 estrellas en mesa</span>
            </div>
            <button
              onClick={() => handleToggleFeature('reviews')}
              className={`p-1 text-2xl transition cursor-pointer ${
                license.featureFlags?.reviews !== false ? 'text-emerald-500' : 'text-slate-600'
              }`}
            >
              {license.featureFlags?.reviews !== false ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Inventario */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Inventario de Cocina</span>
              <span className="text-[11px] text-slate-500">Semáforo de stock de insumos</span>
            </div>
            <button
              onClick={() => handleToggleFeature('inventory')}
              className={`p-1 text-2xl transition cursor-pointer ${
                license.featureFlags?.inventory !== false ? 'text-emerald-500' : 'text-slate-600'
              }`}
            >
              {license.featureFlags?.inventory !== false ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. FECHA DE EXPIRACIÓN Y MENSAJE DE SUSPENSIÓN */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          Vigencia de la Licencia & Mensajes Personalizados
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              Fecha Límite de Licencia
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              Mensaje en caso de Suspensión (Kill Switch)
            </label>
            <input
              type="text"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Ej. Mantenimiento de servidores..."
              className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Guardar Configuración de Licencia
          </button>
        </div>
      </form>

      {/* MODAL DE CONFIRMACIÓN KILL SWITCH */}
      {confirmKillSwitchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-2">
              ¿Estás seguro de suspender el restaurante?
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Esta acción interrumpirá inmediatamente todas las operaciones en salón, cocina y pedidos móviles.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmKillSwitchOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleToggleKillSwitch(true)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-900/50 transition cursor-pointer"
              >
                Sí, Suspender Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
