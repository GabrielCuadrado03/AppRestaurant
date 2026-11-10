import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { StaffMember } from '../../types';
import {
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Users,
  KeyRound,
  Lock,
  RefreshCw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const DEFAULT_STAFF: StaffMember[] = [
  { id: 'staff_1', name: 'Carlos Mendoza', role: 'mesero', pin: '1234', isActive: true },
  { id: 'staff_2', name: 'Laura Gómez', role: 'mesero', pin: '5678', isActive: true },
  { id: 'staff_3', name: 'Javier Ramírez (Chef Principal)', role: 'cocina', pin: '4321', isActive: true },
  { id: 'staff_4', name: 'Administrador Local', role: 'admin', pin: '9999', isActive: true },
];

export const MaintenanceConsole: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Estados de modales de confirmación
  const [cleanModalOpen, setCleanModalOpen] = useState(false);
  const [cleanConfirmationText, setCleanConfirmationText] = useState('');

  const [closeTablesModalOpen, setCloseTablesModalOpen] = useState(false);

  // Modal para editar PIN de staff
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [newPin, setNewPin] = useState('');

  // 1. Escuchar lista de PINs de staff desde Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system_config', 'staff_pins'), (snap) => {
      if (snap.exists() && snap.data()?.members) {
        setStaffList(snap.data().members as StaffMember[]);
      } else {
        // Inicializar documento en Firestore si no existe
        setDoc(doc(db, 'system_config', 'staff_pins'), {
          members: DEFAULT_STAFF,
          updatedAt: new Date()
        }).catch(() => {});
      }
    });

    return () => unsub();
  }, []);

  // 2. Acción: "Limpieza de Pruebas" (borra /orders y resetea /daily_analytics, preserva /products y /customers)
  const handleExecuteCleanTestOrders = async () => {
    if (cleanConfirmationText !== 'LIMPIAR') {
      alert('Debes escribir la palabra LIMPIAR para confirmar esta acción irreversible.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      // A. Borrar todas las órdenes en /orders
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const batch1 = writeBatch(db);
      ordersSnap.forEach((d) => {
        batch1.delete(d.ref);
      });
      await batch1.commit();

      // B. Resetear /daily_analytics
      const analyticsSnap = await getDocs(collection(db, 'daily_analytics'));
      const batch2 = writeBatch(db);
      analyticsSnap.forEach((d) => {
        batch2.delete(d.ref);
      });
      await batch2.commit();

      setStatusMessage(`✅ Limpieza completada: ${ordersSnap.size} órdenes eliminadas y métricas diarias reseteadas.`);
      setCleanModalOpen(false);
      setCleanConfirmationText('');
    } catch (err: any) {
      console.error('Error durante limpieza:', err);
      setStatusMessage(`❌ Error en la limpieza: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Acción: "Cierre Forzado de Mesas" (marca todas las órdenes abiertas como PAID)
  const handleForceCloseTables = async () => {
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const batch = writeBatch(db);
      let count = 0;

      ordersSnap.forEach((d) => {
        const orderData = d.data();
        if (orderData.status !== 'PAID' && orderData.status !== 'VOIDED') {
          batch.update(d.ref, {
            status: 'PAID',
            updatedAt: new Date(),
            closedByMasterAdmin: true
          });
          count++;
        }
      });

      await batch.commit();
      setStatusMessage(`✅ Cierre forzado exitoso: ${count} mesas/órdenes abiertas fueron cerradas y liberadas.`);
      setCloseTablesModalOpen(false);
    } catch (err: any) {
      console.error('Error en cierre forzado:', err);
      setStatusMessage(`❌ Error en cierre forzado: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Modificar PIN de un miembro del staff en un clic
  const handleSavePin = async () => {
    if (!editingStaff || newPin.length !== 4 || isNaN(Number(newPin))) {
      alert('El PIN debe ser exactamente de 4 dígitos numéricos.');
      return;
    }

    const updatedList = staffList.map((m) =>
      m.id === editingStaff.id ? { ...m, pin: newPin } : m
    );

    try {
      await setDoc(doc(db, 'system_config', 'staff_pins'), {
        members: updatedList,
        updatedAt: new Date()
      }, { merge: true });

      setStaffList(updatedList);
      setStatusMessage(`🔑 PIN actualizado correctamente para ${editingStaff.name}.`);
      setEditingStaff(null);
      setNewPin('');
    } catch (err: any) {
      console.error('Error guardando PIN:', err);
      alert('Error al actualizar PIN en Firestore.');
    }
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-bold text-white flex items-center justify-between animate-in fade-in">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ACCIONES CRÍTICAS DE MANTENIMIENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Limpieza de Pruebas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white">
                Limpieza de Órdenes de Prueba
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Elimina de forma irreversible todas las comandas en <code className="text-orange-400">/orders</code> y reinicia las estadísticas de <code className="text-orange-400">/daily_analytics</code>.
              <strong> Preserva intacto el catálogo de productos y clientes.</strong>
            </p>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              setCleanConfirmationText('');
              setCleanModalOpen(true);
            }}
            className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Ejecutar Limpieza de Pruebas
          </button>
        </div>

        {/* Cierre Forzado de Mesas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white">
                Cierre Forzado de Mesas Abiertas
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Pasa automáticamente al estado <span className="text-emerald-400 font-bold">PAID</span> todas las órdenes que hayan quedado colgadas u olvidadas al final de la jornada, restableciendo todas las mesas a estado <strong>Libre</strong>.
            </p>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setCloseTablesModalOpen(true)}
            className="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Cerrar Todas las Mesas Abiertas
          </button>
        </div>
      </div>

      {/* GESTOR DE PINS DE PERSONAL */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Gestor Central de PINs de Personal
              </h3>
              <p className="text-xs text-slate-400">
                Cambia o resetea el código de 4 dígitos de cualquier mesero o cocinero en un clic.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-950 text-slate-300 font-bold border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Empleado / Cargo</th>
                <th className="py-3 px-4">Rol en Sistema</th>
                <th className="py-3 px-4 text-center">PIN Actual</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffList.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center text-xs font-black">
                      {member.name.charAt(0)}
                    </span>
                    {member.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-orange-400 font-extrabold text-sm px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">
                      {member.pin}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setEditingStaff(member);
                        setNewPin(member.pin);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Modificar PIN
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDITAR PIN */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xs w-full p-6 text-center animate-in zoom-in-95">
            <h3 className="text-sm font-extrabold text-white mb-1">
              Cambiar PIN de Acceso
            </h3>
            <p className="text-xs text-slate-400 mb-4">{editingStaff.name}</p>

            <div className="mb-4">
              <input
                type="text"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                className="w-32 mx-auto text-2xl font-mono text-center tracking-widest px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-orange-400 font-black focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePin}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Guardar PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN LIMPIEZA DE PRUEBAS */}
      {cleanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-2">
              Confirmación de Limpieza Total
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Esta acción eliminará todas las órdenes y reiniciará el historial diario. Para proceder, escribe la palabra <strong className="text-rose-400">LIMPIAR</strong>:
            </p>

            <input
              type="text"
              placeholder="Escribe LIMPIAR"
              value={cleanConfirmationText}
              onChange={(e) => setCleanConfirmationText(e.target.value)}
              className="w-full text-center text-xs font-bold px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white mb-4 uppercase tracking-wider focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCleanModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteCleanTestOrders}
                disabled={cleanConfirmationText !== 'LIMPIAR'}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
              >
                Borrar Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN CIERRE FORZADO DE MESAS */}
      {closeTablesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-2">
              ¿Cerrar todas las mesas abiertas?
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Todas las comandas pendientes pasarán a estado pagado y el plano de mesas quedará completamente liberado para el próximo turno.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCloseTablesModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleForceCloseTables}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-md transition"
              >
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
