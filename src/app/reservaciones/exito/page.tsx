import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
  ArrowLeft,
  MessageCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { Navbar } from '@/components/portal/Navbar';
import { PrintButton } from '@/components/portal/PrintButton';
import { getReservationByFolioAction } from '@/actions/reservations';

interface ReservationSuccessPageProps {
  searchParams: Promise<{
    folio?: string;
    session_id?: string;
  }>;
}

export default async function ReservationSuccessPage({
  searchParams,
}: ReservationSuccessPageProps) {
  const { folio, session_id } = await searchParams;
  const lookupKey = folio || session_id;

  if (!lookupKey) {
    notFound();
  }

  const result = await getReservationByFolioAction(lookupKey);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Apartado Procesado</h1>
            <p className="text-sm text-slate-600">
              Tu solicitud de apartado con folio <strong>{lookupKey}</strong> ha sido registrada. Nuestro equipo de asesores se pondrá en contacto contigo en breve para formalizar la firma de contrato.
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Catálogo</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const reservation = result.data;
  const expiresDate = new Date(reservation.expiresAt).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Acabo de realizar el apartado del inmueble "${reservation.propertyTitle}" con el Folio Oficial ${reservation.folio}. Mi nombre es ${reservation.clientName}. Me comunico para coordinar la revisión documental y firma de contrato de compraventa.`
  );
  const whatsappUrl = `https://wa.me/5214421234567?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 sm:px-6">
        {/* Top Success Banner */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-600/20 mb-2">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ¡Inmueble Apartado Exitosamente!
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Hemos congelado la propiedad en el catálogo para garantizar tu prioridad de compra por las próximas 72 horas.
          </p>
        </div>

        {/* Printable Official Receipt Card */}
        <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Card Header & Folio */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Comprobante Oficial de Depósito de Garantía
              </span>
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                {reservation.propertyTitle}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block">
                Folio Único
              </span>
              <span className="text-xl font-mono font-black text-slate-900">
                {reservation.folio}
              </span>
            </div>
          </div>

          {/* Amount and Expiration Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Monto Depositado
              </span>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">
                ${reservation.amount.toLocaleString('es-MX')} {reservation.currency}
              </p>
              <span className="text-[11px] text-emerald-600">
                Método: {reservation.paymentMethod === 'STRIPE_CARD' ? 'Tarjeta Bancaria (Stripe)' : reservation.paymentMethod === 'SPEI' ? 'Transferencia SPEI' : 'Simulación de Demostración'}
              </span>
            </div>

            <div className="rounded-2xl bg-amber-50/70 border border-amber-100 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>Apartado Vigente Hasta</span>
              </div>
              <p className="text-sm font-bold text-amber-950 mt-1 capitalize leading-snug">
                {expiresDate}
              </p>
              <span className="text-[11px] text-amber-700">
                Plazo de 72 horas para formalización de contrato
              </span>
            </div>
          </div>

          {/* Client Details */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Datos del Titular del Apartado
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Titular / Comprador</span>
                <strong className="text-slate-800">{reservation.clientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Correo Electrónico</span>
                <strong className="text-slate-800">{reservation.clientEmail}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Teléfono / WhatsApp</span>
                <strong className="text-slate-800">{reservation.clientPhone}</strong>
              </div>
            </div>
          </div>

          {/* Legal Warranties */}
          <div className="border-t border-slate-100 pt-5 space-y-2 text-xs text-slate-500 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Términos y Condiciones del Apartado Mercantil:</span>
            </div>
            <p>
              1. El presente depósito de garantía congela la propiedad e impide su comercialización a terceros durante el plazo estipulado.
            </p>
            <p>
              2. El monto total será deducido íntegramente del enganche o pago inicial estipulado en el contrato de compraventa definitivo.
            </p>
            <p>
              3. Metropolis Propiedades garantiza el 100% de reembolso del depósito si el inmueble presentase algún gravamen o impedimento registral.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <PrintButton label="Imprimir / Descargar Recibo PDF" />

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contactar Asesor por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Catálogo de Propiedades</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
