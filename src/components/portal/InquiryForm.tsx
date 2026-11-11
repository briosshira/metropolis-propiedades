'use client';

import { useState } from 'react';
import { MessageCircle, Send, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import { submitPublicInquiryAction } from '@/actions/inquiries';
import { siteConfig } from '@/config/site';
import type { PropertyWithMedia } from '@/types/crm';

interface InquiryFormProps {
  property: PropertyWithMedia;
  onOpenScheduler?: () => void;
}

export function InquiryForm({ property, onOpenScheduler }: InquiryFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    `Hola, me interesa recibir más información sobre "${property.title}" (${property.city}). ¿Sigue disponible?`
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // WhatsApp click handler with automatic CRM lead tracking
  const handleWhatsAppClick = async () => {
    // Lead capture tracking in CRM
    try {
      await submitPublicInquiryAction({
        propertyId: property.id,
        name: name.trim() || 'Interesado WhatsApp',
        phone: phone.trim() || 'Por definir vía chat',
        email: email.trim() || undefined,
        message: `Contacto directo vía WhatsApp para la propiedad: ${property.title}`,
        channel: 'WHATSAPP',
      });
    } catch {
      // Non-blocking for WhatsApp redirect
    }

    // Prefilled WhatsApp message
    const waText = encodeURIComponent(
      `Hola, vi en el portal ${siteConfig.name} la propiedad "${property.title}" (Ref: ${property.id.slice(0, 8)}) en ${property.city} con precio de $${property.price.toLocaleString('es-MX')} ${property.currency}. Me gustaría recibir informes y agendar visita.`
    );
    // WhatsApp number from centralized siteConfig
    const waPhone = siteConfig.whatsapp.number;
    window.open(`https://wa.me/${waPhone}?text=${waText}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const res = await submitPublicInquiryAction({
      propertyId: property.id,
      name,
      phone,
      email: email.trim() || undefined,
      message,
      channel: 'FORM',
    });

    if (res.success) {
      setStatus('success');
      setName('');
      setPhone('');
      setEmail('');
    } else {
      setStatus('error');
      setErrorMessage(res.error || 'Ocurrió un error al enviar tu solicitud.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-100">
      <h3 className="text-base font-bold text-slate-900">¿Te interesa este inmueble?</h3>
      <p className="mt-1 text-xs text-slate-500">
        Comunícate de inmediato con nuestro asesor a cargo o solicita que te contactemos.
      </p>

      {/* Primary WhatsApp Direct CTA */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-colors active:scale-95"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Contactar por WhatsApp</span>
        </button>
        <span className="mt-1 block text-center text-[11px] text-slate-400">
          Respuesta promedio en menos de 5 minutos
        </span>
      </div>

      {onOpenScheduler && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={onOpenScheduler}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50/50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            📅 Agendar Visita Presencial
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-slate-400">O envíanos un mensaje</span>
        </div>
      </div>

      {/* Success Notification */}
      {status === 'success' ? (
        <div className="rounded-xl bg-emerald-50 p-4 text-center text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
          <h4 className="mt-2 text-sm font-bold">¡Solicitud recibida!</h4>
          <p className="mt-1 text-xs text-emerald-700">
            Un asesor especializado te llamará o escribirá a la brevedad.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-3 text-xs font-semibold underline text-emerald-900"
          >
            Enviar otra consulta
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {status === 'error' && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Nombre completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Teléfono / WhatsApp *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. +52 55 1234 5678"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Correo (opcional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@correo.com"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Mensaje</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{status === 'loading' ? 'Enviando...' : 'Solicitar Información'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
