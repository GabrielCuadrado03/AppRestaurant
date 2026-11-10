import { Product, Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_coffee', name: 'Café de Especialidad', displayOrder: 1, isActive: true },
  { id: 'cat_brunch', name: 'Brunch & Masa Madre', displayOrder: 2, isActive: true },
  { id: 'cat_kitchen', name: 'Cocina Botánica de Autor', displayOrder: 3, isActive: true },
  { id: 'cat_bakery', name: 'Panadería & Repostería', displayOrder: 4, isActive: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Latte Art Especialidad & Especias',
    description: 'Espresso doble de origen, leche microtexturizada sedosa y toque botánico de canela y cardamomo.',
    price: 4.80,
    categoryId: 'cat_coffee',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.9,
    reviewCount: 52,
    totalSold: 215
  },
  {
    id: 'prod_2',
    name: 'Cold Brew Botánico con Naranja & Romero',
    description: 'Café macerado en frío durante 18 horas, servido sobre roca de hielo con rodaja de naranja deshidratada.',
    price: 5.50,
    categoryId: 'cat_coffee',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 5.0,
    reviewCount: 34,
    totalSold: 148
  },
  {
    id: 'prod_3',
    name: 'Filtrado V60 Origen de Altura',
    description: 'Extracción artesanal en mesa. Notas vivas a jazmín, miel de bosque y frutos amarillos maduros.',
    price: 5.00,
    categoryId: 'cat_coffee',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.8,
    reviewCount: 28,
    totalSold: 92
  },
  {
    id: 'prod_4',
    name: 'Tostón de Aguacate Hass & Stracciatella',
    description: 'Pan de masa madre horneado a la leña, aguacate hass laminado, stracciatella fresca y semillas tostadas.',
    price: 9.80,
    categoryId: 'cat_brunch',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.9,
    reviewCount: 61,
    totalSold: 184
  },
  {
    id: 'prod_5',
    name: 'Huevos Benedictinos sobre Pan Brioche',
    description: 'Huevos de campo pochados, lomo curado ahumado, espinacas salteadas y salsa holandesa con mantequilla avellanada.',
    price: 11.50,
    categoryId: 'cat_brunch',
    imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.8,
    reviewCount: 43,
    totalSold: 130
  },
  {
    id: 'prod_6',
    name: 'Bowl Verde Salmón Ahumado & Quinua',
    description: 'Láminas de salmón noruego ahumado, edamames, rúcula salvaje, quinua crujiente y emulsión de cítricos.',
    price: 13.90,
    categoryId: 'cat_kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.9,
    reviewCount: 39,
    totalSold: 112
  },
  {
    id: 'prod_7',
    name: 'Croissant Francés Frangipane & Almendras',
    description: 'Hojaldre artesanal con mantequilla de Bretaña, relleno de crema de almendras y tostado con almendras fileteadas.',
    price: 4.50,
    categoryId: 'cat_bakery',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 5.0,
    reviewCount: 77,
    totalSold: 290
  },
  {
    id: 'prod_8',
    name: 'Tarta Vasca Fundente con Frutos del Bosque',
    description: 'Cheesecake horneado a alta temperatura con corazón cremoso y compota silvestre de moras y arándanos.',
    price: 6.20,
    categoryId: 'cat_bakery',
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    ratingAvg: 4.9,
    reviewCount: 48,
    totalSold: 165
  }
];
