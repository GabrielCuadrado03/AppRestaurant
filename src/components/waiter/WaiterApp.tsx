import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, Category, RestaurantTable, WaiterProfile, Order } from '../../types';
import { WaiterPinLogin } from './WaiterPinLogin';
import { TableGrid } from './TableGrid';
import { OrderPad } from './OrderPad';

// Generación inicial de 16 mesas de salón y terraza
const INITIAL_TABLES: RestaurantTable[] = [
  { number: 1, zone: 'Salón Principal', status: 'AVAILABLE' },
  { number: 2, zone: 'Salón Principal', status: 'AVAILABLE' },
  { number: 3, zone: 'Salón Principal', status: 'AVAILABLE' },
  { number: 4, zone: 'Salón Principal', status: 'AVAILABLE' },
  { number: 5, zone: 'Salón Principal', status: 'AVAILABLE' },
  { number: 6, zone: 'Salón Principal', status: 'AVAILABLE' },
  { number: 7, zone: 'Salón Principal', status: 'AVAILABLE' },
  { number: 8, zone: 'Salón Principal', status: 'AVAILABLE' },
  { number: 9, zone: 'Terraza', status: 'AVAILABLE' },
  { number: 10, zone: 'Terraza', status: 'AVAILABLE' },
  { number: 11, zone: 'Terraza', status: 'AVAILABLE' },
  { number: 12, zone: 'Terraza', status: 'AVAILABLE' },
  { number: 13, zone: 'Barra', status: 'AVAILABLE' },
  { number: 14, zone: 'Barra', status: 'AVAILABLE' },
  { number: 15, zone: 'VIP Lounge', status: 'AVAILABLE' },
  { number: 16, zone: 'VIP Lounge', status: 'AVAILABLE' },
];

interface WaiterAppProps {
  products: Product[];
  categories: Category[];
  onViewKds: () => void;
}

export const WaiterApp: React.FC<WaiterAppProps> = ({
  products,
  categories,
  onViewKds
}) => {
  const [loggedWaiter, setLoggedWaiter] = useState<WaiterProfile | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [activeOrders, setActiveOrders] = useState<Record<string, Order>>({});

  // Suscripción reactiva a todas las órdenes activas en Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersMap: Record<string, Order> = {};
      snapshot.forEach((d) => {
        const ord = { id: d.id, ...d.data() } as Order;
        // Solo órdenes no pagadas ni canceladas por completo
        if (ord.status !== 'PAID' && ord.status !== 'VOIDED') {
          ordersMap[String(ord.tableNumber)] = ord;
        }
      });
      setActiveOrders(ordersMap);
    }, (error) => {
      console.warn('Orders listener:', error);
    });

    return () => unsubscribe();
  }, []);

  // Construir estado de las mesas a partir de las órdenes activas
  const tablesWithStatus: RestaurantTable[] = INITIAL_TABLES.map((t) => {
    const active = activeOrders[String(t.number)];
    if (!active) {
      return { ...t, status: 'AVAILABLE', activeOrder: null };
    }
    return {
      ...t,
      status: active.status === 'READY' ? 'BILL_REQUESTED' : 'OCCUPIED',
      activeOrder: active
    };
  });

  // Guardar / Actualizar orden en Firestore
  const handleSaveOrder = async (order: Order) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await setDoc(orderRef, {
        ...order,
        updatedAt: new Date()
      }, { merge: true });
    } catch (err) {
      console.error('Error saving order to Firestore:', err);
      // Fallback estado local
      setActiveOrders((prev) => ({
        ...prev,
        [String(order.tableNumber)]: order
      }));
    }
  };

  // Pedir cuenta de la mesa
  const handleCloseOrderBill = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'PAID',
        updatedAt: new Date()
      });
      setSelectedTable(null);
    } catch (err) {
      console.error('Error updating order:', err);
      setSelectedTable(null);
    }
  };

  // 1. Vista de Login por PIN
  if (!loggedWaiter) {
    return <WaiterPinLogin onSuccess={(waiter) => setLoggedWaiter(waiter)} />;
  }

  // 2. Vista de Comanda de la Mesa Seleccionada
  if (selectedTable) {
    const currentTableData = tablesWithStatus.find((t) => t.number === selectedTable.number) || selectedTable;
    return (
      <OrderPad
        table={currentTableData}
        waiter={loggedWaiter}
        products={products}
        categories={categories}
        existingOrder={currentTableData.activeOrder || null}
        onSaveOrder={handleSaveOrder}
        onCloseOrderBill={handleCloseOrderBill}
        onBack={() => setSelectedTable(null)}
      />
    );
  }

  // 3. Cuadrícula de Mesas
  return (
    <TableGrid
      tables={tablesWithStatus}
      waiter={loggedWaiter}
      onSelectTable={(table) => setSelectedTable(table)}
      onLogout={() => setLoggedWaiter(null)}
      onViewKds={onViewKds}
    />
  );
};
