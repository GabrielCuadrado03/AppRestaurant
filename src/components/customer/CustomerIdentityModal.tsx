import React, { useState } from 'react';
import { User, Phone, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface CustomerIdentityModalProps {
  isOpen: boolean;
  onSaveCustomer: (name: string, phone: string) => void;
  onSkipAnonymous: () => void;
}

export const CustomerIdentityModal: React.FC<CustomerIdentityModalProps> = ({
  isOpen,
  onSaveCustomer,
  onSkipAnonymous
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor indícanos tu nombre.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      setError('Ingresa un número de WhatsApp válido.');
      return;
    }

    onSaveCustomer(name.trim(), phone.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Cabecera con Badge de Beneficios */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3 shadow-md shadow-orange-500/10">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            ¡Bienvenido a tu Experiencia Digital!
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ingresa tu nombre y WhatsApp para notificarte sobre tus pedidos y acumular beneficios en el restaurante.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ej. Sofía Martínez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Móvil</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                placeholder="Ej. +57 300 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Guardar y Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center">
          <button
            type="button"
            onClick={onSkipAnonymous}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 py-1 transition cursor-pointer"
          >
            Ver menú sin registrarme (Modo Anónimo)
          </button>
          <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Tus datos están protegidos y no enviamos spam
          </span>
        </div>
      </div>
    </div>
  );
};
