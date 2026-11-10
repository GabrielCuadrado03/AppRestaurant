import React, { useState } from 'react';
import { Order, Review } from '../../types';
import {
  Star,
  CheckCircle,
  Sparkles,
  Heart,
  Send,
  MessageSquare,
  UtensilsCrossed,
  X,
  Phone,
  Gift
} from 'lucide-react';

interface FeedbackModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  onLoyaltyRegister?: (phone: string) => Promise<void>;
  initialPhone?: string;
}

const FEEDBACK_TAGS = [
  '⚡ Servicio rápido',
  '🔥 Deliciosa sazón',
  '✨ Gran presentación',
  '👨‍🍳 Cocción perfecta',
  '🍷 Excelente maridaje',
  '🌿 Ingredientes frescos',
  '❄️ Bebidas frías',
  '💬 Atención amable'
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmitReview,
  onLoyaltyRegister,
  initialPhone
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedBestDish, setSelectedBestDish] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(!initialPhone);

  // Estado para el banner final de fidelización
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [loyaltyPhone, setLoyaltyPhone] = useState<string>('');
  const [loyaltyRegistered, setLoyaltyRegistered] = useState<boolean>(false);

  if (!isOpen) return null;

  // Extraer platos no anulados consumidos en la mesa
  const consumedDishes = order.items
    .filter((i) => i.status !== 'VOIDED')
    .map((i) => i.productName);
  const uniqueDishes = Array.from(new Set(consumedDishes));

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmitReview({
      orderId: order.id,
      tableNumber: order.tableNumber,
      rating,
      bestDish: selectedBestDish || undefined,
      tags: selectedTags,
      comment: comment.trim(),
      isAnonymous
    });

    setIsSubmitted(true);
  };

  const handleRegisterLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loyaltyPhone.trim() && onLoyaltyRegister) {
      await onLoyaltyRegister(loyaltyPhone.trim());
      setLoyaltyRegistered(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 sm:zoom-in-95">
        {/* Pantalla de Agradecimiento y Banner de Fidelización */}
        {isSubmitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">¡Muchas Gracias por tu Opinión!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tu feedback nos ayuda a mejorar continuamente cada experiencia.
              </p>
            </div>

            {/* Banner de Fidelización para Clientes Anónimos */}
            {(!initialPhone || isAnonymous) && !loyaltyRegistered ? (
              <div className="mt-4 p-4 rounded-2xl bg-orange-50 border border-orange-200 text-left">
                <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs mb-1">
                  <Gift className="w-4 h-4" />
                  <span>CORTESÍA EXCLUSIVA EN TU PRÓXIMA VISITA</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Ingresa tu WhatsApp para acumular visitas y acceder a cortesías y descuentos exclusivos en tu próxima visita.
                </p>

                <form onSubmit={handleRegisterLoyalty} className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Tu WhatsApp (ej. 3001234567)"
                    value={loyaltyPhone}
                    onChange={(e) => setLoyaltyPhone(e.target.value)}
                    required
                    className="flex-1 text-xs px-3 py-2 bg-white border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Vincular
                  </button>
                </form>
              </div>
            ) : loyaltyRegistered ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                🎉 ¡WhatsApp vinculado con éxito a tu cuenta de fidelización!
              </div>
            ) : null}

            <button
              onClick={onClose}
              className="w-full py-2.5 mt-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-black transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* Formulario Interactivo de Calificación */
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">¿Cómo estuvo tu experiencia?</h3>
                  <span className="text-[11px] text-slate-400">Mesa {order.tableNumber}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendFeedback} className="space-y-4">
              {/* Selector 1 a 5 Estrellas */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-3xl focus:outline-hidden transition-transform transform active:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoverRating !== null ? hoverRating >= star : rating >= star)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-600 mt-1">
                  {rating === 5 && '🌟 ¡Excelente experiencia!'}
                  {rating === 4 && '😊 Muy buena comida y servicio'}
                  {rating === 3 && '🙂 Aceptable / Regular'}
                  {rating === 2 && '😕 Podemos mejorar'}
                  {rating === 1 && '😞 Mala experiencia'}
                </span>
              </div>

              {/* Selector de Plato Preferido Consumido */}
              {uniqueDishes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    ¿Cuál fue tu plato preferido?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {uniqueDishes.map((dish) => (
                      <button
                        key={dish}
                        type="button"
                        onClick={() => setSelectedBestDish(dish)}
                        className={`p-2 rounded-xl text-xs font-semibold text-left transition border ${
                          selectedBestDish === dish
                            ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {dish}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chips táctiles de tags positivos / áreas de mejora */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Destaca lo mejor de la visita:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comentarios Adicionales */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comentarios para el equipo
                </label>
                <textarea
                  rows={2}
                  placeholder="Cuéntanos algún detalle sobre la comida o atención..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Enviar Calificación
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
