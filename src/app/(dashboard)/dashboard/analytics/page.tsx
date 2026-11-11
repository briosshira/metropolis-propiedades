import { getSessionContext, getTenantDb, CAPTADOR_USER_ID } from '@/db/client';
import { AnalyticsDashboardView } from '@/components/dashboard/AnalyticsDashboardView';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await getSessionContext();
  const db = getTenantDb(session.tenantId);

  // Parallel server fetch
  const [propResult, leadsResult, visits, commissions, captadorStats] = await Promise.all([
    db.properties.list({ pageSize: 50 }),
    db.leads.list({ pageSize: 150 }),
    db.visits.list(),
    db.commissions.list(),
    db.legal.getCaptadorStats(session.userId || CAPTADOR_USER_ID),
  ]);

  return (
    <AnalyticsDashboardView
      properties={propResult.data}
      leads={leadsResult.data}
      visits={visits}
      commissions={commissions}
      captadorStats={captadorStats}
    />
  );
}
