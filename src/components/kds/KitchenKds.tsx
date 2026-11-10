import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderItem } from '../../types';
import { playKdsChime } from '../../utils/audioAlert';
import {
  ChefHat,
  Clock,
  CheckCircle,
  Play,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  AlertCircle,
  Flame,
  ArrowLeft
} from 'lucide-react';

interface KitchenKdsProps {
  onBackToApp?: () => void;
}

export const KitchenKds: React.FC<KitchenKdsProps> = ({ onBackToApp }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Referencia para detectar órdenes nuevas y emitir sonido suave
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  // Reloj en tiempo real para cálculo de minutos transcurridos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Actualiza cada 10s
    return () => clearInterval(timer);
  }, []);

  // Listener reactivo Firestore a pedidos PENDING o PREPARING ordenados FIFO
  useEffect(() => {
    // Consulta reactiva a orders filtrados por estados activos de cocina
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['PENDING', 'PREPARING'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = [];
      const currentIds = new Set<string>();

      snapshot.forEach((docSnapshot) => {
        const ord = { id: docSnapshot.id, ...docSnapshot.data() } as Order;
        fetchedOrders.push(ord);
        currentIds.add(ord.id);
      });

      // Ordenar manualmente por FIFO (tiempo más antiguo primero)
      fetchedOrders.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return timeA - timeB;
      });

      // Detección de orden nueva para disparar sonido suave
      if (!initialLoadRef.current && soundEnabled) {
        let hasNew = false;
        currentIds.forEach((id) => {
          if (!previousOrderIdsRef.current.has(id)) {
            hasNew = true;
          }
        });
        if (hasNew) {
          playKdsChime();
        }
      }

      previousOrderIdsRef.current = currentIds;
      initialLoadRef.current = false;
      setOrders(fetchedOrders);
    }, (err) => {
      console.warn('KDS orders listener fallback:', err);
    });

    return () => unsubscribe();
  }, [soundEnabled]);

  // Manejo de Pantalla Completa táctil para el monitor de cocina
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Acción táctil: Iniciar preparación de toda la orden o ítem
  const handleStartPreparing = async (order: Order) => {
    try {
      const updatedItems = order.items.map((i) =>
        i.status === 'PENDING' ? { ...i, status: 'PREPARING' as const } : i
      );

      await updateDoc(doc(db, 'orders', order.id), {
        status: 'PREPARING',
        items: updatedItems,
        updatedAt: new Date()
      });
    } catch (e) {
      console.error('Error starting preparation:', e);
      // Actualizar estado local si offline
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: 'PREPARING' } : o
        )
      );
    }
  };

  // Acción táctil: Listo para servir
  const handleReadyToServe = async (order: Order) => {
    try {
      const updatedItems = order.items.map((i) =>
        i.status !== 'VOIDED' ? { ...i, status: 'READY' as const } : i
      );

      await updateDoc(doc(db, 'orders', order.id), {
        status: 'READY',
        items: updatedItems,
        updatedAt: new Date()
      });
    } catch (e) {
      console.error('Error setting order ready:', e);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    }
  };

  // Acción táctil individual para marcar un ítem como listo
  const handleToggleItemStatus = async (order: Order, itemId: string) => {
    const updatedItems = order.items.map((i) => {
      if (i.id === itemId) {
        const nextStatus = i.status === 'PENDING' ? 'PREPARING' : i.status === 'PREPARING' ? 'READY' : i.status;
        return { ...i, status: nextStatus as any };
      }
      return i;
    });

    // Si todos los ítems válidos están listos, la orden pasa a READY
    const allReady = updatedItems
      .filter((i) => i.status !== 'VOIDED')
      .every((i) => i.status === 'READY');

    try {
      await updateDoc(doc(db, 'orders', order.id), {
        items: updatedItems,
        status: allReady ? 'READY' : 'PREPARING',
        updatedAt: new Date()
      });
    } catch (e) {
      console.error('Error updating item in KDS:', e);
    }
  };

  // Calcular minutos transcurridos y colores de alerta visual
  const getElapsedInfo = (createdAt: any) => {
    const createdTime = createdAt?.toDate ? createdAt.toDate().getTime() : new Date(createdAt).getTime();
    const minutes = Math.floor((currentTime.getTime() - createdTime) / 60000);

    if (minutes >= 20) {
      return {
        minutes,
        badgeBg: 'bg-rose-500 text-white animate-pulse',
        cardBorder: 'border-rose-500 shadow-rose-500/20 shadow-lg',
        headerBg: 'bg-rose-950/80 border-b border-rose-800'
      };
    }
    if (minutes >= 10) {
      return {
        minutes,
        badgeBg: 'bg-amber-500 text-slate-950 font-black',
        cardBorder: 'border-amber-500 shadow-amber-500/10 shadow-md',
        headerBg: 'bg-amber-950/70 border-b border-amber-800'
      };
    }
    return {
      minutes,
      badgeBg: 'bg-emerald-500 text-slate-950 font-black',
      cardBorder: 'border-slate-700',
      headerBg: 'bg-slate-800 border-b border-slate-700'
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* Barra de Control KDS */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-wide uppercase">KDS Cocina Pantalla Completa</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span className="text-[11px] text-slate-400">
                {orders.length} comanda{orders.length !== 1 ? 's' : ''} en cola FIFO
              </span>
            </div>
          </div>
        </div>

        {/* Acciones de la pantalla */}
        <div className="flex items-center gap-2">
          {/* Botón de prueba de sonido / Toggle */}
          <button
            onClick={() => {
              playKdsChime();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
            }`}
            title={soundEnabled ? 'Sonido de nuevas órdenes activo' : 'Sonido silenciado'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Botón Pantalla Completa */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
            title="Pantalla Completa KDS"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Contenedor de Comandas / Tarjetas FIFO */}
      <main className="flex-1 p-4 overflow-x-auto">
        {orders.length === 0 ? (
          <div className="h-full min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
            <ChefHat className="w-16 h-16 stroke-[1] mb-3 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-400">Todo al día en cocina</h2>
            <p className="text-xs text-slate-600 mt-1">No hay pedidos pendientes en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 items-start">
            {orders.map((order, index) => {
              const elapsed = getElapsedInfo(order.createdAt);
              const isPreparing = order.status === 'PREPARING';

              return (
                <div
                  key={order.id}
                  className={`border-2 rounded-2xl overflow-hidden bg-slate-900 flex flex-col transition-all duration-300 ${elapsed.cardBorder}`}
                >
                  {/* Header de la Tarjeta */}
                  <div className={`p-3.5 ${elapsed.headerBg} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-white">
                        Mesa {order.tableNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-200">
                        Ronda {order.currentRound || 1}
                      </span>
                    </div>

                    {/* Tiempo transcurrido con alerta visual */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black shadow-xs ${elapsed.badgeBg}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {elapsed.minutes}m
                      </span>
                    </div>
                  </div>

                  {/* Metadatos adicionales */}
                  <div className="px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Orden #{order.id.slice(-4).toUpperCase()}</span>
                    <span>{order.waiterName || 'Mesero'}</span>
                  </div>

                  {/* Lista de Ítems / Platos */}
                  <div className="p-3.5 flex-1 space-y-2.5 divide-y divide-slate-800/60">
                    {order.items.map((item) => {
                      const isItemVoided = item.status === 'VOIDED';

                      return (
                        <div
                          key={item.id}
                          onClick={() => !isItemVoided && handleToggleItemStatus(order, item.id)}
                          className={`pt-2 first:pt-0 cursor-pointer group ${
                            isItemVoided ? 'line-through opacity-40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                                  item.status === 'READY'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : item.status === 'PREPARING'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-orange-400'
                                }`}
                              >
                                {item.quantity}x
                              </span>
                              <span className="text-sm font-bold text-slate-100 group-hover:text-orange-400 transition leading-tight">
                                {item.productName}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                                item.status === 'READY'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : item.status === 'PREPARING'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          {/* Notas especiales destacadas */}
                          {item.notes && !isItemVoided && (
                            <div className="mt-1 ml-8 px-2 py-0.5 bg-amber-500/10 border-l-2 border-amber-500 text-amber-300 text-xs font-semibold">
                              ⚠️ {item.notes}
                            </div>
                          )}

                          {isItemVoided && item.voidReason && (
                            <div className="mt-1 ml-8 text-[10px] text-rose-400 font-bold">
                              Anulado: {item.voidReason}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Botones de Acción Táctiles para el Cocinero */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStartPreparing(order)}
                      className={`py-3 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        isPreparing
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {isPreparing ? 'En Cocción' : 'Iniciar'}
                    </button>

                    <button
                      onClick={() => handleReadyToServe(order)}
                      className="py-3 px-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Listo para Servir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
