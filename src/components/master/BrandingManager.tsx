import React, { useState } from 'react';
import { SystemBranding } from '../../types';
import { Palette, Sparkles, Building, Phone, MapPin, Check, Image as ImageIcon } from 'lucide-react';

interface BrandingManagerProps {
  branding: SystemBranding;
  onUpdateBranding: (updated: Partial<SystemBranding>) => Promise<void>;
}

export const BrandingManager: React.FC<BrandingManagerProps> = ({
  branding,
  onUpdateBranding
}) => {
  const [formData, setFormData] = useState({
    restaurantName: branding.restaurantName || 'SABOR & FUEGO',
    logoUrl: branding.logoUrl || '',
    primaryColor: branding.primaryColor || '#ea580c',
    accentColor: branding.accentColor || '#f97316',
    contactPhone: branding.contactPhone || '+57 300 123 4567',
    contactAddress: branding.contactAddress || 'Av. Principal #45-12'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Aplicar colores en caliente en el DOM mediante CSS custom properties
  const applyBrandingToDOM = (primary: string, accent: string) => {
    document.documentElement.style.setProperty('--brand-primary', primary);
    document.documentElement.style.setProperty('--brand-accent', accent);
  };

  const handleColorChange = (key: 'primaryColor' | 'accentColor', color: string) => {
    const updated = { ...formData, [key]: color };
    setFormData(updated);
    applyBrandingToDOM(updated.primaryColor, updated.accentColor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await onUpdateBranding({
        ...formData,
        updatedAt: new Date()
      });
      applyBrandingToDOM(formData.primaryColor, formData.accentColor);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error guardando branding:', err);
      alert('Error al guardar personalización de marca.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-orange-500" />
          <div>
            <h3 className="text-sm font-extrabold text-white">
              Personalización Dinámica de Marca (Branding en Caliente)
            </h3>
            <p className="text-xs text-slate-400">
              Modifica la identidad visual del local en caliente sin compilar nuevamente el frontend.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4" />
            ¡Guardado y aplicado en caliente!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Nombre Comercial del Restaurante
            </label>
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.restaurantName}
                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              URL del Logotipo (PNG / WebP Transparente)
            </label>
            <div className="relative">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="url"
                placeholder="https://..."
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Colores Primario y Acento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Color Primario (Botones y destacados)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-28 text-xs font-mono uppercase px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
              <span
                className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Muestra
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Color Acento / Secundario
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={formData.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="w-28 text-xs font-mono uppercase px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
              <span
                className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: formData.accentColor }}
              >
                Muestra
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Teléfono / WhatsApp Oficial
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Dirección del Local
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={formData.contactAddress}
                onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            {isSaving ? 'Guardando en Firestore...' : 'Guardar y Aplicar Branding'}
          </button>
        </div>
      </form>
    </div>
  );
};
