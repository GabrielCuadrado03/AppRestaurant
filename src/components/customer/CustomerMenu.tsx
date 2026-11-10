import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, Category, Order, Review, Customer } from '../../types';
import { CustomerIdentityModal } from './CustomerIdentityModal';
import { FeedbackModal } from './FeedbackModal';
import {
  Utensils,
  Search,
  Sparkles,
  Flame,
  Star,
  Clock,
  Heart,
  HelpCircle,
  CheckCircle2,
  Phone,
  Gift
} from 'lucide-react';

interface CustomerMenuProps {
  initialTable?: number;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({ initialTable }) => {
  // 1. Detección y Contexto de Mesa desde URL (?table=X) y localStorage
  const [tableNumber, setTableNumber] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table');
      if (urlTable) {
        const parsed = parseInt(urlTable, 10);
        if (!isNaN(parsed) && parsed > 0) {
          localStorage.setItem('restaurant_table_number', String(parsed));
          return parsed;
        }
      }
      const saved = localStorage.getItem('restaurant_table_number');
      if (saved) return parseInt(saved, 10) || 1;
    }
    return initialTable || 1;
  });

  // Datos de Cliente (Identificación progresiva)
  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('restaurant_customer_info');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  });

  const [showIdentityModal, setShowIdentityModal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem('restaurant_identity_dismissed');
      const hasSavedInfo = localStorage.getItem('restaurant_customer_info');
      return !isDismissed && !hasSavedInfo;
    }
    return true;
  });

  // Catálogo de Productos y Categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Orden activa escuchada para la mesa
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [hasReviewedOrder, setHasReviewedOrder] = useState<boolean>(false);

  // Escuchar categorías activas
  useEffect(() => {
    const unsubCat = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[];
      setCategories(data.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder));
    });

    const unsubProd = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
      setProducts(data);
    });

    return () => {
      unsubCat();
      unsubProd();
    };
  }, []);

  // Escuchar orden activa de la mesa en tiempo real
  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('tableNumber', '==', tableNumber)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let currentOrder: Order | null = null;
      snapshot.forEach((docSnapshot) => {
        const ord = { id: docSnapshot.id, ...docSnapshot.data() } as Order;
        if (ord.status !== 'PAID' && ord.status !== 'VOIDED') {
          currentOrder = ord;
        }
      });

      setActiveOrder(currentOrder);

      // Si el estado pasa a DELIVERED o READY y aún no ha calificado, desplegar modal
      if (currentOrder) {
        const orderStatus = (currentOrder as Order).status;
        const orderId = (currentOrder as Order).id;
        if (orderStatus === 'DELIVERED' || orderStatus === 'READY') {
          const reviewedKey = `reviewed_order_${orderId}`;
          const alreadyReviewed = localStorage.getItem(reviewedKey);
          if (!alreadyReviewed && !hasReviewedOrder) {
            setShowFeedbackModal(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [tableNumber, hasReviewedOrder]);

  // Manejadores de Identidad Progresiva
  const handleSaveCustomer = async (name: string, phone: string) => {
    const info = { name, phone };
    setCustomerInfo(info);
    localStorage.setItem('restaurant_customer_info', JSON.stringify(info));
    setShowIdentityModal(false);

    // Registro/actualización en el CRM de Firestore
    try {
      const custRef = doc(db, 'customers', phone);
      const snap = await getDoc(custRef);
      if (snap.exists()) {
        await setDoc(custRef, { name, updatedAt: new Date() }, { merge: true });
      } else {
        await setDoc(custRef, {
          id: phone,
          name,
          phone,
          totalOrders: 0,
          totalSpent: 0,
          favoriteProducts: [],
          firstVisit: new Date(),
          lastVisit: new Date()
        });
      }
    } catch (e) {
      console.warn('CRM sync info:', e);
    }
  };

  const handleSkipAnonymous = () => {
    localStorage.setItem('restaurant_identity_dismissed', 'true');
    setShowIdentityModal(false);
  };

  // Enviar valoración a Firestore (cumple reglas firestore.rules para 'reviews')
  const handleSubmitReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: new Date()
      });

      if (activeOrder) {
        localStorage.setItem(`reviewed_order_${activeOrder.id}`, 'true');
      }
      setHasReviewedOrder(true);
    } catch (err) {
      console.error('Error enviando review:', err);
    }
  };

  // Vinculación de fidelización desde el banner final
  const handleLoyaltyRegister = async (phone: string) => {
    await handleSaveCustomer(customerInfo?.name || 'Comensal Mesa ' + tableNumber, phone);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'ALL' || prod.categoryId === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16">
      {/* Header Mobile-First Ultraligero */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-orange-600/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black tracking-tight text-slate-900 block uppercase">
                SABOR & FUEGO
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800">
                  Mesa #{tableNumber}
                </span>
                {customerInfo && (
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                    Hola, {customerInfo.name.split(' ')[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notificación de Estado de Orden en Mesa */}
          {activeOrder && (
            <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900 text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {activeOrder.status === 'PENDING'
                  ? 'Recibido'
                  : activeOrder.status === 'PREPARING'
                  ? 'En Cocina'
                  : activeOrder.status === 'READY'
                  ? '¡Platos Listos!'
                  : 'Servido'}
              </span>
            </div>
          )}
        </div>

        {/* Buscador Rápido */}
        <div className="max-w-md mx-auto px-4 pb-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="¿Qué se te antoja hoy? (ej. Burger, Gin...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-100 rounded-xl border border-transparent focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-hidden transition"
            />
          </div>
        </div>

        {/* Carrusel de Categorías */}
        <div className="max-w-md mx-auto px-4 pb-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Lista de Platos Ultraligera y Visual */}
      <main className="max-w-md w-full mx-auto p-4 space-y-3.5">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No encontramos platos que coincidan con tu búsqueda.
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const isFeatured = (prod.ratingAvg && prod.ratingAvg >= 4.8) || (prod.totalSold && prod.totalSold > 20);

            return (
              <div
                key={prod.id}
                className={`bg-white rounded-2xl p-3 border shadow-xs flex gap-3 transition ${
                  prod.isAvailable
                    ? 'border-slate-200/80 hover:shadow-sm'
                    : 'border-slate-200 bg-slate-50/70 opacity-60'
                }`}
              >
                {/* Imagen del Plato con Compresión WebP */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Utensils className="w-8 h-8 stroke-[1]" />
                    </div>
                  )}

                  {/* Badge de Plato Agotado o Destacado */}
                  {!prod.isAvailable ? (
                    <span className="absolute inset-0 bg-slate-900/70 backdrop-blur-2xs flex items-center justify-center text-[10px] font-black uppercase text-white tracking-wider">
                      Agotado
                    </span>
                  ) : isFeatured ? (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      TOP
                    </span>
                  ) : null}
                </div>

                {/* Información y Precio */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {prod.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-orange-600">
                      ${prod.price.toFixed(2)}
                    </span>

                    {prod.ratingAvg && prod.ratingAvg > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {prod.ratingAvg.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Botón flotante para llamar al mesero o ver estado */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500">
            ¿Deseas ordenar o pedir asistencia?
          </div>
          <button
            onClick={() => {
              alert(`¡Un mesero se dirige a la Mesa #${tableNumber}!`);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            Llamar al Mesero
          </button>
        </div>
      </footer>

      {/* 2. Modal de Identificación Progresiva */}
      <CustomerIdentityModal
        isOpen={showIdentityModal}
        onSaveCustomer={handleSaveCustomer}
        onSkipAnonymous={handleSkipAnonymous}
      />

      {/* 3. Modal de Calificación y Feedback */}
      {activeOrder && (
        <FeedbackModal
          order={activeOrder}
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmitReview={handleSubmitReview}
          onLoyaltyRegister={handleLoyaltyRegister}
          initialPhone={customerInfo?.phone}
        />
      )}
    </div>
  );
};
