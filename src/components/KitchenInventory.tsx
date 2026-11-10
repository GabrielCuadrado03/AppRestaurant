import React, { useState } from 'react';
import { InventoryItem, InventoryStatus } from '../types';
import {
  Boxes,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface KitchenInventoryProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  onUpdateStock: (id: string, currentStock: number) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export const KitchenInventory: React.FC<KitchenInventoryProps> = ({
  items,
  onAddItem,
  onUpdateStock,
  onDeleteItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryStatus>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario nuevo insumo
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Ingredientes',
    currentStock: 0,
    unit: 'kg',
    minStockThreshold: 5,
  });

  const calculateStatus = (stock: number, minThreshold = 5): InventoryStatus => {
    if (stock <= 0) return 'OUT_OF_STOCK';
    if (stock <= minThreshold) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    const status = calculateStatus(newItem.currentStock, newItem.minStockThreshold);

    await onAddItem({
      name: newItem.name,
      category: newItem.category,
      currentStock: newItem.currentStock,
      unit: newItem.unit,
      minStockThreshold: newItem.minStockThreshold,
      status,
      updatedAt: new Date()
    });

    setNewItem({
      name: '',
      category: 'Ingredientes',
      currentStock: 0,
      unit: 'kg',
      minStockThreshold: 5,
    });
    setIsModalOpen(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Semáforo visual de stock
  const renderStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Disponible
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Por agotarse
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Agotado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Inventario de Cocina</h2>
            <p className="text-xs text-slate-500">Supervisión de insumos y semáforo de existencias en tiempo real</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Insumo
        </button>
      </div>

      {/* Resumen Semáforo KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Disponibles</span>
            <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
              {items.filter((i) => i.status === 'IN_STOCK').length}
            </p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Por Agotarse</span>
            <p className="text-xl font-extrabold text-amber-700 mt-0.5">
              {items.filter((i) => i.status === 'LOW_STOCK').length}
            </p>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Agotados</span>
            <p className="text-xl font-extrabold text-rose-700 mt-0.5">
              {items.filter((i) => i.status === 'OUT_OF_STOCK').length}
            </p>
          </div>
          <XCircle className="w-6 h-6 text-rose-500" />
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar insumo o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden w-full sm:w-auto"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="IN_STOCK">🟢 Disponibles</option>
            <option value="LOW_STOCK">🟡 Por agotarse</option>
            <option value="OUT_OF_STOCK">🔴 Agotados</option>
          </select>
        </div>
      </div>

      {/* Tabla de Insumos */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Insumo</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Stock Actual</th>
              <th className="py-3 px-4">Unidad</th>
              <th className="py-3 px-4">Semáforo</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No hay insumos registrados en el inventario.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.currentStock}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          onUpdateStock(item.id, val);
                        }}
                        className="w-20 text-xs px-2 py-1 border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{item.unit}</td>
                  <td className="py-3 px-4">{renderStatusBadge(item.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${item.name}" del inventario?`)) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 text-xs font-semibold transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Insumo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Registrar Nuevo Insumo
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Insumo</label>
                <input
                  type="text"
                  placeholder="Ej. Tomate Chonto, Queso Mozzarella..."
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                >
                  <option value="Carnes">Carnes & Aves</option>
                  <option value="Lácteos">Lácteos & Quesos</option>
                  <option value="Verduras">Verduras & Vegetales</option>
                  <option value="Bebidas">Bebidas & Licores</option>
                  <option value="Secos">Abarrotes & Especias</option>
                  <option value="Panadería">Panadería</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unidad de Medida</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="l">Litros (l)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="unidades">Unidades (uds)</option>
                    <option value="paquetes">Paquetes</option>
                    <option value="cajas">Cajas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Umbral mínimo de alerta (Stock Crítico)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={newItem.minStockThreshold}
                  onChange={(e) => setNewItem({ ...newItem, minStockThreshold: parseFloat(e.target.value) || 1 })}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-xs"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
