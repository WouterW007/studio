
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/AdminTable';
import { collection, getDocs, query, doc, updateDoc, deleteDoc, addDoc, orderBy } from 'firebase/firestore'; // Import necessary Firestore functions
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import type { Group, Announcement } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, Megaphone, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
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
    const fetchAdminData = async () => {
      if (currentUser) {
        setIsLoadingData(true);
        try {
          // Fetch groups from Firestore
          const groupsCollectionRef = collection(db, 'groups');
          const groupSnapshot = await getDocs(groupsCollectionRef);
          const groupsData = groupSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<Group, 'id'>
          }));
          setGroups(groupsData);

          // Fetch announcements from Firestore, ordered by date descending
          const announcementsCollectionRef = collection(db, 'announcements');
          const q = query(announcementsCollectionRef, orderBy('date', 'desc'));
          const announcementSnapshot = await getDocs(q);
          const announcementsData = announcementSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<Announcement, 'id'>,
            date: (doc.data().date as any).toDate() // Convert Firestore Timestamp to Date
          }));
          setAdminAnnouncements(announcementsData);

        } catch (error) {
          console.error("Error fetching admin data:", error);
          toast({
            title: "Data Fetch Error",
            description: "Could not load admin data.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchAdminData();

  }, [currentUser, toast]);

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
    console.log(`Attempting to update group ${groupId} to status ${status}`);
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        status: status
      });
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? { ...group, status } : group
        )
      );
       toast({
          title: "Status Opgedateer",
          description: `Groep status suksesvol verander na ${status}.`,
        });
    } catch (error) {
      console.error("Error updating group status:", error);
       toast({
          title: "Status Update Failed",
          description: `Kon nie groep ${groupId} status opdateer nie.`,
          variant: "destructive",
        });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    console.log(`Attempting to delete group ${groupId}`);
    try {
      await deleteDoc(doc(db, 'groups', groupId));
      setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
      toast({
        title: "Groep Verwyder",
        description: `Groep ${groupId} is suksesvol verwyder.`,
      });
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Groep Verwyder Misluk",
        description: `Kon nie groep ${groupId} verwyder nie.`,
        variant: "destructive",
      });
    }
  };

  const handleAddAnnouncement = async (data: { title: string; content: string; category?: string }) => {
     console.log(`Attempting to add announcement`);
    try {
      const announcementsCollectionRef = collection(db, 'announcements');
       const newAnnouncementRef = await addDoc(announcementsCollectionRef, {
        title: data.title,
        content: data.content,
        category: data.category || "General",
        date: new Date(),
      });
       const newAnnouncement: Announcement = {
        id: newAnnouncementRef.id,
        title: data.title,
        content: data.content,
        category: data.category || "General",
        date: new Date(),
      };
      setAdminAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]);
      toast({
        title: "Aankondiging Gepos",
        description: `"${data.title}" is by die kennisgewingbord gevoeg.`,
      });
    } catch (error) {
      console.error("Error adding announcement:", error);
       toast({
        title: "Aankondiging Misluk",
        description: `Kon nie aankondiging plaas nie.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    console.log(`Attempting to delete announcement ${announcementId}`);
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
      setAdminAnnouncements(prevAnnouncements => prevAnnouncements.filter(ann => ann.id !== announcementId));
      toast({
        title: "Aankondiging Verwyder",
        description: "Die aankondiging is van die kennisgewingbord verwyder.",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
       toast({
        title: "Aankondiging Verwyder Misluk",
        description: `Kon nie aankondiging ${announcementId} verwyder nie.`,
        variant: "destructive",
      });
    }
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
