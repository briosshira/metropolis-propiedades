'use server';

/**
 * Server Actions for CRM Leads
 * Enforces strict multi-tenancy and Zod runtime schema validation.
 */

import { z } from 'zod';
import { getSessionContext, getTenantDb } from '@/db/client';
import {
  createLeadSchema,
  leadFilterSchema,
  updateLeadStageSchema,
  type CreateLeadInput,
  type LeadFilterInput,
} from '@/lib/validations/crm';
import type {
  ActionResponse,
  LeadStage,
  LeadWithContact,
  PaginatedResult,
} from '@/types/crm';

const uuidParamSchema = z.string().uuid('El identificador proporcionado no es un UUID válido.');

/**
 * Creates a new lead isolated to the active tenant.
 * Validates that the referenced contact belongs strictly to the same tenant.
 */
export async function createLead(
  input: CreateLeadInput
): Promise<ActionResponse<LeadWithContact>> {
  try {
    // 1. Zod input validation
    const parsed = createLeadSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Los datos del prospecto son inválidos.',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // 2. Resolve active tenant session
    const session = await getSessionContext();

    // 3. Obtain tenant-scoped DB client
    const db = getTenantDb(session);

    // 4. Create lead under tenant isolation
    const lead = await db.leads.create(parsed.data);

    return {
      success: true,
      data: lead,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado al crear el prospecto.',
    };
  }
}

/**
 * Retrieves paginated leads filtered by stage, priority, search, etc.
 * Enforces that only leads and contacts belonging to the active tenant are returned.
 */
export async function getLeads(
  filterParams?: LeadFilterInput
): Promise<ActionResponse<PaginatedResult<LeadWithContact>>> {
  try {
    // 1. Filter validation (with sensible defaults)
    const parsed = leadFilterSchema.safeParse(filterParams ?? {});
    if (!parsed.success) {
      return {
        success: false,
        error: 'Parámetros de filtrado inválidos.',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // 2. Resolve active tenant session
    const session = await getSessionContext();

    // 3. Obtain tenant-scoped DB client
    const db = getTenantDb(session);

    // 4. Query leads with strict tenant isolation
    const result = await db.leads.list(parsed.data);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al consultar los prospectos.',
    };
  }
}

/**
 * Updates the stage (and optional loss reason) of a lead.
 * Verifies that the lead belongs to the authenticated tenant.
 */
export async function updateLeadStage(
  id: string,
  stage: LeadStage,
  lossReason?: string | null
): Promise<ActionResponse<LeadWithContact>> {
  try {
    // 1. Validate input schema
    const parsed = updateLeadStageSchema.safeParse({ id, stage, lossReason });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos de actualización de etapa inválidos.',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // 2. Resolve active tenant session
    const session = await getSessionContext();

    // 3. Obtain tenant-scoped DB client
    const db = getTenantDb(session);

    // 4. Execute update locked to tenant
    const updatedLead = await db.leads.updateStage(
      parsed.data.id,
      parsed.data.stage,
      parsed.data.lossReason
    );

    return {
      success: true,
      data: updatedLead,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar la etapa del prospecto.',
    };
  }
}

/**
 * Retrieves a single lead by its ID along with its associated contact.
 * Blocks cross-tenant retrieval.
 */
export async function getLeadById(
  id: string
): Promise<ActionResponse<LeadWithContact>> {
  try {
    // 1. Validate UUID format
    const parsed = uuidParamSchema.safeParse(id);
    if (!parsed.success) {
      return {
        success: false,
        error: 'ID de prospecto inválido.',
      };
    }

    // 2. Resolve active tenant session
    const session = await getSessionContext();

    // 3. Obtain tenant-scoped DB client
    const db = getTenantDb(session);

    // 4. Fetch lead strictly within the active tenant
    const lead = await db.leads.findWithContactById(parsed.data);
    if (!lead) {
      return {
        success: false,
        error: 'Prospecto no encontrado en su organización.',
      };
    }

    return {
      success: true,
      data: lead,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el prospecto.',
    };
  }
}
