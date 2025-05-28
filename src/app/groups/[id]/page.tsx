
import GroupDetailClient from '@/components/groups/GroupDetailClient';
import { MOCK_GROUPS } from '@/data/mockData'; // In real app, fetch from DB
import type { Group } from '@/types';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface GroupDetailPageProps {
  params: { id: string };
}

async function getGroupById(id: string): Promise<Group | undefined> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate delay
  return MOCK_GROUPS.find(group => group.id === id);
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const group = await getGroupById(params.id);

  if (!group) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-3xl font-semibold mb-3">Kleingroep Nie Gevind Nie</h2>
        <p className="text-muted-foreground mb-6">
          Die kleingroep waarvoor jy soek kon nie gevind word nie. Dit mag dalk verwyder wees of die skakel is verkeerd.
        </p>
        <Button asChild>
          <Link href="/">Terug na Alle Kleingroepe</Link>
        </Button>
      </div>
    );
  }
  
  if (group.status !== 'approved') {
     return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-3xl font-semibold mb-3">Kleingroep Nie Beskikbaar</h2>
        <p className="text-muted-foreground mb-6">
          Hierdie kleingroep is tans nie publiek sigbaar nie. Dit mag nog wag vir goedkeuring of is gedeaktiveer.
        </p>
        <Button asChild>
          <Link href="/">Terug na Alle Kleingroepe</Link>
        </Button>
      </div>
    );
  }


  return <GroupDetailClient group={group} />;
}

// Optional: Generate static paths if you have a known set of groups
// export async function generateStaticParams() {
//   // In a real app, fetch all approved group IDs
//   const approvedGroups = MOCK_GROUPS.filter(g => g.status === 'approved');
//   return approvedGroups.map((group) => ({
//     id: group.id,
//   }));
// }

export async function generateMetadata({ params }: GroupDetailPageProps) {
  const group = await getGroupById(params.id);
  if (!group || group.status !== 'approved') {
    return {
      title: "Kleingroep Nie Gevind Nie",
    };
  }
  return {
    title: `${group.groupName} | Kleingroepe`,
    description: group.description?.substring(0, 160) || `Meer inligting oor die Kleingroep: ${group.groupName}.`,
  };
}

    