'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface UploadedFileItem {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  bucket: 'properties-media' | 'legal-documents';
  folder?: string;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  onUploadSuccess: (files: UploadedFileItem[]) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function FileUpload({
  bucket,
  folder = '',
  accept = 'image/*',
  maxFiles = 10,
  maxSizeMB = 10,
  onUploadSuccess,
  title = 'Carga tus archivos',
  subtitle = 'Arrastra y suelta tus archivos aquí o haz clic para explorar',
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFilesCount, setTotalFilesCount] = useState(0);
  const [uploadedItems, setUploadedItems] = useState<UploadedFileItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setErrorMessage(null);

    if (files.length + uploadedItems.length > maxFiles) {
      setErrorMessage(`El límite máximo es de ${maxFiles} archivos.`);
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    for (const f of files) {
      if (f.size > maxSizeBytes) {
        setErrorMessage(`El archivo "${f.name}" supera el tamaño máximo de ${maxSizeMB}MB.`);
        return;
      }
    }

    setUploading(true);
    setProgress(5);
    setTotalFilesCount(files.length);

    const newlyUploaded: UploadedFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFileIndex(i + 1);

      // Sanitizar nombre de archivo y agregar timestamp único
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 32);
      const uniquePath = folder
        ? `${folder.replace(/\/$/, '')}/${Date.now()}_${cleanName}.${extension}`
        : `${Date.now()}_${cleanName}.${extension}`;

      try {
        const { error } = await supabase.storage
          .from(bucket)
          .upload(uniquePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          throw new Error(error.message);
        }

        // Obtener URL del archivo
        let publicOrStorageUrl = '';
        if (bucket === 'properties-media') {
          const { data } = supabase.storage.from(bucket).getPublicUrl(uniquePath);
          publicOrStorageUrl = data.publicUrl;
        } else {
          // Documentos legales privados
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cxzkbzchjtonqabjzjge.supabase.co';
          publicOrStorageUrl = `${supabaseUrl}/storage/v1/object/authenticated/${bucket}/${uniquePath}`;
        }

        const item: UploadedFileItem = {
          name: file.name,
          url: publicOrStorageUrl,
          size: file.size,
          type: file.type,
        };

        newlyUploaded.push(item);
        const percent = Math.round(((i + 1) / files.length) * 100);
        setProgress(percent);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al subir archivo';
        setErrorMessage(`Error subiendo ${file.name}: ${msg}`);
        setUploading(false);
        return;
      }
    }

    const allItems = [...uploadedItems, ...newlyUploaded];
    setUploadedItems(allItems);
    onUploadSuccess(allItems);
    setUploading(false);
    setProgress(100);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveItem = (index: number) => {
    const updated = uploadedItems.filter((_, i) => i !== index);
    setUploadedItems(updated);
    onUploadSuccess(updated);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Dropzone container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm mb-3">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>

        <p className="text-xs sm:text-sm font-bold text-slate-800 text-center">{title}</p>
        <p className="mt-1 text-[11px] text-slate-500 text-center max-w-sm">{subtitle}</p>
        <span className="mt-2 text-[10px] text-slate-400">
          Máximo {maxSizeMB}MB por archivo • Formatos admitidos: {accept.replace(/\/\*/g, '')}
        </span>
      </div>

      {/* Uploading progress bar */}
      {uploading && (
        <div className="rounded-xl bg-white p-3.5 border border-emerald-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
              Subiendo archivo {currentFileIndex} de {totalFilesCount}...
            </span>
            <span className="font-bold text-emerald-600">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Uploaded items grid */}
      {uploadedItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {uploadedItems.map((item, idx) => {
            const isImage = item.type.startsWith('image/') || item.url.match(/\.(jpeg|jpg|png|webp|avif)/i);
            return (
              <div
                key={idx}
                className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                {isImage ? (
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-slate-50 flex flex-col items-center justify-center p-3 text-center">
                    <FileText className="h-8 w-8 text-emerald-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 line-clamp-1">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {(item.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-red-600 transition-all shadow-sm"
                  title="Eliminar archivo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div className="p-1.5 bg-white border-t border-slate-100 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="text-[10px] text-slate-600 truncate">{item.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
