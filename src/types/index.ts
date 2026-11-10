export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'VOIDED' | 'DELIVERED' | 'PAID';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'BILL_REQUESTED';

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  isAvailable: boolean;
  ratingAvg: number;
  reviewCount: number;
  totalSold: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ItemCancellation {
  itemId: string;
  productName: string;
  reason: string;
  authorizedPin: string;
  canceledByUid?: string;
  canceledAt: string | Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  round: number; // Soporte de rondas/tandas de comanda
  status: OrderStatus;
  voidReason?: string;
  authorizedPin?: string;
  createdAt?: string | Date;
}

export interface OrderCancellation {
  reason: string;
  authorizedPin: string;
  canceledByUid?: string;
  canceledAt: string | Date;
}

export interface Order {
  id: string;
  tableNumber: string | number;
  status: OrderStatus;
  items: OrderItem[];
  cancellations?: ItemCancellation[]; // Registro de ítems cancelados con motivo y PIN
  subtotal: number;
  tax?: number;
  tip?: number;
  total: number;
  currentRound: number;
  customerPhone?: string;
  customerId?: string;
  waiterId?: string;
  waiterName?: string;
  cancellation?: OrderCancellation;
  createdAt: string | Date | any;
  updatedAt: string | Date | any;
}

export interface RestaurantTable {
  number: number;
  zone: string;
  status: TableStatus;
  currentOrderId?: string;
  activeOrder?: Order | null;
  guestCount?: number;
}

export interface WaiterProfile {
  id: string;
  name: string;
  pin: string;
  role: 'mesero' | 'admin';
}

export interface Customer {
  id: string; // phone o doc id
  name: string;
  phone: string;
  taxId?: string;
  totalOrders: number;
  totalSpent: number;
  firstVisit: string | Date;
  lastVisit: string | Date;
  favoriteProducts: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Review {
  id: string;
  orderId: string;
  tableNumber: string | number;
  rating: number;
  bestDish?: string;
  tags: string[];
  comment: string;
  isAnonymous: boolean;
  createdAt: string | Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  status: InventoryStatus;
  minStockThreshold?: number;
  updatedAt?: string | Date;
}

export interface HourlySales {
  hour: number;
  revenue: number;
  orderCount: number;
}

export interface TopProductMetric {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface DailyAnalytics {
  id: string;
  date: string;
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  topProducts: TopProductMetric[];
  hourlySales: HourlySales[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ==========================================
// ETAPA 6: MASTER ADMIN & CONFIGURACIONES DEL SISTEMA
// ==========================================

export interface FeatureFlags {
  qrMenu: boolean;
  kds: boolean;
  crm: boolean;
  reviews: boolean;
  inventory: boolean;
}

export interface SystemLicense {
  isSuspended: boolean;
  suspensionReason?: string;
  featureFlags: FeatureFlags;
  licenseExpiryDate: string | Date | any;
  updatedAt?: string | Date | any;
}

export interface SystemBranding {
  restaurantName: string;
  logoUrl?: string;
  primaryColor: string; // HEX (ej. #ea580c)
  accentColor: string;  // HEX (ej. #f97316)
  contactPhone?: string;
  contactAddress?: string;
  updatedAt?: string | Date | any;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'mesero' | 'cocina' | 'admin';
  pin: string;
  isActive: boolean;
  lastLogin?: string | Date | any;
}

export interface VoidItemAudit {
  orderId: string;
  tableNumber: string | number;
  itemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalLoss: number;
  reason: string;
  authorizedPin: string;
  canceledAt: string | Date | any;
  canceledByUid?: string;
}

export type ImpersonationRole = 'NONE' | 'WAITER' | 'KDS' | 'ADMIN';

export interface ImpersonationState {
  isActive: boolean;
  role: ImpersonationRole;
  tableNumber?: number;
  readOnly: boolean;
}
