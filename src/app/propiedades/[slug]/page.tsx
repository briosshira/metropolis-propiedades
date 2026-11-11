import { notFound } from 'next/navigation';
import { Navbar } from '@/components/portal/Navbar';
import { PropertyDetailView } from '@/components/portal/PropertyDetailView';
import { getPropertyBySlugAction } from '@/actions/properties';

interface PropertyDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const result = await getPropertyBySlugAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PropertyDetailView property={result.data} />
      </main>
    </div>
  );
}
