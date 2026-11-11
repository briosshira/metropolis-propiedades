/**
 * Notification Service for Metropolis Propiedades
 * Handles automated WhatsApp alert formatting, Webhook dispatch, and Email notifications.
 */

import { siteConfig } from '@/config/site';

export interface LeadNotificationPayload {
  leadId: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertyCurrency?: string;
  propertySlug?: string;
  source?: string;
}

export interface VisitNotificationPayload {
  visitId: string;
  leadName: string;
  leadPhone: string;
  leadEmail?: string;
  propertyTitle: string;
  propertyAddress: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  notes?: string;
}

/**
 * Genera el enlace oficial de WhatsApp con el mensaje pre-cargado para notificar al asesor o administrador.
 */
export function buildWhatsAppLeadNotificationUrl(payload: LeadNotificationPayload): string {
  const priceFormatted = payload.propertyPrice
    ? `$${payload.propertyPrice.toLocaleString('es-MX')} ${payload.propertyCurrency || 'MXN'}`
    : 'No especificado';

  const text = [
    `🚨 *NUEVO PROSPECTO (LEAD) - METROPOLIS PROPIEDADES*`,
    `----------------------------------------`,
    `👤 *Cliente:* ${payload.name}`,
    `📱 *Teléfono:* ${payload.phone}`,
    `✉️ *Correo:* ${payload.email}`,
    payload.propertyTitle ? `🏠 *Inmueble:* ${payload.propertyTitle}` : null,
    payload.propertyPrice ? `💰 *Precio:* ${priceFormatted}` : null,
    payload.message ? `💬 *Mensaje:* "${payload.message}"` : null,
    `📌 *Origen:* ${payload.source || 'Portal Web Directo'}`,
    `----------------------------------------`,
    `⚡ *Acción sugerida:* Responder en menos de 15 minutos para maximizar la tasa de conversión.`,
  ]
    .filter(Boolean)
    .join('\n');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://metropolis-propiedades.vercel.app';
  const whatsappNumber = siteConfig.whatsapp.number;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Genera el enlace oficial de WhatsApp con la confirmación de visita presencial.
 */
export function buildWhatsAppVisitNotificationUrl(payload: VisitNotificationPayload): string {
  const text = [
    `📅 *NUEVA CITA DE VISITA AGENDADA*`,
    `----------------------------------------`,
    `🏠 *Inmueble:* ${payload.propertyTitle}`,
    `📍 *Ubicación:* ${payload.propertyAddress}`,
    `📆 *Fecha:* ${payload.scheduledDate}`,
    `⏰ *Horario:* ${payload.scheduledTime} hrs`,
    `👤 *Cliente:* ${payload.leadName}`,
    `📱 *Contacto:* ${payload.leadPhone}`,
    payload.notes ? `📝 *Notas del cliente:* "${payload.notes}"` : null,
    `----------------------------------------`,
    `✅ La cita ha sido registrada en el módulo de Visitas del CRM.`,
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappNumber = siteConfig.whatsapp.number;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Despacha notificaciones automáticas asíncronas (Webhook + Email + Logs)
 */
export async function dispatchAutomatedNotifications(
  event: 'NEW_LEAD' | 'VISIT_BOOKED',
  data: LeadNotificationPayload | VisitNotificationPayload
): Promise<{ success: boolean; dispatchedTo: string[] }> {
  const dispatchedTo: string[] = ['IN_APP_LOG'];

  try {
    // 1. Webhook Dispatch (si está configurado NOTIFICATION_WEBHOOK_URL, ej. Zapier, Make, n8n, Twilio)
    const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            payload: data,
          }),
        });
        dispatchedTo.push('WEBHOOK');
      } catch (webhookErr) {
        console.error('[NotificationService] Error enviando webhook:', webhookErr);
      }
    }

    // 2. Email Dispatch (si está configurado RESEND_API_KEY)
    const resendApiKey = process.env.RESEND_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://metropolis-propiedades.vercel.app';

    if (resendApiKey) {
      try {
        const subject =
          event === 'NEW_LEAD'
            ? `🚨 Nuevo prospecto para Metropolis: ${(data as LeadNotificationPayload).name}`
            : `📅 Visita agendada para: ${(data as VisitNotificationPayload).propertyTitle}`;

        const bodyHtml =
          event === 'NEW_LEAD'
            ? `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                 <h2 style="color: #047857;">Nuevo Prospecto Recibido</h2>
                 <p><strong>Cliente:</strong> ${(data as LeadNotificationPayload).name}</p>
                 <p><strong>Teléfono:</strong> <a href="tel:${(data as LeadNotificationPayload).phone}">${(data as LeadNotificationPayload).phone}</a></p>
                 <p><strong>Email:</strong> ${(data as LeadNotificationPayload).email}</p>
                 <p><strong>Inmueble:</strong> ${(data as LeadNotificationPayload).propertyTitle || 'General'}</p>
                 <p><strong>Mensaje:</strong> ${(data as LeadNotificationPayload).message || 'Sin mensaje adicional'}</p>
                 <a href="${siteUrl}/leads" style="display: inline-block; background: #047857; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Ver en Embudo CRM</a>
               </div>`
            : `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                 <h2 style="color: #047857;">Nueva Visita Presencial Agendada</h2>
                 <p><strong>Inmueble:</strong> ${(data as VisitNotificationPayload).propertyTitle}</p>
                 <p><strong>Fecha y Hora:</strong> ${(data as VisitNotificationPayload).scheduledDate} a las ${(data as VisitNotificationPayload).scheduledTime} hrs</p>
                 <p><strong>Cliente:</strong> ${(data as VisitNotificationPayload).leadName} (${(data as VisitNotificationPayload).leadPhone})</p>
                 <a href="${siteUrl}/dashboard/visitas" style="display: inline-block; background: #047857; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Gestionar en Agenda CRM</a>
               </div>`;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Metropolis CRM <notificaciones@metropolispropiedades.com>',
            to: [process.env.ADMIN_NOTIFICATION_EMAIL || siteConfig.contact.email],
            subject,
            html: bodyHtml,
          }),
        });
        dispatchedTo.push('EMAIL_RESEND');
      } catch (emailErr) {
        console.error('[NotificationService] Error enviando email con Resend:', emailErr);
      }
    }

    // 3. Fallback log estructurado en servidor
    console.info(`[NotificationService] Evento ${event} notificado vía:`, dispatchedTo.join(', '));

    return {
      success: true,
      dispatchedTo,
    };
  } catch (err) {
    console.error('[NotificationService] Error en despacho de notificaciones:', err);
    return {
      success: false,
      dispatchedTo,
    };
  }
}
