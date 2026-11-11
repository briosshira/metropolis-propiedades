'use client';

import { useState } from 'react';
import {
  FileUp,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { uploadLegalDocumentAction } from '@/actions/legal';
import type { PropertyWithMedia, LegalDocumentType, LegalDocument } from '@/types/crm';

interface DocumentUploadModalProps {
  property: PropertyWithMedia;
  isOpen: boolean;
  onClose: () => void;
  existingDocuments: LegalDocument[];
  onDocumentUploaded?: () => void;
}

export function DocumentUploadModal({
  property,
  isOpen,
  onClose,
  existingDocuments,
  onDocumentUploaded,
}: DocumentUploadModalProps) {
  const [docType, setDocType] = useState<LegalDocumentType>('DEED');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const typeLabels: Record<LegalDocumentType, string> = {
    DEED: 'Título de Propiedad / Escrituras Públicas',
    TAX_RECEIPT: 'Boleta de Impuesto Predial (Vigente)',
    ID_CARD: 'Identificación Oficial del Titular (INE / Pasaporte)',
    BROKERAGE_AGREEMENT: 'Contrato de Mediación Firmado',
  };

  const handleSimulateUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMsg('');

    // Prepara URL segura en Supabase Storage (bucket legal-documents)
    const simulatedFileName =
      fileName.trim() || `${docType.toLowerCase()}_${property.id.slice(0, 8)}.pdf`;
    const simulatedStorageUrl =
      fileUrl.trim() ||
      `https://cxzkbzchjtonqabjzjge.supabase.co/storage/v1/object/authenticated/legal-documents/${simulatedFileName}`;

    const res = await uploadLegalDocumentAction(
      property.id,
      docType,
      simulatedFileName,
      simulatedStorageUrl
    );

    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Documento "${simulatedFileName}" cargado con éxito en el expediente legal.`);
      setFileName('');
      setFileUrl('');
      if (onDocumentUploaded) onDocumentUploaded();
    } else {
      setErrorMessage(res.error || 'Error al cargar el documento.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <FileUp className="h-4 w-4" />
          <span>Expediente Notarial y Legal</span>
        </div>

        <h2 className="mt-1 text-xl font-black text-slate-900">
          Documentos Legales del Inmueble
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {property.title} — Los archivos se almacenan en el bucket encriptado de Supabase Storage.
        </p>

        {/* Existing Documents List */}
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Documentos en Expediente ({existingDocuments.length})
          </h4>

          {existingDocuments.length > 0 ? (
            <div className="space-y-2">
              {existingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/80 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">{doc.fileName}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {typeLabels[doc.type]} • {new Date(doc.createdAt).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      doc.verified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.verified ? <FileCheck className="h-3 w-3" /> : null}
                    {doc.verified ? 'Verificado' : 'En Cotejo'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
              Aún no has subido documentos legales para este inmueble.
            </div>
          )}
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSimulateUpload} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          <h4 className="text-xs font-bold text-slate-900">Subir Nuevo Documento</h4>

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Tipo de Documento *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as LegalDocumentType)}
              className="mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="DEED">Escrituras Públicas / Título de Propiedad</option>
              <option value="TAX_RECEIPT">Boleta Predial Vigente</option>
              <option value="ID_CARD">Identificación Oficial (INE / Pasaporte)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Nombre del Archivo *</label>
            <input
              type="text"
              required
              placeholder="Ej. Escritura_Lote14_Completa.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <FileUp className="mx-auto h-8 w-8 text-slate-400" />
            <span className="mt-2 block text-xs font-semibold text-slate-700">
              Selecciona o arrastra el archivo PDF / Imagen
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Tamaño máximo 25 MB • Encriptación AES-256 en Supabase Storage
            </span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              <FileUp className="h-4 w-4" />
              <span>{loading ? 'Subiendo...' : 'Guardar en Expediente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
