import React, { useState } from 'react';
import { RestaurantTable, TableStatus, WaiterProfile } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import {
  Users,
  UtensilsCrossed,
  Receipt,
  LogOut,
  Sparkles,
  Coffee,
  CheckCircle2,
  Clock,
  ArrowRight
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
          cardBg: 'bg-white hover:border-[#033225] border-[#DCD7CD]',
          badgeBg: 'bg-[#033225]/10 text-[#033225] border-[#033225]/20',
          dot: 'bg-[#033225]',
          textColor: 'text-[#020202]'
        };
      case 'OCCUPIED':
        return {
          label: 'Ocupada',
          cardBg: 'bg-[#DCD7CD]/20 hover:border-[#033225] border-[#033225]/30',
          badgeBg: 'bg-[#033225] text-[#DCD7CD] border-[#033225]',
          dot: 'bg-[#DCD7CD]',
          textColor: 'text-[#020202]'
        };
      case 'BILL_REQUESTED':
        return {
          label: 'Cuenta Solicitada',
          cardBg: 'bg-rose-50/70 hover:border-rose-600 border-rose-300 animate-pulse',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          textColor: 'text-rose-950'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col font-sans select-none">
      {/* Header Mesero */}
      <header className="bg-[#033225] text-white px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo
              size="sm"
              variant="beige-on-green"
              showText={false}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-serif font-bold text-[#F7F5F0]">{waiter.name}</h2>
                <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-sm bg-[#DCD7CD] text-[#033225] uppercase">
                  {waiter.role}
                </span>
              </div>
              <p className="text-[10px] tracking-wider uppercase text-[#DCD7CD]/70">Plano de Sala & Comandas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewKds}
              className="px-3 py-1.5 text-xs font-bold bg-[#02241A] text-[#DCD7CD] border border-[#DCD7CD]/30 rounded-xl hover:bg-[#021710] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#DCD7CD]" />
              <span className="hidden sm:inline">Monitor</span> KDS Cocina
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-[#DCD7CD]/70 hover:text-rose-300 hover:bg-[#02241A] rounded-xl transition cursor-pointer"
              title="Cerrar Turno"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Resumen */}
        <div className="max-w-6xl mx-auto mt-3 pt-2.5 border-t border-[#DCD7CD]/15 flex flex-wrap items-center justify-between gap-2">
          {/* Pills de Zonas */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                  selectedZone === zone
                    ? 'bg-[#DCD7CD] text-[#033225] shadow-xs'
                    : 'bg-[#02241A]/60 text-[#DCD7CD]/80 hover:bg-[#02241A] hover:text-white'
                }`}
              >
                {zone === 'ALL' ? 'Todas las Zonas' : zone}
              </button>
            ))}
          </div>

          {/* Mini KPIs */}
          <div className="flex items-center gap-3 text-xs font-medium text-[#DCD7CD]">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#DCD7CD]" />
              {availableCount} Libres
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {occupiedCount} Ocupadas
            </span>
            {billCount > 0 && (
              <span className="inline-flex items-center gap-1 text-rose-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
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
                style={{ minHeight: '155px' }}
              >
                {/* Cabecera de la mesa */}
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#877E6F]">
                    {table.zone}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badgeBg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Número Grande con tipografía Serif Editorial */}
                <div className="my-2">
                  <span className="text-3xl font-serif font-black text-[#033225] block leading-tight">
                    Mesa {table.number}
                  </span>
                  {table.activeOrder && (
                    <span className="text-xs font-bold text-[#4A2016] block mt-0.5">
                      ${table.activeOrder.total?.toFixed(2) || '0.00'} • {table.activeOrder.items?.length || 0} ítems
                    </span>
                  )}
                </div>

                {/* Pie de tarjeta */}
                <div className="pt-2 border-t border-[#DCD7CD]/60 flex items-center justify-between text-[11px] text-[#675F52]">
                  {table.activeOrder ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#033225]">
                      <Clock className="w-3 h-3 text-[#033225]" />
                      Ronda {table.activeOrder.currentRound || 1}
                    </span>
                  ) : (
                    <span className="text-[#877E6F]">Abrir mesa</span>
                  )}
                  <span className="text-[#033225] font-bold text-xs">➔</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
