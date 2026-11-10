import React, { useState } from 'react';
import {
  Product,
  Category,
  Order,
  OrderItem,
  RestaurantTable,
  WaiterProfile,
  ItemCancellation
} from '../../types';
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  AlertTriangle,
  Receipt,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface OrderPadProps {
  table: RestaurantTable;
  waiter: WaiterProfile;
  products: Product[];
  categories: Category[];
  existingOrder: Order | null;
  onSaveOrder: (order: Order) => Promise<void>;
  onCloseOrderBill: (orderId: string) => Promise<void>;
  onBack: () => void;
}

export const OrderPad: React.FC<OrderPadProps> = ({
  table,
  waiter,
  products,
  categories,
  existingOrder,
  onSaveOrder,
  onCloseOrderBill,
  onBack
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ítems actuales de la orden
  const [items, setItems] = useState<OrderItem[]>(existingOrder ? existingOrder.items : []);
  const [cancellations, setCancellations] = useState<ItemCancellation[]>(
    existingOrder?.cancellations || []
  );

  // Ronda activa
  const [currentRound, setCurrentRound] = useState<number>(
    existingOrder ? existingOrder.currentRound || 1 : 1
  );

  // Modal para notas del ítem
  const [editingNotesItem, setEditingNotesItem] = useState<OrderItem | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  // Modal para anulación con PIN administrativo
  const [itemToVoid, setItemToVoid] = useState<OrderItem | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [voidError, setVoidError] = useState<string | null>(null);

  // Agregar producto a la comanda
  const handleAddProduct = (product: Product) => {
    // Si ya existe un ítem en esta ronda y en estado PENDING, incrementar
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === product.id &&
        item.round === currentRound &&
        item.status === 'PENDING'
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
    } else {
      const newItem: OrderItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        round: currentRound,
        status: 'PENDING',
        createdAt: new Date()
      };
      setItems([...items, newItem]);
    }
  };

  // Modificar cantidad (solo para ítems en PENDING)
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as OrderItem[];
    setItems(updated);
  };

  // Gestión de eliminación / anulación de ítems
  const handleRemoveOrVoidItem = (item: OrderItem) => {
    if (item.status === 'PENDING') {
      // Regla: Si está en PENDING permite quitarlo directamente
      setItems(items.filter((i) => i.id !== item.id));
    } else {
      // Regla: Si ya está en PREPARING o READY solicita motivo obligatorio y PIN administrativo
      setItemToVoid(item);
      setVoidReason('');
      setAdminPinInput('');
      setVoidError(null);
    }
  };

  const handleConfirmVoid = () => {
    if (!voidReason.trim()) {
      setVoidError('Debes ingresar un motivo de anulación obligatorio.');
      return;
    }
    // PIN admin autorizado: '9999' o rol admin
    if (adminPinInput !== '9999' && waiter.role !== 'admin') {
      setVoidError('PIN administrativo inválido. Se requiere autorización.');
      return;
    }

    if (!itemToVoid) return;

    // Registrar en array 'cancellations'
    const newCancellation: ItemCancellation = {
      itemId: itemToVoid.id,
      productName: itemToVoid.productName,
      reason: voidReason.trim(),
      authorizedPin: adminPinInput,
      canceledByUid: waiter.name,
      canceledAt: new Date()
    };

    setCancellations([...cancellations, newCancellation]);

    // Marcar el ítem como VOIDED sin detener la orden
    setItems(
      items.map((i) =>
        i.id === itemToVoid.id
          ? {
              ...i,
              status: 'VOIDED',
              voidReason: voidReason.trim(),
              authorizedPin: adminPinInput
            }
          : i
      )
    );

    setItemToVoid(null);
    setVoidReason('');
    setAdminPinInput('');
  };

  // Guardar notas específicas (ej. "sin cebolla")
  const handleSaveNotes = () => {
    if (editingNotesItem) {
      setItems(
        items.map((i) => (i.id === editingNotesItem.id ? { ...i, notes: tempNote } : i))
      );
      setEditingNotesItem(null);
      setTempNote('');
    }
  };

  // Iniciar nueva ronda de adicionales
  const handleAdvanceRound = () => {
    setCurrentRound((prev) => prev + 1);
  };

  // Calcular totales (omitiendo ítems anulados 'VOIDED')
  const validItems = items.filter((i) => i.status !== 'VOIDED');
  const subtotal = validItems.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
  const tax = subtotal * 0.10; // 10% estimado
  const total = subtotal + tax;

  // Enviar / Confirmar Comanda a Cocina
  const handleSendToKitchen = async () => {
    if (validItems.length === 0) {
      alert('Debes agregar al menos un plato a la comanda.');
      return;
    }

    const orderToSave: Order = {
      id: existingOrder?.id || `ord_${Date.now()}`,
      tableNumber: table.number,
      status: 'PENDING',
      items,
      cancellations,
      subtotal,
      tax,
      total,
      currentRound,
      waiterId: waiter.id,
      waiterName: waiter.name,
      createdAt: existingOrder?.createdAt || new Date(),
      updatedAt: new Date()
    };

    await onSaveOrder(orderToSave);
    onBack();
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar Móvil / Tablet */}
      <header className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-extrabold flex items-center gap-2">
                Mesa {table.number}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-600 text-white">
                  Ronda {currentRound}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Atiende: {waiter.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdvanceRound}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-orange-400 flex items-center gap-1 border border-orange-500/30"
              title="Añadir nueva tanda / ronda"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Ronda
            </button>
            {existingOrder && (
              <button
                onClick={() => onCloseOrderBill(existingOrder.id)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Receipt className="w-3.5 h-3.5" />
                Pedir Cuenta
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Grid Split: Menú a la izquierda, Comanda a la derecha */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Catálogo de Productos */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Barra de búsqueda y categorías */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar plato o bebida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Platos en cuadrícula táctil */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => prod.isAvailable && handleAddProduct(prod)}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                  prod.isAvailable
                    ? 'bg-white border-slate-200/80 hover:border-orange-500 active:scale-98 cursor-pointer shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                }`}
                style={{ minHeight: '130px' }}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-extrabold text-slate-900 line-clamp-2">
                      {prod.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{prod.description}</p>
                </div>

                <div className="pt-2 flex items-center justify-between mt-auto">
                  <span className="text-xs font-extrabold text-orange-600">
                    ${prod.price.toFixed(2)}
                  </span>
                  {prod.isAvailable ? (
                    <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                      +
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-rose-600 uppercase bg-rose-50 px-1 py-0.5 rounded">
                      Agotado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Lateral: Comanda Activa */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shadow-lg">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Comanda en Curso</h2>
              <span className="text-[11px] text-slate-400">{validItems.length} ítems activos</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              Ronda {currentRound}
            </span>
          </div>

          {/* Lista de Ítems */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                La comanda está vacía. Toca un plato del menú para agregarlo.
              </div>
            ) : (
              items.map((item) => {
                const isVoided = item.status === 'VOIDED';

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition ${
                      isVoided
                        ? 'bg-rose-50/50 border-rose-200 line-through opacity-70'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{item.productName}</span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            (R{item.round})
                          </span>
                        </div>
                        <span className="text-[11px] text-orange-600 font-extrabold">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        {item.notes && (
                          <p className="text-[11px] text-amber-700 italic font-medium mt-0.5">
                            Nota: "{item.notes}"
                          </p>
                        )}
                        {isVoided && item.voidReason && (
                          <p className="text-[10px] text-rose-600 font-bold mt-1">
                            Anulado: {item.voidReason}
                          </p>
                        )}
                      </div>

                      {/* Estado */}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          item.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'READY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Controles de Ítem */}
                    {!isVoided && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        {/* Selector de notas */}
                        <button
                          onClick={() => {
                            setEditingNotesItem(item);
                            setTempNote(item.notes || '');
                          }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-orange-600 underline cursor-pointer"
                        >
                          {item.notes ? 'Editar nota' : '+ Agregar nota'}
                        </button>

                        <div className="flex items-center gap-2">
                          {item.status === 'PENDING' && (
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                className="p-1 hover:bg-slate-100 rounded-l-lg text-slate-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                className="p-1 hover:bg-slate-100 rounded-r-lg text-slate-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Botón de quitar / anular */}
                          <button
                            onClick={() => handleRemoveOrVoidItem(item)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title={
                              item.status === 'PENDING'
                                ? 'Quitar ítem'
                                : 'Anular con PIN administrativo'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Resumen de Cuenta y Botón Enviar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuesto (10%):</span>
                <span className="font-semibold text-slate-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total:</span>
                <span className="text-orange-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSendToKitchen}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Enviar Comanda a Cocina
            </button>
          </div>
        </div>
      </div>

      {/* Modal Agregar Notas ("sin cebolla", "término medio") */}
      {editingNotesItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Notas para: {editingNotesItem.productName}
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Indica especificaciones especiales para cocina
            </p>

            <textarea
              rows={3}
              placeholder="Ej. Sin cebolla, término 3/4, salsa aparte..."
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden mb-3"
            />

            {/* Sugerencias Rápidas */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {['Sin cebolla', 'Término medio', 'Bien cocido', 'Salsa aparte', 'Sin picante'].map(
                (quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setTempNote((prev) => (prev ? `${prev}, ${quick}` : quick))}
                    className="text-[10px] font-semibold bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 px-2 py-1 rounded-lg"
                  >
                    +{quick}
                  </button>
                )
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNotesItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-1.5 text-xs bg-orange-600 text-white font-bold rounded-lg shadow-xs hover:bg-orange-700"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Autorización de Anulación con Motivo y PIN */}
      {itemToVoid && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Anulación de Plato en Cocina</span>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              El plato <strong>{itemToVoid.productName}</strong> ya se encuentra en preparación o listo.
              Para anularlo se requiere justificación y PIN administrativo.
            </p>

            {voidError && (
              <div className="p-2 mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {voidError}
              </div>
            )}

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo obligatorio de anulación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cliente se retiró, error de digitación, plato demorado"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN de Autorización Administrativa
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="PIN Admin (demo: 9999)"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToVoid(null)}
                className="px-3 py-2 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
              >
                Autorizar Anulación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
