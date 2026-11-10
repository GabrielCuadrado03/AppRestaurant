import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BrandLogo } from './common/BrandLogo';
import { QrCode, Printer, Sparkles } from 'lucide-react';

export const TableQrGenerator: React.FC = () => {
  const [startTable, setStartTable] = useState<number>(1);
  const [endTable, setEndTable] = useState<number>(12);
  const [zoneName, setZoneName] = useState<string>('Terraza Botánica');
  const [baseUrl, setBaseUrl] = useState<string>(
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://tudominio.com'
  );
  const [restaurantName, setRestaurantName] = useState<string>('ORIGEN & BISTRO');

  // Generar lista de mesas en base al rango
  const tables = Array.from(
    { length: Math.max(0, endTable - startTable + 1) },
    (_, idx) => startTable + idx
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Panel de Configuración (oculto en impresión) */}
      <div className="no-print bg-white rounded-3xl shadow-sm border border-[#DCD7CD] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#033225]/10 text-[#033225] rounded-2xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#020202]">Generador de Tarjetas QR para Mesas</h2>
              <p className="text-xs text-[#675F52]">
                Diseño editorial minimalista listo para soportes de mesa, acrílico o madera
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-[#DCD7CD] bg-[#033225] hover:bg-[#02241A] rounded-xl transition shadow-md cursor-pointer border border-[#DCD7CD]/20"
          >
            <Printer className="w-4 h-4" />
            Imprimir o Exportar a PDF
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#F7F5F0] rounded-2xl border border-[#DCD7CD]">
          <div>
            <label className="block text-xs font-bold text-[#675F52] mb-1">Nombre Comercial</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#DCD7CD] rounded-xl focus:ring-2 focus:ring-[#033225] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#675F52] mb-1">Ambiente / Zona</label>
            <input
              type="text"
              placeholder="Ej. Salón Principal, Terraza..."
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#DCD7CD] rounded-xl focus:ring-2 focus:ring-[#033225] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#675F52] mb-1">Rango de Mesas</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={startTable}
                onChange={(e) => setStartTable(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs px-3 py-2 bg-white border border-[#DCD7CD] rounded-xl focus:ring-2 focus:ring-[#033225] focus:outline-hidden text-center"
              />
              <span className="text-[#877E6F] font-bold text-xs">-</span>
              <input
                type="number"
                min={startTable}
                value={endTable}
                onChange={(e) => setEndTable(Math.max(startTable, parseInt(e.target.value) || startTable))}
                className="w-full text-xs px-3 py-2 bg-white border border-[#DCD7CD] rounded-xl focus:ring-2 focus:ring-[#033225] focus:outline-hidden text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#675F52] mb-1">URL Base del Menú</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#DCD7CD] rounded-xl focus:ring-2 focus:ring-[#033225] focus:outline-hidden font-mono"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[#877E6F]">
          <span>Total de tarjetas a generar: <strong>{tables.length} mesas</strong></span>
          <span className="italic">💡 Sugerencia: En la ventana de impresión, selecciona 'Guardar como PDF' y fondo de página activo.</span>
        </div>
      </div>

      {/* Área Imprimible con estilo Editorial Minimalista */}
      <div id="printable-area" className="bg-[#F7F5F0] p-4 sm:p-6 rounded-3xl shadow-sm border border-[#DCD7CD]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((tableNum) => {
            const tableUrl = `${baseUrl.replace(/\/$/, '')}/?table=${tableNum}`;

            return (
              <div
                key={tableNum}
                className="border-2 border-[#033225] rounded-[2rem] p-6 flex flex-col items-center justify-between text-center bg-white shadow-sm relative print-page-break"
                style={{ width: '100%', minHeight: '380px' }}
              >
                {/* Cabecera con Isotipo de Marca */}
                <div className="w-full border-b border-[#DCD7CD] pb-4 flex flex-col items-center">
                  <BrandLogo
                    size="md"
                    variant="beige-on-green"
                    name={restaurantName}
                    subtitle={zoneName}
                  />
                </div>

                {/* Número de Mesa */}
                <div className="my-3">
                  <span className="text-[10px] font-sans font-bold text-[#877E6F] tracking-[0.3em] uppercase block">
                    Mesa de Sala
                  </span>
                  <span className="text-5xl font-serif font-black text-[#033225] leading-none block mt-1">
                    #{tableNum}
                  </span>
                </div>

                {/* Código QR con qrcode.react */}
                <div className="p-3 bg-white border-2 border-[#033225]/15 rounded-2xl shadow-xs">
                  <QRCodeSVG
                    value={tableUrl}
                    size={140}
                    level="H"
                    includeMargin={false}
                    fgColor="#033225"
                  />
                </div>

                {/* Llamado a la acción (CTA) */}
                <div className="w-full pt-4 border-t border-[#DCD7CD] mt-3">
                  <p className="text-xs font-serif font-bold text-[#020202] tracking-tight">
                    Escanea para ver la carta digital
                  </p>
                  <p className="text-[9px] text-[#877E6F] mt-1 font-mono tracking-wider truncate px-2">
                    {tableUrl}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
