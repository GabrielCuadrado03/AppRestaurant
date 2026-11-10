import React, { useState } from 'react';
import { RestaurantTable, TableStatus, WaiterProfile } from '../../types';
import {
  Users,
  UtensilsCrossed,
  Receipt,
  LogOut,
  Sparkles,
  Coffee,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface TableGridProps {
  tables: RestaurantTable[];
  waiter: WaiterProfile;
  onSelectTable: (table: RestaurantTable) => void;
  onLogout: () => void;
  onViewKds: () => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables,
  waiter,
  onSelectTable,
  onLogout,
  onViewKds
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  const zones = ['ALL', ...Array.from(new Set(tables.map((t) => t.zone)))];

  const filteredTables = selectedZone === 'ALL'
    ? tables
    : tables.filter((t) => t.zone === selectedZone);

  // Contadores de estado
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;
  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length;
  const billCount = tables.filter((t) => t.status === 'BILL_REQUESTED').length;

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'Libre',
          cardBg: 'bg-white hover:border-emerald-500 border-slate-200',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          textColor: 'text-slate-800'
        };
      case 'OCCUPIED':
        return {
          label: 'Ocupada',
          cardBg: 'bg-orange-50/50 hover:border-orange-500 border-orange-200',
          badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
          dot: 'bg-orange-500',
          textColor: 'text-orange-950'
        };
      case 'BILL_REQUESTED':
        return {
          label: 'Cuenta Solicitada',
          cardBg: 'bg-rose-50/60 hover:border-rose-500 border-rose-300 animate-pulse',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          textColor: 'text-rose-950'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header Mesero */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-600/20">
              {waiter.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">{waiter.name}</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-orange-100 text-orange-800 uppercase">
                  {waiter.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Salón & Atención de Comandas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewKds}
              className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Ver</span> KDS Cocina
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="Cerrar Turno"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Resumen */}
        <div className="max-w-6xl mx-auto mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {/* Pills de Zonas */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                  selectedZone === zone
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {zone === 'ALL' ? 'Todas las Zonas' : zone}
              </button>
            ))}
          </div>

          {/* Mini KPIs */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {availableCount} Libres
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              {occupiedCount} Ocupadas
            </span>
            {billCount > 0 && (
              <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {billCount} Cuenta!
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Grid de Mesas */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const statusConfig = getStatusBadge(table.status);

            return (
              <div
                key={table.number}
                onClick={() => onSelectTable(table)}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm flex flex-col justify-between ${statusConfig.cardBg}`}
                style={{ minHeight: '150px' }}
              >
                {/* Cabecera de la mesa */}
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {table.zone}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badgeBg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Número Grande */}
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-slate-900 block leading-tight">
                    Mesa {table.number}
                  </span>
                  {table.activeOrder && (
                    <span className="text-xs font-bold text-orange-600 block mt-0.5">
                      ${table.activeOrder.total?.toFixed(2) || '0.00'} • {table.activeOrder.items?.length || 0} ítems
                    </span>
                  )}
                </div>

                {/* Pie de tarjeta */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  {table.activeOrder ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3 h-3 text-orange-500" />
                      Ronda {table.activeOrder.currentRound || 1}
                    </span>
                  ) : (
                    <span className="text-slate-400">Tocar para abrir</span>
                  )}
                  <span className="text-orange-600 font-bold text-xs">➔</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
