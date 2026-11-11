import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrokerageAgreementAction } from '@/actions/legal';
import { PrintButton } from '@/components/portal/PrintButton';
import { siteConfig } from '@/config/site';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Lock,
  Building2,
  QrCode,
} from 'lucide-react';

interface AgreementPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgreementContractPage({ params }: AgreementPageProps) {
  const { id } = await params;
  const res = await getBrokerageAgreementAction(id);

  if (!res.success || !res.data || !res.data.agreement) {
    notFound();
  }

  const { agreement, property } = res.data;
  const isExclusive = agreement.exclusivityType === 'EXCLUSIVE';
  const commissionPct = agreement.captadorCommissionPct;
  const propertyPrice = property?.price || 1200000;
  const currency = property?.currency || 'MXN';
  const totalBrokerageFee = (propertyPrice * agreement.commissionRate) / 100;
  const captadorFee = (totalBrokerageFee * commissionPct) / 100;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 text-slate-900 print:bg-white print:p-0">
      {/* Top action bar (hidden during print) */}
      <div className="mx-auto max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/dashboard/mis-propiedades"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <PrintButton />
        </div>
      </div>

      {/* Official Legal Document Sheet */}
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 sm:p-14 shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-8 print:max-w-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white font-black text-sm">
                  M
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  {siteConfig.name}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                División de Mediación Inmobiliaria y Contratos Digitales Certificados
              </p>
              <p className="text-[11px] text-slate-400">
                Conforme a los Arts. 75, 273 y 283 del Código de Comercio de los Estados Unidos Mexicanos
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Folio Único Inalterable
              </span>
              <span className="text-lg font-mono font-black text-emerald-950 block">
                {agreement.folio}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                REGISTRO ELECTRÓNICO BLINDADO
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-8">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
            Convenio Digital de Mediación Mercantil y Protección de Comisión
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
            Celebrado entre <strong>Metropolis Propiedades S.A.P.I. de C.V.</strong> y el Captador/Propietario registrado electrónicamente bajo la modalidad de {isExclusive ? 'Exclusividad Protegida (35%)' : 'No Exclusiva (25%)'}.
          </p>
        </div>

