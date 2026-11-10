import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import {
  SystemLicense,
  SystemBranding,
  ImpersonationState,
  ImpersonationRole
} from '../types';
import { LicenseManager } from '../components/master/LicenseManager';
import { MaintenanceConsole } from '../components/master/MaintenanceConsole';
import { AuditAndHealthMonitor } from '../components/master/AuditAndHealthMonitor';
import { BrandingManager } from '../components/master/BrandingManager';
import {
  ShieldAlert,
  Power,
  Wrench,
  Activity,
  Palette,
  Eye,
  LogOut,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

type MasterTab = 'license' | 'maintenance' | 'audit' | 'branding';

interface MasterAdminDashboardProps {
  onStartImpersonation: (role: ImpersonationRole, tableNumber?: number) => void;
}

const DEFAULT_LICENSE: SystemLicense = {
  isSuspended: false,
  suspensionReason: 'Mantenimiento Programado / Servicio temporalmente no disponible',
  featureFlags: {
    qrMenu: true,
    kds: true,
    crm: true,
    reviews: true,
    inventory: true
  },
  licenseExpiryDate: '2027-12-31'
};

const DEFAULT_BRANDING: SystemBranding = {
  restaurantName: 'ORIGEN & BISTRO',
  logoUrl: '',
  primaryColor: '#033225',
  accentColor: '#DCD7CD',
  contactPhone: '+57 300 123 4567',
  contactAddress: 'Reserva Natural & Jardín Botánico'
};

export const MasterAdminDashboard: React.FC<MasterAdminDashboardProps> = ({
  onStartImpersonation
}) => {
  const [activeTab, setActiveTab] = useState<MasterTab>('license');
  const [license, setLicense] = useState<SystemLicense>(DEFAULT_LICENSE);
  const [branding, setBranding] = useState<SystemBranding>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  // 1. Escuchar en tiempo real /system_config/license
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system_config', 'license'), (snap) => {
      if (snap.exists()) {
        setLicense(snap.data() as SystemLicense);
      } else {
        // Inicializar documento por defecto
        setDoc(doc(db, 'system_config', 'license'), {
          ...DEFAULT_LICENSE,
          updatedAt: new Date()
        }).catch(() => {});
      }
      setLoading(false);
    }, (err) => {
      console.warn('Error en listener de licencia:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 2. Escuchar en tiempo real /system_config/branding
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system_config', 'branding'), (snap) => {
      if (snap.exists()) {
        setBranding(snap.data() as SystemBranding);
      } else {
        setDoc(doc(db, 'system_config', 'branding'), {
          ...DEFAULT_BRANDING,
          updatedAt: new Date()
        }).catch(() => {});
      }
    });

    return () => unsub();
  }, []);

  // Actualizar licencia en Firestore
  const handleUpdateLicense = async (updated: Partial<SystemLicense>) => {
    try {
      await setDoc(doc(db, 'system_config', 'license'), updated, { merge: true });
    } catch (err) {
      console.error('Error guardando licencia:', err);
    }
  };

  // Actualizar branding en Firestore
  const handleUpdateBranding = async (updated: Partial<SystemBranding>) => {
    try {
      await setDoc(doc(db, 'system_config', 'branding'), updated, { merge: true });
    } catch (err) {
      console.error('Error guardando branding:', err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* HEADER PRINCIPAL MASTER ADMIN */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30 font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white tracking-wide uppercase">
                  Master Core Admin Console
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  ROOT PRIVILEGES
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Supervisión de arquitectura, licencias y auditoría de operaciones
              </p>
            </div>
          </div>

          {/* SELECTOR MODO DIOS (IMPERSONATION) & LOGOUT */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-orange-400" />
                Simular:
              </span>
              <button
                onClick={() => onStartImpersonation('WAITER', 1)}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
              >
                Mesero (Mesa 1)
              </button>
              <button
                onClick={() => onStartImpersonation('KDS')}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
              >
                Cocina KDS
              </button>
              <button
                onClick={() => onStartImpersonation('ADMIN')}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
              >
                Admin Local
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Cerrar Sesión Master"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PESTAÑAS DE NAVEGACIÓN MASTER */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('license')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'license'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            Licencia & Kill Switch
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Mantenimiento & Recuperación
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Salud & Auditoría de Mermas
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'branding'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Branding en Caliente
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL MASTER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'license' && (
          <LicenseManager
            license={license}
            onUpdateLicense={handleUpdateLicense}
          />
        )}

        {activeTab === 'maintenance' && <MaintenanceConsole />}

        {activeTab === 'audit' && <AuditAndHealthMonitor />}

        {activeTab === 'branding' && (
          <BrandingManager
            branding={branding}
            onUpdateBranding={handleUpdateBranding}
          />
        )}
      </main>
    </div>
  );
};
