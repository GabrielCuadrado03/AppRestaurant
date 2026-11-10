import { Product, Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Hamburguesas & Grill', displayOrder: 1, isActive: true },
  { id: 'cat_2', name: 'Pizzas Artesanales', displayOrder: 2, isActive: true },
  { id: 'cat_3', name: 'Bebidas & Cocteles', displayOrder: 3, isActive: true },
  { id: 'cat_4', name: 'Postres de Autor', displayOrder: 4, isActive: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Hamburguesa Angus Trufada',
    description: 'Carne Angus 220g, queso gouda fundido, cebolla caramelizada, rúcula y mayonesa de trufa negra.',
    price: 14.50,
    categoryId: 'cat_1',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.9,
    reviewCount: 38,
    totalSold: 142
  },
  {
    id: 'prod_2',
    name: 'Costillas BBQ al Fuego Lento',
    description: 'Costillar de cerdo ahumado durante 8 horas con leña de manzano y salsa barbecue artesanal.',
    price: 18.00,
    categoryId: 'cat_1',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.8,
    reviewCount: 29,
    totalSold: 98
  },
  {
    id: 'prod_3',
    name: 'Pizza Napolitana Margherita',
    description: 'Masa madre con fermentación 48h, salsa de tomate San Marzano, mozzarella fior di latte y albahaca fresca.',
    price: 12.00,
    categoryId: 'cat_2',
    imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.7,
    reviewCount: 22,
    totalSold: 85
  },
  {
    id: 'prod_4',
    name: 'Pizza Cuatro Quesos & Miel Picante',
    description: 'Mozzarella, gorgonzola, parmesano reggiano, provolone y un toque de miel infusionada en chile.',
    price: 13.50,
    categoryId: 'cat_2',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 5.0,
    reviewCount: 19,
    totalSold: 64
  },
  {
    id: 'prod_5',
    name: 'Gin Tonic Botánico de la Casa',
    description: 'Gin premium infusionado con bayas de enebro, pepino fresco, romero y tónica artesanal.',
    price: 9.50,
    categoryId: 'cat_3',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.8,
    reviewCount: 15,
    totalSold: 110
  },
  {
    id: 'prod_6',
    name: 'Volcán de Chocolate Belga',
    description: 'Bizcocho tibio de chocolate amargo 70% con corazón fundido y helado de vainilla de Madagascar.',
    price: 7.50,
    categoryId: 'cat_4',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.9,
    reviewCount: 31,
    totalSold: 120
  }
];
