'use client';

import { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Download,
  AlertCircle,
  Building,
} from 'lucide-react';
import { signBrokerageAgreementAction } from '@/actions/legal';
import type { PropertyWithMedia, ExclusivityType, BrokerageAgreement } from '@/types/crm';

interface BrokerageAgreementModalProps {
  property: PropertyWithMedia;
  isOpen: boolean;
  onClose: () => void;
  existingAgreement?: BrokerageAgreement | null;
}

export function BrokerageAgreementModal({
  property,
  isOpen,
  onClose,
  existingAgreement,
}: BrokerageAgreementModalProps) {
  const [exclusivityType, setExclusivityType] = useState<ExclusivityType>(
    existingAgreement?.exclusivityType || 'EXCLUSIVE'
  );
  const [signerName, setSignerName] = useState(existingAgreement?.signerName || 'Juan Afiliado');
  const [signerEmail, setSignerEmail] = useState(
    existingAgreement?.signerEmail || 'afiliado@metropolis.com'
  );
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedAgreement, setSignedAgreement] = useState<BrokerageAgreement | null>(
    existingAgreement || null
  );
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const commissionPct = exclusivityType === 'EXCLUSIVE' ? 35 : 25;
  const estimatedEarn = ((property.price * (exclusivityType === 'EXCLUSIVE' ? 0.06 : 0.05)) * commissionPct) / 100;

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMessage('Debes aceptar los términos y condiciones del convenio.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await signBrokerageAgreementAction(
      property.id,
      exclusivityType,
      signerName,
      signerEmail
    );

    setLoading(false);

    if (res.success && res.data) {
      setSignedAgreement(res.data);
    } else {
      setErrorMessage(res.error || 'Ocurrió un error al firmar el convenio.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4" />
          <span>Protección Legal Inmobiliaria</span>
        </div>

        <h2 className="mt-1 text-xl font-black text-slate-900">
          Convenio Digital de Comisión Protegida
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Inmueble: <strong>{property.title}</strong> (Precio: ${property.price.toLocaleString('es-MX')} {property.currency})
        </p>

        {signedAgreement ? (
          /* Agreement Confirmed View */
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl bg-emerald-50 p-6 border border-emerald-200 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h3 className="mt-2 text-base font-bold text-emerald-950">
                Convenio Firmado y Blindado con Éxito
              </h3>
              <p className="mt-1 text-xs text-emerald-800">
                Tu derecho a la comisión del{' '}
                <strong>{signedAgreement.captadorCommissionPct}%</strong> está legalmente protegido bajo el folio inalterable:
              </p>
              <div className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-mono font-black text-emerald-900 border border-emerald-300 shadow-sm">
                FOLIO: {signedAgreement.folio}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 text-xs space-y-2 bg-slate-50">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Titular / Captador:</span>
                <span className="font-bold text-slate-900">{signedAgreement.signerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Modalidad:</span>
                <span className="font-bold text-slate-900">
                  {signedAgreement.exclusivityType === 'EXCLUSIVE' ? 'Exclusiva (35%)' : 'No Exclusiva (25%)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Fecha y Hora de Firma:</span>
                <span className="font-mono text-slate-900">
                  {new Date(signedAgreement.signedAt).toLocaleString('es-MX')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Sello IP de Registro:</span>
                <span className="font-mono text-slate-700">{signedAgreement.signerIp}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow hover:bg-slate-800 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Imprimir / Guardar Constancia PDF</span>
              </button>
            </div>
          </div>
        ) : (
          /* Agreement Signing Form */
          <form onSubmit={handleSign} className="mt-6 space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Choose Exclusivity Tier */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">
                Selecciona la modalidad de corretaje:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExclusivityType('EXCLUSIVE')}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    exclusivityType === 'EXCLUSIVE'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Exclusividad</span>
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
                      35% para ti
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Mayor impulso comercial en redes y portales. Ganancia estimada: <strong>${estimatedEarn.toLocaleString('es-MX')} MXN</strong>.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExclusivityType('NON_EXCLUSIVE')}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    exclusivityType === 'NON_EXCLUSIVE'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Sin Exclusividad</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-black text-white">
                      25% para ti
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Puedes promocionarla por tu cuenta. Ganancia estimada: <strong>${(((property.price * 0.05) * 25) / 100).toLocaleString('es-MX')} MXN</strong>.
                  </p>
                </button>
              </div>
            </div>

            {/* Signer Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Nombre del Titular *</label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Legal Clauses Preview */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-600 space-y-2 max-h-36 overflow-y-auto leading-relaxed">
              <p className="font-bold text-slate-800">
                EXTRACTO DEL CONTRATO DE MEDIACIÓN MERCANTIL Y COMISIÓN:
              </p>
              <p>
                1. <strong>Reconocimiento de Comisión:</strong> Metropolis Propiedades reconoce a favor de {signerName} el derecho inalienable a percibir el {commissionPct}% de los honorarios de corretaje que se liquiden al momento de formalizar en escritura pública o contrato de arrendamiento la operación de este inmueble.
              </p>
              <p>
                2. <strong>No Elusión:</strong> La agencia se compromete a no eludir ni excluir al captador en ninguna fase del trato, reportando en su CRM todo prospecto y oferta que se reciba.
              </p>
              <p>
                3. <strong>Dispersión:</strong> El pago se liquidará por transferencia electrónica SPEI a las 48 horas hábiles posteriores al cobro notarial de los honorarios.
              </p>
            </div>

            {/* Checkbox agreement */}
            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                He leído y acepto firmar digitalmente el presente convenio con pleno valor probatorio mercantil.
              </span>
            </label>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{loading ? 'Generando Folio...' : 'Firmar Convenio y Proteger Comisión'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
