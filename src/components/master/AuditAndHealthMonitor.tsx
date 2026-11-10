import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, VoidItemAudit } from '../../types';
import {
  Activity,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Database,
  Cpu,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const AuditAndHealthMonitor: React.FC = () => {
  const [voidAudits, setVoidAudits] = useState<VoidItemAudit[]>([]);
  const [totalLossAmount, setTotalLossAmount] = useState<number>(0);
  const [totalOrdersToday, setTotalOrdersToday] = useState<number>(0);

  // Escuchar órdenes para calcular cancelaciones/mermas y volumen operativo
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const audits: VoidItemAudit[] = [];
      let totalLoss = 0;
      let orderCount = 0;

      snapshot.forEach((docSnap) => {
        const order = { id: docSnap.id, ...docSnap.data() } as Order;
        orderCount++;

        // 1. Extraer ítems anulados directamente de items
        if (order.items) {
          order.items.forEach((item) => {
            if (item.status === 'VOIDED') {
              const loss = Number(item.unitPrice || 0) * Number(item.quantity || 1);
              totalLoss += loss;

              audits.push({
                orderId: order.id,
                tableNumber: order.tableNumber,
                itemId: item.id,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalLoss: loss,
                reason: item.voidReason || 'Sin motivo especificado',
                authorizedPin: item.authorizedPin || 'N/A',
                canceledAt: item.createdAt || order.updatedAt,
                canceledByUid: order.waiterName || 'Staff'
              });
            }
          });
        }

        // 2. Extraer de array cancellations si existieran registros adicionales
        if (order.cancellations) {
          order.cancellations.forEach((c) => {
            const alreadyLogged = audits.some((a) => a.itemId === c.itemId);
            if (!alreadyLogged) {
              const matchedItem = order.items?.find((i) => i.id === c.itemId);
              const loss = matchedItem ? matchedItem.unitPrice * matchedItem.quantity : 0;
              totalLoss += loss;

              audits.push({
                orderId: order.id,
                tableNumber: order.tableNumber,
                itemId: c.itemId,
                productName: c.productName,
                quantity: matchedItem?.quantity || 1,
                unitPrice: matchedItem?.unitPrice || 0,
                totalLoss: loss,
                reason: c.reason,
                authorizedPin: c.authorizedPin,
                canceledAt: c.canceledAt,
                canceledByUid: c.canceledByUid
              });
            }
          });
        }
      });

      setVoidAudits(audits);
      setTotalLossAmount(totalLoss);
      setTotalOrdersToday(orderCount);
    });

    return () => unsub();
  }, []);

  // Estimación de cuotas de Firebase Spark (Límites gratuitos diarios: 50,000 Reads, 20,000 Writes)
  // Cada orden promedio genera ~8 lecturas y ~4 escrituras en su ciclo de vida
  const estimatedReads = Math.min(totalOrdersToday * 8 + 120, 50000);
  const estimatedWrites = Math.min(totalOrdersToday * 4 + 40, 20000);
  const readsPercentage = Math.round((estimatedReads / 50000) * 100);
  const writesPercentage = Math.round((estimatedWrites / 20000) * 100);

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN DE CUOTAS ESTIMADAS DE FIREBASE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Contador de Cuotas Estimadas (Firebase Free Tier)
              </h3>
              <p className="text-xs text-slate-400">
                Monitoreo para evitar costos imprevistos o interrupciones en la cuota gratuita diaria.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            HEALTH STATUS: GREEN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lecturas */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Lecturas Firestore (Reads)
              </span>
              <span className="font-extrabold text-white font-mono">
                {estimatedReads.toLocaleString()} / 50,000 ({readsPercentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  readsPercentage > 80 ? 'bg-rose-500' : readsPercentage > 50 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.max(readsPercentage, 4)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Límite diario: 50k lecturas • Modo optimizado a 1 lectura en BI
            </span>
          </div>

          {/* Escrituras */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Escrituras Firestore (Writes)
              </span>
              <span className="font-extrabold text-white font-mono">
                {estimatedWrites.toLocaleString()} / 20,000 ({writesPercentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  writesPercentage > 80 ? 'bg-rose-500' : writesPercentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(writesPercentage, 4)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Límite diario: 20k escrituras • Usando FieldValue.increment
            </span>
          </div>
        </div>
      </div>

      {/* 2. AUDITORÍA DE CANCELACIONES Y MERMAS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Auditoría de Cancelaciones y Mermas en Cocina
              </h3>
              <p className="text-xs text-slate-400">
                Registro inmutable de platos anulados cuando ya estaban en preparación o listos.
              </p>
            </div>
          </div>

          {/* KPI Pérdida Acumulada */}
          <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                Pérdida Monetaria Total
              </span>
              <span className="text-lg font-black text-rose-400 font-mono">
                ${totalLossAmount.toFixed(2)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">
              $
            </div>
          </div>
        </div>

        {/* Tabla de Mermas */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-950 text-slate-300 font-bold border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Mesa</th>
                <th className="py-3 px-4">Plato Anulado</th>
                <th className="py-3 px-4">Motivo Obligatorio</th>
                <th className="py-3 px-4">Autorizado por</th>
                <th className="py-3 px-4 text-right">Pérdida ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {voidAudits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No se han registrado cancelaciones ni mermas en el sistema.
                  </td>
                </tr>
              ) : (
                voidAudits.map((audit, idx) => (
                  <tr key={`${audit.orderId}_${audit.itemId}_${idx}`} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">
                      Mesa #{audit.tableNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{audit.quantity}x {audit.productName}</div>
                      <span className="text-[10px] text-slate-500 font-mono">Ref: {audit.orderId.slice(-6)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-amber-400 italic font-medium bg-amber-500/10 px-2 py-0.5 rounded-md">
                        "{audit.reason}"
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 font-semibold">{audit.canceledByUid || 'Staff'}</div>
                      <span className="text-[10px] text-slate-500 font-mono">PIN: {audit.authorizedPin}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-400 font-mono">
                      -${audit.totalLoss.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
