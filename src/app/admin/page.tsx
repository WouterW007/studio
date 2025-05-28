
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/AdminTable';
import { MOCK_GROUPS } from '@/data/mockData'; // In real app, fetch from DB and use server actions/API
import type { Group } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react'; // Removed LogOut
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // WARNING: This is a non-secure client-side check for prototyping.
    // DO NOT use this in a production environment.
    try {
      const authStatus = localStorage.getItem('isAdminAuthenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      } else {
        router.replace('/admin/login');
      }
    } catch (e) {
      // Likely localStorage is not available (e.g. SSR or security settings)
      console.error("LocalStorage access error, redirecting to login:", e);
      router.replace('/admin/login');
    } finally {
      setIsAuthLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      setTimeout(() => {
        setGroups(MOCK_GROUPS);
        setIsLoading(false);
      }, 500);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('isAdminAuthenticated');
    } catch (e) {
      console.error("Error removing item from localStorage:", e);
    }
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    router.push('/admin/login');
  };

  const handleUpdateStatus = async (groupId: string, status: Group['status']) => {
    console.log(`Updating group ${groupId} to status ${status}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId ? { ...group, status } : group
      )
    );
  };
  
  const handleDeleteGroup = async (groupId: string) => {
    console.log(`Deleting group ${groupId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the redirect,
    // but it's a fallback / avoids rendering content before redirect.
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <ShieldCheck className="h-16 w-16 text-destructive animate-pulse mb-4" />
        <p className="text-xl text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

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
            {/* Logout button removed from here */}
          </div>
        </CardHeader>
        <CardContent>
          <AdminTable 
            groups={groups} 
            onUpdateStatus={handleUpdateStatus} 
            onDeleteGroup={handleDeleteGroup}
            onLogout={handleLogout} // Pass handleLogout as a prop
          />
        </CardContent>
      </Card>
       <div className="text-center p-4 mt-4 border border-destructive/50 bg-destructive/10 rounded-md">
        <p className="text-destructive font-semibold flex items-center justify-center"><AlertTriangle className="h-5 w-5 mr-2" />Waarskuwing</p>
        <p className="text-destructive/80 text-sm">
          Hierdie admin paneel gebruik 'n basiese, nie-veilige aanmeldmeganisme slegs vir prototipe doeleindes.
          Moet dit NIE in 'n produksie-omgewing gebruik sonder behoorlike, veilige stawing nie.
        </p>
      </div>
    </div>
  );
}
