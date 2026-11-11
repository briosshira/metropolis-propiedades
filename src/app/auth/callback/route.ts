import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DEFAULT_TENANT_ID } from '@/db/client';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard/mis-propiedades';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const cookieStore = await cookies();
      const userRole = (data.user.user_metadata?.role as string) || 'captador';
      
      // Persistir cookies de sesión para multi-inquilino del CRM
      cookieStore.set('tenant_id', DEFAULT_TENANT_ID, { path: '/' });
      cookieStore.set('user_id', data.user.id, { path: '/' });
      cookieStore.set('user_role', userRole, { path: '/' });
      
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
  }

  // Si falló el código, redirigir al login con error
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_failed`);
}
