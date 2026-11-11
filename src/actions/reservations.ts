'use server';

import { revalidatePath } from 'next/cache';
import { getSessionContext, getTenantDb } from '@/db/client';
import { createReservationSchema } from '@/lib/validations/crm';
import type { ActionResponse, PropertyReservation } from '@/types/crm';
import { dispatchAutomatedNotifications } from '@/lib/notifications/service';

export interface CreateReservationResult {
  reservation: PropertyReservation;
  checkoutUrl?: string;
  isStripeLive: boolean;
}

/**
 * Iniciar o completar el apartado con depósito de garantía en línea
 */
export async function createReservationAction(
  rawInput: unknown,
  originUrl?: string
): Promise<ActionResponse<CreateReservationResult>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    const parsed = createReservationSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos de reservación inválidos',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { propertyId, clientName, clientEmail, clientPhone, amount, paymentMethod } = parsed.data;

    const property = await db.properties.findById(propertyId);
    if (!property) {
      return {
        success: false,
        error: 'La propiedad que deseas apartar no existe o ya no está disponible.',
      };
    }

    if (property.isReserved) {
      return {
        success: false,
        error: `Esta propiedad ya cuenta con un apartado activo vigente hasta el ${new Date(
          property.reservedUntil || ''
        ).toLocaleDateString('es-MX')}.`,
      };
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    let checkoutUrl: string | undefined = undefined;
    let stripeSessionId: string | undefined = undefined;
    let isStripeLive = false;

    // Si hay llave secreta de Stripe y el método es tarjeta
    if (stripeKey && paymentMethod === 'STRIPE_CARD') {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeKey, {
          apiVersion: '2025-01-27.acacia' as any,
        });

        const baseUrl = originUrl || 'https://metropolis-propiedades.vercel.app';
        const sessionStripe = await stripe.checkout.sessions.create({
          customer_email: clientEmail,
          line_items: [
            {
              price_data: {
                currency: (property.currency || 'mxn').toLowerCase(),
                product_data: {
                  name: `Apartado: ${property.title}`,
                  description: `Depósito de garantía de congelamiento de inmueble por 72 horas. Folio oficial Metropolis.`,
                  images: property.media[0]?.url ? [property.media[0].url] : undefined,
                },
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          metadata: {
            propertyId: property.id,
            clientName,
            clientPhone,
            clientEmail,
          },
          success_url: `${baseUrl}/reservaciones/exito?folio={CHECKOUT_SESSION_ID}&property=${property.slug}`,
          cancel_url: `${baseUrl}/propiedades/${property.slug}`,
        } as any);

        checkoutUrl = sessionStripe.url || undefined;
        stripeSessionId = sessionStripe.id;
        isStripeLive = true;
      } catch (stripeErr) {
        console.warn('[STRIPE_CHECKOUT_FALLBACK]', stripeErr);
        // Fallback a confirmación inmediata en sandbox
      }
    }

    // Registrar en BD el apartado
    const reservation = await db.reservations.create({
      propertyId,
      clientName,
      clientEmail,
      clientPhone,
      amount,
      paymentMethod,
      stripeSessionId,
    });

    // Despacho de notificaciones multicanal (WhatsApp y Correo al asesor/admin)
    try {
      await dispatchAutomatedNotifications('NEW_LEAD', {
        leadId: reservation.id,
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        propertyTitle: property.title,
        propertyPrice: amount,
        propertyCurrency: property.currency,
        propertySlug: property.slug,
        source: `Apartado Online (Folio: ${reservation.folio})`,
        message: `¡NUEVO APARTADO EN LÍNEA! Monto: $${amount.toLocaleString(
          'es-MX'
        )} ${property.currency}. Folio: ${reservation.folio}. Inmueble congelado por 72 horas.`,
      });
    } catch (notifErr) {
      console.warn('[NOTIFY_RESERVATION_WARN]', notifErr);
    }

    revalidatePath(`/propiedades/${property.slug}`);
    revalidatePath('/');
    revalidatePath('/dashboard/propiedades');

    return {
      success: true,
      data: {
        reservation,
        checkoutUrl,
        isStripeLive,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar el apartado';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Consultar detalles de comprobante de apartado por Folio o ID
 */
export async function getReservationByFolioAction(
  folio: string
): Promise<ActionResponse<PropertyReservation & { propertySlug?: string }>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    let reservation = await db.reservations.findByFolio(folio);
    if (!reservation) {
      reservation = await db.reservations.findById(folio);
    }

    if (!reservation) {
      return {
        success: false,
        error: 'Comprobante de apartado no encontrado.',
      };
    }

    const prop = await db.properties.findById(reservation.propertyId);

    return {
      success: true,
      data: {
        ...reservation,
        propertySlug: prop?.slug,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar apartado';
    return {
      success: false,
      error: message,
    };
  }
}
