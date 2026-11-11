import { getSessionContext, getTenantDb } from '@/db/client';
import { ComisionesView } from '@/components/dashboard/ComisionesView';

export default async function DashboardComisionesPage() {
  const session = await getSessionContext();
  const db = getTenantDb(session.tenantId);

  const commissions = await db.commissions.list();

  return <ComisionesView initialCommissions={commissions} />;
}