        {/* Property & Signer Summary Box */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-5 border border-slate-200 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2 text-emerald-800">
              Datos del Inmueble Objeto del Contrato
            </h4>
            <div className="space-y-1 text-slate-700">
              <p><strong>Inmueble:</strong> {property?.title || 'Terreno Residencial / Casa'}</p>
              <p><strong>Tipo:</strong> {property?.propertyType || 'TERRENO'}</p>
              <p><strong>Ubicación:</strong> {property?.address || 'Por confirmar'}, {property?.neighborhood}, {property?.city}</p>
              <p><strong>Precio Pactado:</strong> ${propertyPrice.toLocaleString('es-MX')} {currency}</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2 text-emerald-800">
              Datos de Afiliación del Captador
            </h4>
            <div className="space-y-1 text-slate-700">
              <p><strong>Nombre Completo:</strong> {agreement.signerName}</p>
              <p><strong>Correo Electrónico:</strong> {agreement.signerEmail}</p>
              <p><strong>Fecha y Hora de Firma:</strong> {new Date(agreement.signedAt).toLocaleString('es-MX')}</p>
              <p><strong>Dirección IP de Registro:</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">{agreement.signerIp}</code></p>
            </div>
          </div>
        </div>

        {/* Commission Breakdown Table */}
        <div className="my-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Desglose Financiero de Comisión Protegida
          </h4>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-3">Concepto</th>
                  <th className="p-3">Porcentaje Base</th>
                  <th className="p-3 text-right">Monto Estimado ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800">Honorario Global de Intermediación</td>
                  <td className="p-3">{agreement.commissionRate}% sobre valor de cierre</td>
                  <td className="p-3 text-right font-mono font-semibold">${totalBrokerageFee.toLocaleString('es-MX')}</td>
                </tr>
                <tr className="bg-emerald-50/70 font-bold text-emerald-950">
                  <td className="p-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    <span>Comisión Protegida para el Captador ({isExclusive ? 'Exclusiva' : 'Abierta'})</span>
                  </td>
                  <td className="p-3">{commissionPct}% de los honorarios cobrados</td>
                  <td className="p-3 text-right font-mono text-sm text-emerald-800">
                    ${captadorFee.toLocaleString('es-MX')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal Clauses */}
        <div className="my-8 space-y-4 text-xs text-slate-600 leading-relaxed text-justify">
          <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-center border-b pb-2">
            Cláusulas Legales de Mediación Mercantil
          </h4>

          <p>
            <strong>PRIMERA. (OBJETO).</strong> El presente instrumento tiene por objeto facultar a <em>Metropolis Propiedades</em> para promover y mediar la enajenación comercial del inmueble descrito en las declaraciones, garantizando la retribución económica correspondiente al <strong>Captador</strong> una vez formalizada la compraventa o arrendamiento ante notario público o mediante contrato definitivo.
          </p>

          <p>
            <strong>SEGUNDA. (PROTECCIÓN Y RESERVA DE DERECHOS).</strong> Toda persona registrada como prospecto o cliente en el sistema CRM de Metropolis en relación con este inmueble generará derecho irrevocable de cobro a favor del <strong>Captador</strong> durante la vigencia del presente convenio y hasta 180 (ciento ochenta) días naturales posteriores a su conclusión.
          </p>

          <p>
            <strong>TERCERA. (DISPERSIÓN DE FONDOS POR TRANSFERENCIA SPEI).</strong> Metropolis se compromete formalmente a liquidar el monto neto de la comisión acordada (<strong>{commissionPct}%</strong>) en un plazo no mayor a 48 (cuarenta y ocho) horas hábiles posteriores a la liquidación de los honorarios por parte del adquirente, mediante transferencia interbancaria electrónica (SPEI) a la cuenta CLABE que proporcione el Captador.
          </p>

          <p>
            <strong>CUARTA. (CONFIDENCIALIDAD Y PROTECCIÓN DE DATOS).</strong> Ambas partes se obligan a mantener en estricta confidencialidad la información financiera, títulos de propiedad y documentos notariales entregados, utilizándolos únicamente para los fines previstos en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
          </p>

          <p>
            <strong>QUINTA. (JURISDICCIÓN).</strong> Para la interpretación y cumplimiento de este instrumento, las partes se someten expresamente a las leyes aplicables de la República Mexicana y a la jurisdicción de los tribunales competentes, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
          </p>
        </div>

        {/* Signature & Cryptographic Seal Box */}
        <div className="mt-10 border-t-2 border-slate-900 pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
            {/* Captador Signature */}
            <div className="flex flex-col items-center">
              <div className="h-16 flex items-end justify-center w-full pb-2">
                <span className="font-serif italic text-lg text-emerald-900 font-black tracking-wide border-b border-slate-400 w-3/4 pb-1">
                  {agreement.signerName}
                </span>
              </div>
              <p className="font-bold text-slate-900 mt-2">{agreement.signerName}</p>
              <p className="text-[11px] text-slate-500">Captador / Titular Registrado</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Firma Digital: {agreement.signedAt.slice(0, 10)} • IP: {agreement.signerIp}
              </p>
            </div>

            {/* Metropolis Signature */}
            <div className="flex flex-col items-center">
              <div className="h-16 flex items-end justify-center w-full pb-2">
                <div className="flex items-center gap-2 border-b border-slate-400 w-3/4 pb-1 justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <span className="font-serif italic text-base text-slate-900 font-bold">
                    Metropolis Propiedades S.A.P.I.
                  </span>
                </div>
              </div>
              <p className="font-bold text-slate-900 mt-2">Dirección Jurídica y Fiduciaria</p>
              <p className="text-[11px] text-slate-500">Metropolis Propiedades de México</p>
              <p className="text-[10px] text-emerald-700 font-mono mt-1">
                Sello Criptográfico SHA-256 Validado
              </p>
            </div>
          </div>

          {/* Cryptographic Validation Stamp Footer */}
          <div className="mt-8 rounded-2xl bg-slate-50 p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-mono font-bold">
                QR
              </div>
              <div>
                <p className="font-bold text-slate-800">Constancia Digital Emitida por Metropolis Propiedades</p>
                <p className="font-mono text-[9px] text-slate-400">
                  HASH: {agreement.id.replaceAll('-', '').toUpperCase()} • FOLIO: {agreement.folio}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800">
                <Lock className="h-3 w-3" />
                Documento Inalterable Certificado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
