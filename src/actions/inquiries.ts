'use server';

import { revalidatePath } from 'next/cache';
import { getSessionContext, getTenantDb } from '@/db/client';
import { publicInquirySchema, bookVisitSchema } from '@/lib/validations/crm';
import type { ActionResponse, PropertyVisit } from '@/types/crm';

/**
 * Captura pública de lead desde la web (Formulario de informes o tracking de WhatsApp)
 */
export async function submitPublicInquiryAction(
  rawInput: unknown
): Promise<ActionResponse<{ leadId: string; contactId: string }>> {
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

    revalidatePath('/leads');
    revalidatePath('/dashboard/leads');

    return {
      success: true,
      data: {
        leadId: lead.id,
        contactId: contact.id,
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
): Promise<ActionResponse<PropertyVisit>> {
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

    revalidatePath('/leads');
    revalidatePath('/dashboard/visitas');

    return {
      success: true,
      data: visit,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al agendar la visita';
    return {
      success: false,
      error: message,
    };
  }
}
