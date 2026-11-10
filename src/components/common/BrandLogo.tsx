import React from 'react';

interface BrandLogoProps {
  name?: string;
  subtitle?: string;
  variant?: 'dark-on-light' | 'light-on-dark' | 'beige-on-green' | 'green-on-beige';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  name = 'ORIGEN & BISTRO',
  subtitle = 'SPECIALTY COFFEE & KITCHEN',
  variant = 'beige-on-green',
  size = 'md',
  showSubtitle = true,
  showText = true,
  className = ''
}) => {
  // Configuración de tamaños
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm font-bold',
    lg: 'text-lg font-bold',
    xl: 'text-2xl font-black'
  };

  const subSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-xs'
  };

  // Esquema de colores según brandbook
  let bgCircle = 'bg-[#033225]';
  let leafFill = '#DCD7CD';
  let textColor = 'text-[#020202]';
  let subColor = 'text-[#877E6F]';

  if (variant === 'light-on-dark') {
    bgCircle = 'bg-[#020202]';
    leafFill = '#FFFFFF';
    textColor = 'text-white';
    subColor = 'text-[#DCD7CD]';
  } else if (variant === 'beige-on-green') {
    bgCircle = 'bg-[#033225]';
    leafFill = '#DCD7CD';
    textColor = 'text-white';
    subColor = 'text-[#DCD7CD]/80';
  } else if (variant === 'green-on-beige') {
    bgCircle = 'bg-[#DCD7CD]';
    leafFill = '#033225';
    textColor = 'text-[#033225]';
    subColor = 'text-[#033225]/70';
  } else if (variant === 'dark-on-light') {
    bgCircle = 'bg-[#020202]';
    leafFill = '#FFFFFF';
    textColor = 'text-[#020202]';
    subColor = 'text-[#675F52]';
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Isotipo Botánico / Grano de Café Silueta 'S' */}
      <div className={`relative ${iconSizes[size]} rounded-full ${bgCircle} flex items-center justify-center p-1.5 shadow-xs shrink-0 transition-transform`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Mitad Izquierda con curva orgánica */}
          <path
            d="M 50 12 C 30 12 16 28 16 50 C 16 72 30 88 50 88 C 45 76 43 62 48 48 C 52 35 52 23 50 12 Z"
            fill={leafFill}
          />
          {/* Mitad Derecha con curva orgánica y silueta central S */}
          <path
            d="M 54 12 C 55 24 53 38 49 50 C 45 63 46 75 52 88 C 70 86 84 70 84 50 C 84 28 70 12 54 12 Z"
            fill={leafFill}
          />
        </svg>
      </div>

      {/* Marca Denominativa Tipográfica */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif tracking-tight leading-none ${titleSizes[size]} ${textColor}`}>
            {name}
          </span>
          {showSubtitle && (
            <span className={`tracking-[0.25em] font-sans font-bold uppercase mt-1 ${subSizes[size]} ${subColor}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
