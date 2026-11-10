import React, { useState } from 'react';
import { WaiterProfile } from '../../types';
import { Utensils, Delete, Lock, ChefHat, ArrowRight } from 'lucide-react';

interface WaiterPinLoginProps {
  onSuccess: (waiter: WaiterProfile) => void;
}

// Empleados predeterminados para demostración / acceso rápido
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

      // Verificación automática al completar 4 dígitos
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800/90 backdrop-blur-md rounded-3xl p-8 border border-slate-700/80 shadow-2xl flex flex-col items-center">
        {/* Logotipo */}
        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-600/30">
          <ChefHat className="w-9 h-9" />
        </div>

        <h1 className="text-xl font-extrabold text-white tracking-tight">Acceso Salón & Mesas</h1>
        <p className="text-xs text-slate-400 mt-1 mb-6 text-center">
          Ingresa tu PIN de 4 dígitos asignado
        </p>

        {/* Indicadores de PIN */}
        <div className="flex items-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 scale-110'
                    : isFilled
                    ? 'bg-orange-500 scale-125 shadow-md shadow-orange-500/50'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 mb-4 animate-shake">
            {error}
          </p>
        )}

        {/* Teclado numérico táctil */}
        <div className="grid grid-cols-3 gap-3.5 w-full mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-16 text-2xl font-bold text-white bg-slate-700/70 hover:bg-slate-700 active:bg-orange-600 rounded-2xl transition duration-150 flex items-center justify-center shadow-xs cursor-pointer"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-16 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/50 rounded-2xl transition flex items-center justify-center cursor-pointer"
          >
            C
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-16 text-2xl font-bold text-white bg-slate-700/70 hover:bg-slate-700 active:bg-orange-600 rounded-2xl transition duration-150 flex items-center justify-center shadow-xs cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-16 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-700/50 rounded-2xl transition flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Sugerencias de demostración */}
        <div className="w-full bg-slate-900/60 rounded-xl p-3 border border-slate-700/50 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">PINs de demostración:</p>
          <div className="flex justify-between">
            <span>Mesero: <strong className="text-orange-400">1234</strong> o <strong className="text-orange-400">5678</strong></span>
            <span>Admin PIN: <strong className="text-orange-400">9999</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
