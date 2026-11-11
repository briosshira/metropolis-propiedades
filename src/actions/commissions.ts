'use server';

import { revalidatePath } from 'next/cache';
import { getSessionContext, getTenantDb, CAPTADOR_USER_ID } from '@/db/client';
import {
  createCommissionSchema,
  updateCommissionStatusSchema,
} from '@/lib/validations/crm';
import type {
  ActionResponse,
  Commission,
  CommissionWithDetails,
} from '@/types/crm';

/**
 * Obtener lista de comisiones (Vista administrativa del CRM)
 */
export async function getCommissionsAction(): Promise<ActionResponse<CommissionWithDetails[]>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    const commissions = await db.commissions.list();
    return {
      success: true,
      data: commissions,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar comisiones';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Obtener comisiones ganadas por el usuario captador activo
 */
export async function getMyCommissionsAction(): Promise<ActionResponse<CommissionWithDetails[]>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    // En demo, el usuario captador activo es CAPTADOR_USER_ID o session.userId
    const userId = session.userRole === 'captador' ? session.userId : CAPTADOR_USER_ID;
    const commissions = await db.commissions.findByCaptador(userId);

    return {
      success: true,
      data: commissions,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar tus comisiones';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Actualizar estado de comisión (Aprobar o Pagar comisión a captador o asesor)
 */
export async function updateCommissionStatusAction(
  rawInput: unknown
): Promise<ActionResponse<Commission>> {
  try {
    const session = await getSessionContext();
    if (session.userRole !== 'owner' && session.userRole !== 'admin') {
      return {
        success: false,
        error: 'Solo los administradores pueden autorizar o dispersar comisiones.',
      };
    }

    const parsed = updateCommissionStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const db = getTenantDb(session.tenantId);
    const updated = await db.commissions.updateStatus(parsed.data.id, parsed.data.target, parsed.data.status);

    revalidatePath('/dashboard/comisiones');
    revalidatePath('/dashboard/mis-comisiones');

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar comisión';
    return {
      success: false,
      error: message,
    };
  }
}
