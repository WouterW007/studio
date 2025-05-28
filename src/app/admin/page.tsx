"use client";

import { useState, useEffect } from 'react';
import AdminTable from '@/components/admin/AdminTable';
import { MOCK_GROUPS } from '@/data/mockData'; // In real app, fetch from DB and use server actions/API
import type { Group } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setIsLoading(true);
    setTimeout(() => {
      setGroups(MOCK_GROUPS); // Load all groups for admin view
      setIsLoading(false);
    }, 500);
  }, []);

  const handleUpdateStatus = async (groupId: string, status: Group['status']) => {
    // Simulate API call for updating status
    console.log(`Updating group ${groupId} to status ${status}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId ? { ...group, status } : group
      )
    );
    // In a real app, you might want to re-fetch or ensure the backend call was successful.
  };
  
  const handleDeleteGroup = async (groupId: string) => {
    // Simulate API call for deleting group
    console.log(`Deleting group ${groupId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
  };

  if (isLoading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <ShieldCheck className="h-16 w-16 text-primary animate-pulse mb-4" />
        <p className="text-xl text-muted-foreground">Laai admin paneel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Admin Paneel</CardTitle>
              <CardDescription className="text-lg">
                Bestuur Gaan Groep registrasies. Keur goed, wys af, of verwyder groepe.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminTable groups={groups} onUpdateStatus={handleUpdateStatus} onDeleteGroup={handleDeleteGroup} />
        </CardContent>
      </Card>
    </div>
  );
}
