'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  DEFAULT_TENANT_ID,
  DEFAULT_USER_ID,
  AGENT_USER_ID,
  CAPTADOR_USER_ID,
} from '@/db/client';
import type { ActionResponse, UserRole } from '@/types/crm';

/**
 * Cambio rápido de perfil demo para pruebas en vivo (Captador vs Asesor vs Admin)
 */
export async function switchDemoRoleAction(
  role: 'owner' | 'agent' | 'captador'
): Promise<ActionResponse<{ role: UserRole; userId: string }>> {
  const cookieStore = await cookies();

  let targetUserId = DEFAULT_USER_ID;
  if (role === 'agent') targetUserId = AGENT_USER_ID;
  if (role === 'captador') targetUserId = CAPTADOR_USER_ID;

  cookieStore.set('tenant_id', DEFAULT_TENANT_ID, { path: '/' });
  cookieStore.set('user_id', targetUserId, { path: '/' });
  cookieStore.set('user_role', role, { path: '/' });

  revalidatePath('/', 'layout');

  return {
    success: true,
    data: {
      role,
      userId: targetUserId,
    },
  };
}

/**
 * Autenticación por correo y contraseña
 */
export async function loginAction(
  formData: FormData
): Promise<ActionResponse<{ redirectUrl: string }>> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const roleType = (formData.get('roleType') as string) || 'captador';

  if (!email || !password) {
    return {
      success: false,
      error: 'Ingresa correo electrónico y contraseña.',
    };
  }

  const cookieStore = await cookies();

  // Determinación de rol y usuario demo o Supabase
  let role: UserRole = roleType === 'agent' ? 'agent' : 'captador';
  let userId = role === 'agent' ? AGENT_USER_ID : CAPTADOR_USER_ID;

  if (email.includes('admin') || email.includes('carlos')) {
    role = 'owner';
    userId = DEFAULT_USER_ID;
  }

  cookieStore.set('tenant_id', DEFAULT_TENANT_ID, { path: '/' });
  cookieStore.set('user_id', userId, { path: '/' });
  cookieStore.set('user_role', role, { path: '/' });

  const destination = role === 'captador' ? '/dashboard/comisiones' : '/leads';
  return {
    success: true,
    data: {
      redirectUrl: destination,
    },
  };
}

/**
 * Registro de nuevo usuario (Afiliado/Captador o Asesor)
 */
export async function registerAction(
  formData: FormData
): Promise<ActionResponse<{ redirectUrl: string }>> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const phone = (formData.get('phone') as string)?.trim();
  const role = ((formData.get('role') as string) || 'captador') as UserRole;

  if (!name || !email) {
    return {
      success: false,
      error: 'Nombre y correo son requeridos.',
    };
  }

  const cookieStore = await cookies();
  const newUserId = crypto.randomUUID();

  cookieStore.set('tenant_id', DEFAULT_TENANT_ID, { path: '/' });
  cookieStore.set('user_id', newUserId, { path: '/' });
  cookieStore.set('user_role', role, { path: '/' });

  const destination = role === 'captador' ? '/publicar' : '/leads';
  return {
    success: true,
    data: {
      redirectUrl: destination,
    },
  };
}

/**
 * Cerrar sesión
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
  cookieStore.delete('user_role');
  redirect('/');
}
