import React, { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DailyAnalytics, Customer, Review } from '../../types';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Users,
  MessageSquare,
  Star,
  Flame,
  Clock,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  // Fecha de hoy en formato YYYY-MM-DD
  const todayStr = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const [dailyData, setDailyData] = useState<DailyAnalytics | null>(null);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Lectura Eficiente: Consulta únicamente el documento del día actual (1 lectura Firestore)
  useEffect(() => {
    const dailyDocRef = doc(db, 'daily_analytics', todayStr);
    const unsubscribe = onSnapshot(dailyDocRef, (snap) => {
      if (snap.exists()) {
        setDailyData({ id: snap.id, ...snap.data() } as DailyAnalytics);
      } else {
        // Datos por defecto si el día aún no tiene pedidos procesados
        setDailyData({
          id: todayStr,
          date: todayStr,
          totalRevenue: 0,
          totalOrders: 0,
          averageTicket: 0,
          topProducts: [],
          hourlySales: []
        });
      }
      setLoading(false);
    }, (err) => {
      console.warn('Analytics snapshot fallback:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [todayStr]);

  // 2. Consulta de Clientes VIP / Frecuentes ordenados por visitas y gasto total
  useEffect(() => {
    const custQuery = query(
      collection(db, 'customers'),
      orderBy('totalSpent', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(custQuery, (snap) => {
      const custs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Customer[];
      setTopCustomers(custs);
    }, (err) => {
      console.warn('Customers snapshot fallback:', err);
    });

    return () => unsubscribe();
  }, []);

  // 3. Muro en tiempo real con las últimas calificaciones recibidas (/reviews)
  useEffect(() => {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(8)
    );

    const unsubscribe = onSnapshot(reviewsQuery, (snap) => {
      const revs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Review[];
      setRecentReviews(revs);
    }, (err) => {
      console.warn('Reviews snapshot fallback:', err);
    });

    return () => unsubscribe();
  }, []);

  // Top 5 productos más vendidos del día
  const top5Products = (dailyData?.topProducts || []).slice(0, 5);
  const maxSoldQuantity = Math.max(...top5Products.map((p) => p.quantitySold), 1);

  return (
    <div className="space-y-6">
      {/* Encabezado y Resumen de Consumo */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Business Intelligence & Ventas Diarias
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                1 Lectura Firestore
              </span>
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Métricas consolidadas para la fecha: <strong className="text-slate-700">{todayStr}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ingresos Brutos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Ventas del Día
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              ${dailyData?.totalRevenue?.toFixed(2) || '0.00'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Ingresos brutos acumulados
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Órdenes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Órdenes Pagadas
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {dailyData?.totalOrders || 0}
            </span>
            <span className="text-[11px] font-semibold text-orange-600 flex items-center gap-1 mt-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              Comandas despachadas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Ticket Promedio
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              ${dailyData?.averageTicket?.toFixed(2) || '0.00'}
            </span>
            <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mt-1">
              <Award className="w-3.5 h-3.5" />
              Gasto medio por mesa
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Gráfico Top 5 Productos y Tabla Clientes VIP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras Top 5 Productos más Vendidos */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Top 5 Productos Más Vendidos Hoy
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Por unidades</span>
            </div>

            {top5Products.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Aún no hay ventas registradas en el día de hoy.
              </div>
            ) : (
              <div className="space-y-4">
                {top5Products.map((prod, idx) => {
                  const percentage = Math.round((prod.quantitySold / maxSoldQuantity) * 100);

                  return (
                    <div key={prod.productId || idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-4 text-orange-600 font-black">#{idx + 1}</span>
                          {prod.productName}
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {prod.quantitySold} uds • ${(prod.revenue || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Barra de Progreso / Gráfico */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Actualizado automáticamente con Cloud Functions</span>
            <span className="text-orange-600 font-bold">Tiempo real</span>
          </div>
        </div>

        {/* Tabla de Clientes VIP / Frecuentes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Ranking Clientes VIP & Frecuentes
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">CRM Clientes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">WhatsApp</th>
                    <th className="py-2.5 px-3 text-center">Visitas</th>
                    <th className="py-2.5 px-3 text-right">Gasto Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No hay clientes registrados en el CRM aún.
                      </td>
                    </tr>
                  ) : (
                    topCustomers.map((cust, idx) => (
                      <tr key={cust.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                          {idx === 0 && <span className="text-amber-500 text-xs">👑</span>}
                          {cust.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{cust.phone}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                            {cust.totalOrders}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-orange-600">
                          ${cust.totalSpent?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Muro en Tiempo Real de Últimas Calificaciones (/reviews) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Muro en Vivo de Feedback y Calificaciones
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            En directo desde mesas
          </span>
        </div>

        {recentReviews.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se han recibido calificaciones de comensales el día de hoy.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:shadow-xs transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Mesa #{rev.tableNumber}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.bestDish && (
                    <div className="mb-2 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-block">
                      ❤️ Plato top: {rev.bestDish}
                    </div>
                  )}

                  {rev.comment && (
                    <p className="text-xs text-slate-600 italic line-clamp-3 mb-2 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  )}
                </div>

                {/* Chips de tags */}
                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-200/60 mt-auto">
                    {rev.tags.slice(0, 2).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-medium bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
