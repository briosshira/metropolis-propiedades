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
import { FileUpload, type UploadedFileItem } from '@/components/ui/FileUpload';
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

  const handleUploadComplete = async (uploadedFiles: UploadedFileItem[]) => {
    if (uploadedFiles.length === 0) return;
    const latestFile = uploadedFiles[uploadedFiles.length - 1];

    setLoading(true);
    setErrorMessage('');
    setSuccessMsg('');

    try {
      const res = await uploadLegalDocumentAction(
        property.id,
        docType,
        latestFile.name,
        latestFile.url
      );

      setLoading(false);

      if (res.success) {
        setSuccessMsg(`Documento "${latestFile.name}" guardado exitosamente en el expediente notarial.`);
        if (onDocumentUploaded) onDocumentUploaded();
      } else {
        setErrorMessage(res.error || 'Error al vincular el documento con el expediente.');
      }
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setErrorMessage(msg);
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
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
        <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          <h4 className="text-xs font-bold text-slate-900">Subir Nuevo Documento al Expediente</h4>

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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Documento a Cargar *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as LegalDocumentType)}
              className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="DEED">Escrituras Públicas / Título de Propiedad</option>
              <option value="TAX_RECEIPT">Boleta Predial Vigente</option>
              <option value="ID_CARD">Identificación Oficial (INE / Pasaporte)</option>
              <option value="BROKERAGE_AGREEMENT">Convenio de Mediación Mercantil Firmado</option>
            </select>
          </div>

          <FileUpload
            bucket="legal-documents"
            folder={`property_${property.id.slice(0, 8)}`}
            accept="application/pdf,image/jpeg,image/png"
            maxFiles={1}
            maxSizeMB={15}
            title={`Arrastra o selecciona el archivo para: ${typeLabels[docType]}`}
            subtitle="Admite archivos PDF o imágenes (JPG, PNG) de hasta 15MB protegidos con encriptación"
            onUploadSuccess={handleUploadComplete}
          />

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Finalizar y Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
