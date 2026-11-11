'use server';

import { revalidatePath } from 'next/cache';
import { getSessionContext, getTenantDb } from '@/db/client';
import { createPropertySchema, updatePropertySchema } from '@/lib/validations/crm';
import type {
  ActionResponse,
  PaginatedResult,
  PropertyWithMedia,
  PropertyFilterParams,
  PropertyStatus,
} from '@/types/crm';

/**
 * Obtener lista pública de propiedades aprobadas con filtros
 */
export async function getPublicPropertiesAction(
  params?: PropertyFilterParams
): Promise<ActionResponse<PaginatedResult<PropertyWithMedia>>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    // En portal público solo se muestran las propiedades con status APPROVED
    const result = await db.properties.list({
      ...params,
      status: 'APPROVED',
    });

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener propiedades';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Obtener detalle de propiedad por slug (para ficha técnica pública)
 */
export async function getPropertyBySlugAction(
  slug: string
): Promise<ActionResponse<PropertyWithMedia>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    const property = await db.properties.findBySlug(slug);
    if (!property) {
      return {
        success: false,
        error: 'Propiedad no encontrada',
      };
    }

    return {
      success: true,
      data: property,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar propiedad';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Enviar propiedad por un usuario / captador / propietario para revisión
 */
export async function submitPropertyForReviewAction(
  rawInput: unknown
): Promise<ActionResponse<PropertyWithMedia>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    const parsed = createPropertySchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos del inmueble inválidos',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // Por seguridad, toda publicación externa inicia en PENDING_REVIEW
    const propertyData = {
      ...parsed.data,
      status: 'PENDING_REVIEW' as PropertyStatus,
      captadorUserId: session.userId,
    };

    const newProperty = await db.properties.create(propertyData, session.userId);

    revalidatePath('/propiedades');
    revalidatePath('/dashboard/propiedades');
    revalidatePath('/dashboard/mis-propiedades');

    return {
      success: true,
      data: newProperty,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al registrar propiedad';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Cambiar estatus de propiedad (Aprobación/Revisión por Asesor o Administrador)
 */
export async function updatePropertyStatusAction(
  propertyId: string,
  newStatus: PropertyStatus
): Promise<ActionResponse<PropertyWithMedia>> {
  try {
    const session = await getSessionContext();
    if (session.userRole !== 'owner' && session.userRole !== 'admin' && session.userRole !== 'agent') {
      return {
        success: false,
        error: 'No tienes permisos de moderación o gestión de inmuebles.',
      };
    }

    const db = getTenantDb(session.tenantId);
    const updated = await db.properties.updateStatus(propertyId, newStatus);

    revalidatePath('/propiedades');
    revalidatePath('/dashboard/propiedades');

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar estatus';
    return {
      success: false,
      error: message,
    };
  }
}
