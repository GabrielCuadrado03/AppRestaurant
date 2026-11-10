import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from './lib/firebase';
import {
  Product,
  Category,
  SystemLicense,
  SystemBranding,
  ImpersonationState,
  ImpersonationRole
} from './types';
import { AdminDashboard } from './pages/AdminDashboard';
import { WaiterApp } from './components/waiter/WaiterApp';
import { KitchenKds } from './components/kds/KitchenKds';
import { CustomerMenu } from './components/customer/CustomerMenu';
import { MasterAdminDashboard } from './pages/MasterAdminDashboard';
import { MasterRouteGuard } from './components/master/MasterRouteGuard';
import { ImpersonationBar } from './components/master/ImpersonationBar';
import { SuspendedNotice } from './components/system/SuspendedNotice';
import { NotFound } from './pages/NotFound';
import {
  Smartphone,
  Tv,
  Settings,
  Sparkles,
  QrCode
} from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './utils/mockData';

const MASTER_ROUTE = (import.meta.env.VITE_MASTER_ROUTE || '/sys-core-x9a7').replace(/\/$/, '');

export const App: React.FC = () => {
  // Detección de ruta secreta
  const isMasterPath = typeof window !== 'undefined' && (
    window.location.pathname === MASTER_ROUTE ||
    window.location.pathname === `${MASTER_ROUTE}/` ||
    window.location.hash === `#${MASTER_ROUTE}`
  );

  // Vista activa normal
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('table')) {
        return 'customer';
      }
    }
    return 'waiter';
  });

  // Estado del Modo Dios / Simulación
  const [impersonation, setImpersonation] = useState<ImpersonationState>({
    isActive: false,
    role: 'NONE',
    readOnly: false
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [license, setLicense] = useState<SystemLicense | null>(null);
  const [branding, setBranding] = useState<SystemBranding | null>(null);

  // 1. Escuchar licencia del sistema (Kill Switch & Feature Flags)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system_config', 'license'), (snap) => {
      if (snap.exists()) {
        setLicense(snap.data() as SystemLicense);
      }
    }, (err) => console.warn('License listener fallback:', err));
    return () => unsub();
  }, []);

  // 2. Escuchar branding dinámico y aplicar colores en caliente en el DOM
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system_config', 'branding'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SystemBranding;
        setBranding(data);
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--brand-primary', data.primaryColor);
        }
        if (data.accentColor) {
          document.documentElement.style.setProperty('--brand-accent', data.accentColor);
        }
      }
    }, (err) => console.warn('Branding listener fallback:', err));
    return () => unsub();
  }, []);

  // 3. Suscripción compartida para Menú y Categorías con fallback
  useEffect(() => {
    const unsubCat = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[];
      if (data.length > 0) setCategories(data);
    }, (err) => console.warn('Categories fallback a datos iniciales:', err));

    const unsubProd = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
      if (data.length > 0) setProducts(data);
    }, (err) => console.warn('Products fallback a datos iniciales:', err));

    return () => {
      unsubCat();
      unsubProd();
    };
  }, []);

  // ========================================================
  // RUTA 1: MÓDULO SECRETO MASTER ADMIN (Con Guard Criptográfico)
  // ========================================================
  if (isMasterPath) {
    // Si está en Modo Dios / Simulación desde la consola Master
    if (impersonation.isActive) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
          <ImpersonationBar
            state={impersonation}
            onChangeRole={(role, tableNumber) =>
              setImpersonation((prev) => ({ ...prev, role, tableNumber }))
            }
            onToggleReadOnly={(readOnly) =>
              setImpersonation((prev) => ({ ...prev, readOnly }))
            }
            onExitImpersonation={() =>
              setImpersonation({ isActive: false, role: 'NONE', readOnly: false })
            }
          />
          <div className="flex-1">
            {impersonation.role === 'WAITER' && (
              <WaiterApp
                products={products}
                categories={categories}
                onViewKds={() => setImpersonation((prev) => ({ ...prev, role: 'KDS' }))}
              />
            )}
            {impersonation.role === 'KDS' && (
              <KitchenKds onBackToApp={() => setImpersonation((prev) => ({ ...prev, role: 'WAITER' }))} />
            )}
            {impersonation.role === 'ADMIN' && <AdminDashboard />}
          </div>
        </div>
      );
    }

    return (
      <MasterRouteGuard>
        <MasterAdminDashboard
          onStartImpersonation={(role, tableNumber) => {
            setImpersonation({
              isActive: true,
              role,
              tableNumber,
              readOnly: false
            });
          }}
        />
      </MasterRouteGuard>
    );
  }

  // ========================================================
  // RUTA 2: SISTEMA SUSPENDIDO (KILL SWITCH ACTIVO)
  // ========================================================
  if (license?.isSuspended) {
    return (
      <SuspendedNotice
        reason={license.suspensionReason}
        branding={branding}
      />
    );
  }

  // ========================================================
  // RUTA 3: APLICACIÓN NORMAL (SALÓN, COCINA, CLIENTES, ADMIN)
  // ========================================================
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Selector de Vistas / Switcher (oculto en modo KDS y en impresión) */}
      {currentView !== 'kds' && (
        <aside className="no-print bg-slate-950 border-b border-slate-800 text-slate-300 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="font-extrabold text-white">
              {branding?.restaurantName || 'RestoSuite'}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {license?.featureFlags?.qrMenu !== false && (
              <button
                onClick={() => setCurrentView('customer')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  currentView === 'customer'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Menú QR Cliente
              </button>
            )}

            <button
              onClick={() => setCurrentView('waiter')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                currentView === 'waiter'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              App Mesero
            </button>

            {license?.featureFlags?.kds !== false && (
              <button
                onClick={() => setCurrentView('kds')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  currentView === 'kds'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                KDS Cocina
              </button>
            )}

            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                currentView === 'admin'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Administración
            </button>
          </div>
        </aside>
      )}

      {/* Renderizado dinámico de la vista activa */}
      <div className="flex-1">
        {currentView === 'customer' && <CustomerMenu />}

        {currentView === 'waiter' && (
          <WaiterApp
            products={products}
            categories={categories}
            onViewKds={() => setCurrentView('kds')}
          />
        )}

        {currentView === 'kds' && (
          <KitchenKds onBackToApp={() => setCurrentView('waiter')} />
        )}

        {currentView === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
};

export default App;
