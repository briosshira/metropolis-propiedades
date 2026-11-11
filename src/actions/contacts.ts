'use server';

/**
 * Server Actions for CRM Contacts
 * Enforces strict multi-tenancy and Zod runtime schema validation.
 */

import { getSessionContext, getTenantDb } from '@/db/client';
import { createContactSchema, type CreateContactInput } from '@/lib/validations/crm';
import type { ActionResponse, Contact } from '@/types/crm';

/**
 * Creates a new contact isolated to the authenticated user's active tenant.
 */
export async function createContact(
  input: CreateContactInput
): Promise<ActionResponse<Contact>> {
  try {
    // 1. Zod input validation
    const parsed = createContactSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Los datos proporcionados para el contacto son inválidos.',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // 2. Resolve active tenant session
    const session = await getSessionContext();

    // 3. Obtain tenant-scoped DB client
    const db = getTenantDb(session);

    // 4. Execute creation locked to tenant
    const contact = await db.contacts.create(parsed.data);

    return {
      success: true,
      data: contact,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado al crear el contacto.',
    };
  }
}

/**
 * Retrieves all contacts belonging exclusively to the authenticated user's active tenant.
 */
export async function getContacts(): Promise<ActionResponse<Contact[]>> {
  try {
    // 1. Resolve active tenant session
    const session = await getSessionContext();

    // 2. Obtain tenant-scoped DB client
    const db = getTenantDb(session);

    // 3. Query contacts with strict tenant isolation
    const contacts = await db.contacts.list();

    return {
      success: true,
      data: contacts,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al consultar los contactos.',
    };
  }
}
