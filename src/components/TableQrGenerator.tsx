import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, Building2, ExternalLink, Sparkles } from 'lucide-react';

export const TableQrGenerator: React.FC = () => {
  const [startTable, setStartTable] = useState<number>(1);
  const [endTable, setEndTable] = useState<number>(10);
  const [zoneName, setZoneName] = useState<string>('Salón Principal');
  const [baseUrl, setBaseUrl] = useState<string>(
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://tudominio.com'
  );
  const [restaurantName, setRestaurantName] = useState<string>('SABOR & FUEGO');

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
      <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Generador de Códigos QR para Mesas</h2>
              <p className="text-xs text-slate-500">
                Genera tarjetas listas para colocar en las mesas con menú digital
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir o Exportar a PDF
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Restaurante</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ambiente / Zona</label>
            <input
              type="text"
              placeholder="Ej. Terraza, Barra, Salón"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rango de Mesas (Desde - Hasta)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={startTable}
                onChange={(e) => setStartTable(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
              <span className="text-slate-400 font-bold text-xs">-</span>
              <input
                type="number"
                min={startTable}
                value={endTable}
                onChange={(e) => setEndTable(Math.max(startTable, parseInt(e.target.value) || startTable))}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL Base del Menú</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Total de tarjetas a generar: <strong>{tables.length} mesas</strong></span>
          <span className="italic">💡 Sugerencia: En la ventana de impresión, selecciona destino "Guardar como PDF" y márgenes mínimos.</span>
        </div>
      </div>

      {/* Área Imprimible con estilo Minimalista */}
      <div id="printable-area" className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((tableNum) => {
            const tableUrl = `${baseUrl.replace(/\/$/, '')}/?table=${tableNum}`;

            return (
              <div
                key={tableNum}
                className="border-2 border-slate-900 rounded-2xl p-5 flex flex-col items-center justify-between text-center bg-white shadow-xs relative print-page-break"
                style={{ width: '100%', minHeight: '340px' }}
              >
                {/* Cabecera / Logotipo */}
                <div className="w-full border-b border-dashed border-slate-300 pb-3">
                  <div className="flex items-center justify-center gap-1.5 text-orange-600 font-extrabold tracking-wider text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{restaurantName.toUpperCase()}</span>
                  </div>
                  {zoneName && (
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {zoneName}
                    </span>
                  )}
                </div>

                {/* Número de Mesa */}
                <div className="my-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                    Mesa
                  </span>
                  <span className="text-4xl font-extrabold text-slate-900 leading-none">
                    #{tableNum}
                  </span>
                </div>

                {/* Código QR con qrcode.react */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <QRCodeSVG
                    value={tableUrl}
                    size={135}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Llamado a la acción (CTA) */}
                <div className="w-full pt-3 border-t border-dashed border-slate-300 mt-2">
                  <p className="text-xs font-bold text-slate-900">
                    Escanea para ver el menú digital
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate px-2">
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
