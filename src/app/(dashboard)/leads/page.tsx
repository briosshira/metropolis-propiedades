import React, { Suspense } from 'react';
import { getLeads } from '@/actions/leads';
import { getContacts } from '@/actions/contacts';
import LeadsView from '@/components/leads/LeadsView';
import KanbanSkeleton from '@/components/leads/KanbanSkeleton';
import ErrorState from '@/components/leads/ErrorState';

export const dynamic = 'force-dynamic';

interface LeadsPageProps {
  searchParams: Promise<{
    view?: string;
    search?: string;
    priority?: string;
  }>;
}

/**
 * Async Server Component (RSC) responsible for data-fetching directly on the server.
 * Eliminates client waterfalls, avoids exposing database clients, and passes
 * sanitized multi-tenant data into client-side optimistic UI components.
 */
async function LeadsContent() {
  // Concurrent server-side fetching of leads and contacts
  const [leadsRes, contactsRes] = await Promise.all([
    getLeads({ page: 1, pageSize: 100 }),
    getContacts(),
  ]);

  // Visual State 2: Error State
  if (!leadsRes.success) {
    return (
      <ErrorState
        message={
          leadsRes.error ||
          'No se pudieron cargar los prospectos para el inquilino activo.'
        }
      />
    );
  }

  const leads = leadsRes.data?.data || [];
  const contacts = contactsRes.success && contactsRes.data ? contactsRes.data : [];

  // Visual State 3 (Empty) and State 4 (Success):
  // Handled smoothly inside LeadsView with full optimistic interactivity
  return <LeadsView initialLeads={leads} initialContacts={contacts} />;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  // Await searchParams in Next 15
  await searchParams;

  return (
    <div className="space-y-6">
      {/* Zero CLS: High fidelity skeleton while RSC stream resolves */}
      <Suspense fallback={<KanbanSkeleton />}>
        <LeadsContent />
      </Suspense>
    </div>
  );
}
