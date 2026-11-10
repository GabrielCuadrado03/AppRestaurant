import React, { useState } from 'react';
import { Product, Category } from '../types';
import { ImageUploader } from './ImageUploader';
import {
  Plus,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Search,
  CheckCircle,
  XCircle,
  Filter,
  DollarSign
} from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (prod: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    imageUrl: '',
    isAvailable: true,
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0 || !formData.categoryId) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, {
        ...formData,
        price: Number(formData.price),
      });
    } else {
      await onAddProduct({
        ...formData,
        price: Number(formData.price),
        ratingAvg: 5.0,
        reviewCount: 0,
        totalSold: 0,
      });
    }
    handleCloseModal();
  };

  // Toggle inmediato de disponibilidad sin abrir el modal
  const handleToggleAvailability = async (product: Product) => {
    await onUpdateProduct(product.id, {
      isAvailable: !product.isAvailable
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'ALL' || p.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const getCategoryName = (catId: string) => {
    return categories.find((c) => c.id === catId)?.name || 'Sin Categoría';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Catálogo de Productos y Platos</h2>
            <p className="text-xs text-slate-500">Administra disponibilidad, precios e imágenes</p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Barra de filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden w-full sm:w-auto"
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No se encontraron productos que coincidan con la búsqueda.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`flex flex-col border rounded-xl overflow-hidden transition-all bg-white ${
                product.isAvailable
                  ? 'border-slate-200/90 hover:shadow-md'
                  : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <UtensilsCrossed className="w-12 h-12 stroke-[1]" />
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold rounded-lg">
                  {getCategoryName(product.categoryId)}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-slate-900 font-bold text-xs rounded-lg shadow-xs">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {product.description || 'Sin descripción'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Switch Toggle Inmediato de Disponibilidad */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.isAvailable}
                      onClick={() => handleToggleAvailability(product)}
                      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        product.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={product.isAvailable ? 'Plato Disponible' : 'Plato Pausado/Agotado'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          product.isAvailable ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-[11px] font-semibold ${product.isAvailable ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {product.isAvailable ? 'Disponible' : 'Agotado'}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-orange-600 transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-rose-600 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Crear / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Componente WebP Image Uploader */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Foto del Plato / Bebida
                </label>
                <ImageUploader
                  currentImageUrl={formData.imageUrl}
                  onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej. Hamburguesa Clásica Artesanal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Precio ($)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      placeholder="12.50"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                      className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                  >
                    <option value="" disabled>Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción e Ingredientes</label>
                <textarea
                  rows={3}
                  placeholder="Carne Angus 200g, queso cheddar fundido, cebolla caramelizada y salsa especial..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modalIsAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="modalIsAvailable" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Disponible para ordenar inmediatamente
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-xs"
                >
                  {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
