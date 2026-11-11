'use server';

import { revalidatePath } from 'next/cache';
import { getSessionContext, getTenantDb } from '@/db/client';
import { publicInquirySchema, bookVisitSchema } from '@/lib/validations/crm';
import {
  dispatchAutomatedNotifications,
  buildWhatsAppLeadNotificationUrl,
  buildWhatsAppVisitNotificationUrl,
} from '@/lib/notifications/service';
import type { ActionResponse, PropertyVisit } from '@/types/crm';

/**
 * Captura pública de lead desde la web (Formulario de informes o tracking de WhatsApp)
 */
export async function submitPublicInquiryAction(
  rawInput: unknown
): Promise<ActionResponse<{ leadId: string; contactId: string; whatsappRedirectUrl?: string }>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    const parsed = publicInquirySchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Por favor verifica tus datos de contacto.',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { lead, contact } = await db.leads.createFromPublicInquiry(parsed.data);

    // Obtener datos del inmueble para enriquecer la alerta
    let propertyTitle = 'Consulta General de Inmuebles';
    let propertyPrice: number | undefined;
    let propertyCurrency: string | undefined;

    if (parsed.data.propertyId) {
      const prop = await db.properties.findById(parsed.data.propertyId);
      if (prop) {
        propertyTitle = prop.title;
        propertyPrice = prop.price;
        propertyCurrency = prop.currency;
      }
    }

    // Despacho asíncrono de alertas (Email / Webhook)
    const notificationPayload = {
      leadId: lead.id,
      name: `${contact.firstName} ${contact.lastName}`.trim(),
      email: contact.email,
      phone: contact.phone || '',
      message: parsed.data.message,
      propertyTitle,
      propertyPrice,
      propertyCurrency,
      source: parsed.data.channel,
    };

    dispatchAutomatedNotifications('NEW_LEAD', notificationPayload).catch((e) =>
      console.error('[Action:Inquiries] Error enviando notificación:', e)
    );

    const whatsappRedirectUrl = buildWhatsAppLeadNotificationUrl(notificationPayload);

    revalidatePath('/leads');
    revalidatePath('/dashboard/leads');

    return {
      success: true,
      data: {
        leadId: lead.id,
        contactId: contact.id,
        whatsappRedirectUrl,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar la solicitud';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Agendar visita presencial desde la ficha de la propiedad
 */
export async function bookPropertyVisitAction(
  rawInput: unknown
): Promise<ActionResponse<PropertyVisit & { whatsappRedirectUrl?: string }>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    const parsed = bookVisitSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Por favor selecciona fecha y hora válidas.',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const visit = await db.visits.create(parsed.data);

    // Obtener detalles del inmueble y contacto para la confirmación
    const prop = await db.properties.findById(parsed.data.propertyId);

    const scheduledDate = parsed.data.scheduledAt.split('T')[0] || '';
    const scheduledTime = parsed.data.scheduledAt.split('T')[1]?.slice(0, 5) || '';

    const visitNotificationPayload = {
      visitId: visit.id,
      leadName: parsed.data.visitorName.trim(),
      leadPhone: parsed.data.visitorPhone,
      leadEmail: parsed.data.visitorEmail,
      propertyTitle: prop?.title || 'Inmueble Seleccionado',
      propertyAddress: prop ? `${prop.address}, ${prop.neighborhood}, ${prop.city}` : 'Dirección por confirmar',
      scheduledDate,
      scheduledTime,
      notes: parsed.data.notes,
    };

    // Despacho asíncrono
    dispatchAutomatedNotifications('VISIT_BOOKED', visitNotificationPayload).catch((e) =>
      console.error('[Action:Inquiries] Error enviando notificación de visita:', e)
    );

    const whatsappRedirectUrl = buildWhatsAppVisitNotificationUrl(visitNotificationPayload);

    revalidatePath('/leads');
    revalidatePath('/dashboard/visitas');

    return {
      success: true,
      data: {
        ...visit,
        whatsappRedirectUrl,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al agendar la visita';
    return {
      success: false,
      error: message,
    };
  }
}
