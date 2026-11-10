import React, { useState } from 'react';
import { Category } from '../types';
import { Plus, Edit2, Trash2, FolderPlus, Check, X, Layers } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  onUpdateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', displayOrder: 1, isActive: true });

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      displayOrder: cat.displayOrder,
      isActive: cat.isActive
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', displayOrder: 1, isActive: true });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      await onUpdateCategory(editingId, formData);
    } else {
      await onAddCategory(formData);
    }
    handleCancel();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Categorías de Menú</h2>
            <p className="text-xs text-slate-500">Organiza las secciones que verán tus comensales</p>
          </div>
        </div>
        {!isCreating && (
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingId(null);
              setFormData({ name: '', displayOrder: categories.length + 1, isActive: true });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nueva Categoría
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSave} className="mb-6 p-4 rounded-xl bg-orange-50/50 border border-orange-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            {editingId ? 'Editar Categoría' : 'Crear Nueva Categoría'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Ej. Entradas, Bebidas..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Orden de visualización</label>
              <input
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                Activa
              </label>
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium border-y border-slate-200/80">
            <tr>
              <th className="py-2.5 px-3">Orden</th>
              <th className="py-2.5 px-3">Categoría</th>
              <th className="py-2.5 px-3">Estado</th>
              <th className="py-2.5 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  No hay categorías registradas.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-semibold text-slate-700">{cat.displayOrder}</td>
                  <td className="py-3 px-3 font-medium text-slate-900">{cat.name}</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onUpdateCategory(cat.id, { isActive: !cat.isActive })}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition ${
                        cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat.isActive ? 'Activa' : 'Oculta'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 hover:text-orange-600"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la categoría "${cat.name}"?`)) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 hover:text-rose-600"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
