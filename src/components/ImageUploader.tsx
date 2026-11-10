import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { compressImageToWebP } from '../utils/imageCompressor';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  storagePath?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  storagePath = 'products'
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [compressionStats, setCompressionStats] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    try {
      setError(null);
      setIsCompressing(true);

      const originalSizeKb = (file.size / 1024).toFixed(1);

      // Compresión local client-side con canvas a WebP (máx 800x800, calidad 0.8)
      const compressedBlob = await compressImageToWebP(file, 800, 800, 0.8);
      const compressedSizeKb = (compressedBlob.size / 1024).toFixed(1);

      setCompressionStats(`Original: ${originalSizeKb} KB ➔ WebP: ${compressedSizeKb} KB (-${Math.round((1 - compressedBlob.size / file.size) * 100)}%)`);

      // Mostrar preview inmediato
      const localPreview = URL.createObjectURL(compressedBlob);
      setPreviewUrl(localPreview);
      setIsCompressing(false);

      // Subida a Firebase Storage
      setIsUploading(true);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
      const fileRef = ref(storage, `${storagePath}/${fileName}`);

      await uploadBytes(fileRef, compressedBlob, {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000' // Cache optimizada de 1 año
      });

      const downloadUrl = await getDownloadURL(fileRef);
      onImageUploaded(downloadUrl);
      setIsUploading(false);
    } catch (err: any) {
      console.error('Error subiendo imagen:', err);
      setError(err?.message || 'Error al procesar y subir la imagen');
      setIsCompressing(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
          previewUrl ? 'border-orange-300 bg-orange-50/30' : 'border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-white'
        }`}
      >
        {previewUrl ? (
          <div className="relative group w-full flex flex-col items-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-36 h-36 object-cover rounded-lg shadow-sm border border-slate-200"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-xs font-medium">
              Cambiar imagen
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-slate-500">
            <UploadCloud className="w-10 h-10 text-orange-500 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-700">Arrastra una imagen o haz clic para subir</p>
            <p className="text-xs text-slate-400 mt-1">WebP automático • Máx 800x800px</p>
          </div>
        )}

        {(isCompressing || isUploading) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 text-orange-600 animate-spin" />
            <span className="text-xs font-semibold text-slate-700">
              {isCompressing ? 'Comprimiendo a WebP...' : 'Subiendo a Storage...'}
            </span>
          </div>
        )}
      </div>

      {compressionStats && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{compressionStats}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
