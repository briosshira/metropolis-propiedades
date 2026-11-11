'use client';

import { useState } from 'react';
import { Calendar, Clock, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { bookPropertyVisitAction } from '@/actions/inquiries';
import type { PropertyWithMedia } from '@/types/crm';

interface VisitSchedulerModalProps {
  property: PropertyWithMedia;
  isOpen: boolean;
  onClose: () => void;
}

export function VisitSchedulerModal({ property, isOpen, onClose }: VisitSchedulerModalProps) {
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setErrorMessage('Por favor selecciona fecha y hora.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Combine date and time to ISO string
    const scheduledDateTime = new Date(`${date}T${time}:00`).toISOString();

    const res = await bookPropertyVisitAction({
      propertyId: property.id,
      visitorName,
      visitorPhone,
      visitorEmail: visitorEmail.trim() || undefined,
      scheduledAt: scheduledDateTime,
      notes: notes.trim() || undefined,
    });

    if (res.success && res.data) {
      setStatus('success');
      if (res.data.whatsappRedirectUrl) {
        setWhatsappUrl(res.data.whatsappRedirectUrl);
      }
    } else {
      setStatus('error');
      setErrorMessage(res.error || 'Ocurrió un error al agendar la cita.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
          <Calendar className="h-4 w-4" />
          <span>Agenda tu Visita</span>
        </div>

        <h3 className="mt-1 text-lg font-extrabold text-slate-900">
          Visitar {property.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Un asesor de nuestro equipo te acompañará en el recorrido del inmueble.
        </p>

        {status === 'success' ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-200">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h4 className="mt-3 text-base font-bold text-emerald-900">¡Visita Agendada con Éxito!</h4>
            <p className="mt-2 text-xs text-emerald-700 leading-relaxed">
              Hemos registrado tu cita en el CRM para el <strong>{date} a las {time}</strong>. Se ha despachado la notificación automática al asesor.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
                >
                  <span>Abrir WhatsApp con Asesor</span>
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Fecha preferida *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Hora aproximada *</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Nombre completo *</label>
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Ej. Roberto Mendoza"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="55 1234 5678"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Correo electrónico</label>
                <input
                  type="email"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="opcional@correo.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Comentarios o dudas específicas</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Irás con tu arquitecto o familia? ¿Deseas ver planos?"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-2/3 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                {status === 'loading' ? 'Confirmando...' : 'Confirmar Cita'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
