
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/AdminTable';
import { MOCK_GROUPS } from '@/data/mockData'; // In real app, fetch from DB
import type { Group } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Here you might want to check if the user has admin privileges
        // For now, any authenticated user can access.
      } else {
        setCurrentUser(null);
        router.replace('/admin/login');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      setIsLoadingData(true);
      // Simulate fetching groups for the admin
      setTimeout(() => {
        setGroups(MOCK_GROUPS); // Replace with actual data fetching
        setIsLoadingData(false);
      }, 500);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      router.push('/admin/login');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (groupId: string, status: Group['status']) => {
    console.log(`Updating group ${groupId} to status ${status}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId ? { ...group, status } : group
      )
    );
     toast({
        title: "Status Opgedateer",
        description: `Groep status suksesvol verander na ${status}.`,
      });
  };
  
  const handleDeleteGroup = async (groupId: string) => {
    console.log(`Deleting group ${groupId}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
    toast({
      title: "Groep Verwyder",
      description: `Groep ${groupId} is suksesvol verwyder.`,
    });
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  if (!currentUser) {
    // This case is mostly handled by the redirect in onAuthStateChanged,
    // but it's a fallback or avoids rendering content before redirect.
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <ShieldCheck className="h-16 w-16 text-destructive animate-pulse mb-4" />
        <p className="text-xl text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  if (isLoadingData) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Laai admin paneel data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold">Admin Paneel</CardTitle>
                <CardDescription className="text-lg">
                  Bestuur Kleingroep registrasies. Keur goed, wys af, of verwyder groepe.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminTable 
            groups={groups} 
            onUpdateStatus={handleUpdateStatus} 
            onDeleteGroup={handleDeleteGroup}
            onLogout={handleLogout}
          />
        </CardContent>
      </Card>
       <div className="text-center p-4 mt-4 border border-destructive/50 bg-destructive/10 rounded-md">
        <p className="text-destructive font-semibold flex items-center justify-center"><AlertTriangle className="h-5 w-5 mr-2" />Belangrik</p>
        <p className="text-destructive/80 text-sm">
          Admin toegang word nou deur Firebase Authentication bestuur. Vir 'n volledige oplossing,
          oorweeg dit om Firebase Custom Claims te gebruik om spesifieke admin rolle af te dwing.
        </p>
      </div>
    </div>
  );
}
