import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category, InventoryItem } from '../types';
import { ProductManager } from '../components/ProductManager';
import { CategoryManager } from '../components/CategoryManager';
import { TableQrGenerator } from '../components/TableQrGenerator';
import { KitchenInventory } from '../components/KitchenInventory';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { BrandLogo } from '../components/common/BrandLogo';
import {
  Utensils,
  Layers,
  QrCode,
  Boxes,
  ChefHat,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

type AdminTab = 'analytics' | 'products' | 'categories' | 'qr' | 'inventory';

export const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('analytics');

  // Estados reactivos sincronizados con Firestore
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Suscripción a Categorías
  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Category[];
      setCategories(data);
    }, (error) => {
      console.warn('Lectura Firestore categories:', error);
    });
    return () => unsubscribe();
  }, []);

  // 2. Suscripción a Productos
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Product[];
      setProducts(data);
      setLoading(false);
    }, (error) => {
      console.warn('Lectura Firestore products:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Suscripción a Inventario
  useEffect(() => {
    const q = query(collection(db, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as InventoryItem[];
      setInventoryItems(data);
    }, (error) => {
      console.warn('Lectura Firestore inventory:', error);
    });
    return () => unsubscribe();
  }, []);

  // Operaciones Firestore Categorías
  const handleAddCategory = async (cat: Omit<Category, 'id'>) => {
    try {
      await addDoc(collection(db, 'categories'), {
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (e) {
      console.error('Error adding category:', e);
      setCategories((prev) => [...prev, { id: `cat_${Date.now()}`, ...cat }]);
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await updateDoc(doc(db, 'categories', id), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (e) {
      console.error('Error updating category:', e);
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      console.error('Error deleting category:', e);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Operaciones Firestore Productos
  const handleAddProduct = async (prod: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), {
        ...prod,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (e) {
      console.error('Error adding product:', e);
      setProducts((prev) => [...prev, { id: `prod_${Date.now()}`, ...prod }]);
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (e) {
      console.error('Error updating product:', e);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.error('Error deleting product:', e);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Operaciones Inventario
  const handleAddInventory = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      await addDoc(collection(db, 'inventory'), {
        ...item,
        updatedAt: new Date()
      });
    } catch (e) {
      console.error('Error adding inventory item:', e);
      setInventoryItems((prev) => [...prev, { id: `inv_${Date.now()}`, ...item }]);
    }
  };

  const handleUpdateStock = async (id: string, currentStock: number) => {
    const item = inventoryItems.find((i) => i.id === id);
    const minThreshold = item?.minStockThreshold || 5;
    let status: InventoryItem['status'] = 'IN_STOCK';
    if (currentStock <= 0) status = 'OUT_OF_STOCK';
    else if (currentStock <= minThreshold) status = 'LOW_STOCK';

    try {
      await updateDoc(doc(db, 'inventory', id), {
        currentStock,
        status,
        updatedAt: new Date()
      });
    } catch (e) {
      console.error('Error updating stock:', e);
      setInventoryItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, currentStock, status } : i))
      );
    }
  };

  const handleDeleteInventory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (e) {
      console.error('Error deleting inventory item:', e);
      setInventoryItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col font-sans">
      {/* Navbar Superior (oculto en impresión) */}
      <header className="no-print bg-white border-b border-[#DCD7CD] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo
              size="md"
              variant="beige-on-green"
              name="ORIGEN & BISTRO"
              subtitle="PANEL DE ADMINISTRACIÓN & BI"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#675F52] font-medium px-3 py-1.5 rounded-xl bg-[#F7F5F0] border border-[#DCD7CD]">
              <ShieldCheck className="w-4 h-4 text-[#033225]" />
              BI Serverless Optimizado
            </span>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-[#DCD7CD]/60 scrollbar-none">
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              currentTab === 'analytics'
                ? 'border-[#033225] text-[#033225]'
                : 'border-transparent text-[#877E6F] hover:text-[#020202]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Business Intelligence (BI)
          </button>

          <button
            onClick={() => setCurrentTab('products')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              currentTab === 'products'
                ? 'border-[#033225] text-[#033225]'
                : 'border-transparent text-[#877E6F] hover:text-[#020202]'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Platos & Menú ({products.length})
          </button>

          <button
            onClick={() => setCurrentTab('categories')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              currentTab === 'categories'
                ? 'border-[#033225] text-[#033225]'
                : 'border-transparent text-[#877E6F] hover:text-[#020202]'
            }`}
          >
            <Layers className="w-4 h-4" />
            Categorías ({categories.length})
          </button>

          <button
            onClick={() => setCurrentTab('qr')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              currentTab === 'qr'
                ? 'border-[#033225] text-[#033225]'
                : 'border-transparent text-[#877E6F] hover:text-[#020202]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Generador QR Mesas
          </button>

          <button
            onClick={() => setCurrentTab('inventory')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              currentTab === 'inventory'
                ? 'border-[#033225] text-[#033225]'
                : 'border-transparent text-[#877E6F] hover:text-[#020202]'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Inventario Cocina ({inventoryItems.length})
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {currentTab === 'analytics' && <AnalyticsDashboard />}

        {currentTab === 'products' && (
          <ProductManager
            products={products}
            categories={categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentTab === 'categories' && (
          <CategoryManager
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {currentTab === 'qr' && <TableQrGenerator />}

        {currentTab === 'inventory' && (
          <KitchenInventory
            items={inventoryItems}
            onAddItem={handleAddInventory}
            onUpdateStock={handleUpdateStock}
            onDeleteItem={handleDeleteInventory}
          />
        )}
      </main>
    </div>
  );
};
