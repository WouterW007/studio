
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/AdminTable';
import { collection, getDocs, query } from 'firebase/firestore';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import { MOCK_GROUPS, MOCK_ANNOUNCEMENTS } from '@/data/mockData'; // In real app, fetch from DB
import type { Group, Announcement } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, Megaphone, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [adminAnnouncements, setAdminAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
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
      // Simulate fetching data for the admin
      setTimeout(() => {
        setGroups(MOCK_GROUPS); // Replace with actual data fetching
        setAdminAnnouncements([...MOCK_ANNOUNCEMENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Also sort by most recent
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

  const handleAddAnnouncement = async (data: { title: string; content: string; category?: string }) => {
    const newAnnouncement: Announcement = {
      id: `anc${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // More unique ID
      title: data.title,
      content: data.content,
      category: data.category || "General",
      date: new Date(),
    };
    // For prototype: Add to MOCK_ANNOUNCEMENTS directly so it persists across soft reloads IF mockData.ts isn't re-evaluated
    MOCK_ANNOUNCEMENTS.unshift(newAnnouncement);
    setAdminAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]);
    toast({
      title: "Aankondiging Gepos",
      description: `"${data.title}" is by die kennisgewingbord gevoeg.`,
    });
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    // For prototype: Remove from MOCK_ANNOUNCEMENTS
    const index = MOCK_ANNOUNCEMENTS.findIndex(ann => ann.id === announcementId);
    if (index > -1) {
      MOCK_ANNOUNCEMENTS.splice(index, 1);
    }
    setAdminAnnouncements(prevAnnouncements => prevAnnouncements.filter(ann => ann.id !== announcementId));
    toast({
      title: "Aankondiging Verwyder",
      description: "Die aankondiging is van die kennisgewingbord verwyder.",
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
                  Bestuur Kleingroep registrasies en Kennisgewingbord.
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

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Megaphone className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Bestuur Kennisgewingbord</CardTitle>
              <CardDescription className="text-lg">
                Voeg nuwe aankondigings by of verwyder bestaandes.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnnouncementManager
            announcements={adminAnnouncements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        </CardContent>
      </Card>
    </div>
  );
}
