import React, { useState } from 'react';
import { WaiterProfile } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { Delete, Lock, ArrowRight, Sparkles } from 'lucide-react';

interface WaiterPinLoginProps {
  onSuccess: (waiter: WaiterProfile) => void;
}

export const DEFAULT_WAITERS: WaiterProfile[] = [
  { id: 'w1', name: 'Carlos Mendoza (Mesero)', pin: '1234', role: 'mesero' },
  { id: 'w2', name: 'Laura Gómez (Mesera)', pin: '5678', role: 'mesero' },
  { id: 'admin1', name: 'Administrador General', pin: '9999', role: 'admin' },
];

export const WaiterPinLogin: React.FC<WaiterPinLoginProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(null);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const verifyPin = (currentPin: string) => {
    const waiter = DEFAULT_WAITERS.find((w) => w.pin === currentPin);
    if (waiter) {
      onSuccess(waiter);
    } else {
      setError('PIN incorrecto. Intente nuevamente.');
      setTimeout(() => {
        setPin('');
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#02241A] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Fondo con textura sutil y brillo botánico */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#033225] blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#033225] blur-3xl opacity-50 pointer-events-none" />

      <div className="w-full max-w-sm bg-[#033225]/85 backdrop-blur-xl rounded-[2.5rem] p-8 border border-[#DCD7CD]/20 shadow-2xl flex flex-col items-center relative z-10">
        {/* Isotipo y Marca Oficial */}
        <div className="mb-5 flex flex-col items-center text-center">
          <BrandLogo
            size="lg"
            variant="green-on-beige"
            showText={true}
            name="ORIGEN & BISTRO"
            subtitle="CONTROL DE SALA & COMANDAS"
          />
        </div>

        <p className="text-[11px] font-medium text-[#DCD7CD]/80 mb-6 text-center tracking-wide">
          Ingresa tu PIN de 4 dígitos para acceder al servicio
        </p>

        {/* Indicadores de PIN */}
        <div className="flex items-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-400 scale-110'
                    : isFilled
                    ? 'bg-[#DCD7CD] scale-125 shadow-md shadow-[#DCD7CD]/40'
                    : 'bg-[#02241A] border border-[#DCD7CD]/30'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-300 mb-4 animate-shake">
            {error}
          </p>
        )}

        {/* Teclado numérico táctil */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 text-xl font-serif font-bold text-[#F7F5F0] bg-[#02241A]/70 hover:bg-[#DCD7CD] hover:text-[#033225] active:scale-95 rounded-2xl transition duration-150 flex items-center justify-center border border-[#DCD7CD]/10 shadow-xs cursor-pointer"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-14 text-xs font-bold text-[#DCD7CD]/70 hover:text-white bg-[#02241A]/40 hover:bg-[#02241A] rounded-2xl transition flex items-center justify-center cursor-pointer"
          >
            C
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 text-xl font-serif font-bold text-[#F7F5F0] bg-[#02241A]/70 hover:bg-[#DCD7CD] hover:text-[#033225] active:scale-95 rounded-2xl transition duration-150 flex items-center justify-center border border-[#DCD7CD]/10 shadow-xs cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-14 text-[#DCD7CD]/70 hover:text-rose-300 bg-[#02241A]/40 hover:bg-[#02241A] rounded-2xl transition flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Sugerencias de demostración */}
        <div className="w-full bg-[#02241A]/60 rounded-xl p-3 border border-[#DCD7CD]/15 text-[11px] text-[#DCD7CD]/80">
          <p className="font-bold text-[#DCD7CD] mb-1">PINs de acceso:</p>
          <div className="flex justify-between">
            <span>Mesero: <strong className="text-white">1234</strong> ó <strong className="text-white">5678</strong></span>
            <span>Admin: <strong className="text-white">9999</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
