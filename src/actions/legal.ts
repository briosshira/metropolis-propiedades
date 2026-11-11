'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getSessionContext, getTenantDb, CAPTADOR_USER_ID } from '@/db/client';
import type {
  ActionResponse,
  BrokerageAgreement,
  LegalDocument,
  ExclusivityType,
  LegalDocumentType,
  CaptadorPropertyStat,
  CommissionWithDetails,
} from '@/types/crm';

/**
 * Firmar Convenio Digital de Mediación Mercantil con Folio Único
 */
export async function signBrokerageAgreementAction(
  propertyId: string,
  exclusivityType: ExclusivityType,
  signerName: string,
  signerEmail: string
): Promise<ActionResponse<BrokerageAgreement>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);
    const headerStore = await headers();

    const signerIp =
      headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerStore.get('x-real-ip') ||
      '127.0.0.1';

    const agreement = await db.legal.signAgreement({
      propertyId,
      captadorUserId: session.userId || CAPTADOR_USER_ID,
      exclusivityType,
      signerName,
      signerEmail,
      signerIp,
    });

    revalidatePath('/dashboard/mis-propiedades');
    revalidatePath('/propiedades');

    return {
      success: true,
      data: agreement,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al generar convenio';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Registrar subida de documento legal (Escrituras, Predial, INE)
 */
export async function uploadLegalDocumentAction(
  propertyId: string,
  type: LegalDocumentType,
  fileName: string,
  url: string
): Promise<ActionResponse<LegalDocument>> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    const doc = await db.legal.uploadDocument({
      propertyId,
      type,
      fileName,
      url,
    });

    revalidatePath('/dashboard/mis-propiedades');
    revalidatePath('/dashboard/propiedades');

    return {
      success: true,
      data: doc,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al registrar documento';
    return {
      success: false,
      error: message,
    };
  }
}

export interface CaptadorDashboardPayload {
  stats: CaptadorPropertyStat[];
  commissions: CommissionWithDetails[];
  totals: {
    propertiesCount: number;
    earnedCommission: number;
    pendingCommission: number;
    totalLeads: number;
    totalVisits: number;
  };
}

/**
 * Obtener todos los datos para el Dashboard del Propietario / Captador
 */
export async function getCaptadorDashboardDataAction(): Promise<
  ActionResponse<CaptadorDashboardPayload>
> {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    const userId = session.userRole === 'captador' ? session.userId : CAPTADOR_USER_ID;

    const stats = await db.legal.getCaptadorStats(userId);
    const commissions = await db.commissions.findByCaptador(userId);

    const earnedCommission = commissions
      .filter((c) => c.captadorStatus === 'PAID')
      .reduce((sum, c) => sum + c.captadorAmount, 0);

    const pendingCommission = commissions
      .filter((c) => c.captadorStatus !== 'PAID')
      .reduce((sum, c) => sum + c.captadorAmount, 0);

    const totalLeads = stats.reduce((sum, s) => sum + s.leadsCount, 0);
    const totalVisits = stats.reduce((sum, s) => sum + s.visitsCount, 0);

    return {
      success: true,
      data: {
        stats,
        commissions,
        totals: {
          propertiesCount: stats.length,
          earnedCommission,
          pendingCommission,
          totalLeads,
          totalVisits,
        },
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener panel de afiliado';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Consultar un Convenio de Mediación Mercantil con datos de la propiedad para vista imprimible / PDF
 */
export async function getBrokerageAgreementAction(idOrFolio: string) {
  try {
    const session = await getSessionContext();
    const db = getTenantDb(session.tenantId);

    const agreement = await db.legal.getAgreementByIdOrFolio(idOrFolio);
    if (!agreement) {
      return {
        success: false,
        error: 'Convenio no encontrado con el folio especificado.',
      };
    }

    const property = await db.properties.findById(agreement.propertyId);

    return {
      success: true,
      data: {
        agreement,
        property,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar convenio';
    return {
      success: false,
      error: message,
    };
  }
}
