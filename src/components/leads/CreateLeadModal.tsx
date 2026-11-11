'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Plus,
  UserPlus,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { Contact, LeadStage, LeadPriority, LeadWithContact } from '@/types/crm';
import { ORDERED_STAGES, STAGE_CONFIGS, PRIORITY_CONFIGS } from '@/styles/theme';
import { createLead } from '@/actions/leads';
import { createContact } from '@/actions/contacts';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onLeadCreated?: (lead: LeadWithContact) => void;
}

export default function CreateLeadModal({
  isOpen,
  onClose,
  contacts: initialContacts,
  onLeadCreated,
}: CreateLeadModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode: existing contact vs inline new contact
  const [isCreatingNewContact, setIsCreatingNewContact] = useState(
    initialContacts.length === 0
  );

  // Form Lead State
  const [title, setTitle] = useState('');
  const [value, setValue] = useState<number>(50000);
  const [currency, setCurrency] = useState('USD');
  const [stage, setStage] = useState<LeadStage>('NEW');
  const [priority, setPriority] = useState<LeadPriority>('MEDIUM');
  const [contactId, setContactId] = useState<string>(
    initialContacts[0]?.id || ''
  );
  const [notes, setNotes] = useState('');

  // Form New Contact State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');

  // Feedback & Validation Errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Keep contactId updated if initialContacts changes
  useEffect(() => {
    if (!contactId && initialContacts.length > 0) {
      setContactId(initialContacts[0].id);
    }
  }, [initialContacts, contactId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      let resolvedContactId = contactId;

      // Step 1: If inline contact creation is active, create contact first
      if (isCreatingNewContact) {
        if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim()) {
          setErrorMessage('Por favor completa el nombre, apellido y correo del contacto.');
          return;
        }

        const contactRes = await createContact({
          firstName: newFirstName.trim(),
          lastName: newLastName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim() || null,
          company: newCompany.trim() || null,
        });

        if (!contactRes.success || !contactRes.data) {
          setErrorMessage(
            contactRes.error || 'No se pudo crear el contacto en este inquilino.'
          );
          if (contactRes.validationErrors) {
            setFieldErrors(contactRes.validationErrors);
          }
          return;
        }

        resolvedContactId = contactRes.data.id;
      }

      // Step 2: Validate selected contact
      if (!resolvedContactId) {
        setErrorMessage('Debes seleccionar o crear un contacto para el prospecto.');
        return;
      }

      // Step 3: Create Lead
      const leadRes = await createLead({
        title: title.trim(),
        value: Number(value) || 0,
        currency,
        stage,
        priority,
        contactId: resolvedContactId,
        notes: notes.trim() || null,
      });

      if (!leadRes.success || !leadRes.data) {
        setErrorMessage(
          leadRes.error || 'Error al guardar el prospecto en la base de datos.'
        );
        if (leadRes.validationErrors) {
          setFieldErrors(leadRes.validationErrors);
        }
        return;
      }

      // Reset and close
      if (onLeadCreated) {
        onLeadCreated(leadRes.data);
      }
      router.refresh();
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-bold text-slate-900">
                Nuevo Prospecto Comercial
              </h2>
              <p className="text-xs text-slate-500">
                Añade una oportunidad al embudo con aislamiento de inquilino
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Section: Opportunity Details */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Título de la Oportunidad / Inmueble *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Penthouse Torre Sky Reforma / Casa Campestre Lote 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
            {fieldErrors.title && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.title[0]}</p>
            )}
          </div>

          {/* Section: Value & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Valor Estimado *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
              >
                <option value="USD">USD - Dólares Americanos</option>
                <option value="MXN">MXN - Pesos Mexicanos</option>
                <option value="EUR">EUR - Euros</option>
                <option value="COP">COP - Pesos Colombianos</option>
              </select>
            </div>
          </div>

          {/* Section: Stage & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Etapa Inicial en Embudo
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
              >
                {ORDERED_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_CONFIGS[s].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente 🔥</option>
              </select>
            </div>
          </div>

          {/* Section: Contact Association (Selector vs Fast Inline Creation) */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                Contacto Asociado
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingNewContact(!isCreatingNewContact)}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1"
              >
                {isCreatingNewContact
                  ? '← Elegir contacto existente'
                  : '+ Crear nuevo contacto rápido'}
              </button>
            </div>

            {!isCreatingNewContact ? (
              <div>
                {initialContacts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No existen contactos registrados en este inquilino.{' '}
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewContact(true)}
                      className="text-indigo-600 font-semibold underline"
                    >
                      Crea uno aquí.
                    </button>
                  </p>
                ) : (
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  >
                    {initialContacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.email})
                        {c.company ? ` - ${c.company}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              /* Inline Fast Contact Fields */
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre *"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      required={isCreatingNewContact}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Apellido *"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      required={isCreatingNewContact}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Correo Electrónico *"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    required={isCreatingNewContact}
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono / WhatsApp"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Empresa u Organización (Opcional)"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}
          </div>

          {/* Section: Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Notas y Requerimientos Clave
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre zona de interés, presupuesto máximo, requerimientos crediticios..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 active:scale-95"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Crear Prospecto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
