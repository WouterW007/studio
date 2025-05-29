
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/AdminTable';
import { collection, getDocs, query, doc, updateDoc, deleteDoc, addDoc, orderBy, writeBatch } from 'firebase/firestore'; // Import necessary Firestore functions
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import type { Group, Announcement } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, Megaphone, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingGroups, setPendingGroups] = useState<Group[]>([]);
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

          // Fetch pending groups from Firestore
          const pendingGroupsCollectionRef = collection(db, 'pendingGroups');
          const pendingGroupSnapshot = await getDocs(pendingGroupsCollectionRef);
          const pendingGroupsData = pendingGroupSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<Group, 'id'>
          }));
          setPendingGroups(pendingGroupsData);

          // Fetch announcements from Firestore, ordered by date descending
          const announcementsCollectionRef = collection(db, 'announcements');
          const qAnnouncements = query(announcementsCollectionRef, orderBy('date', 'desc'));
          const announcementSnapshot = await getDocs(qAnnouncements);
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
            description: "Could not load admin data. Check Firestore rules and connectivity.",
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

  const handleUpdateStatus = async (groupId: string, status: Group['status'], currentSource: 'groups' | 'pendingGroups') => {
    console.log(`Attempting to update group ${groupId} to status ${status} from ${currentSource}`);
    try {
      const batch = writeBatch(db);
      const targetGroupRef = doc(db, 'groups', groupId); // Always move to/update in 'groups' collection

      if (currentSource === 'pendingGroups') {
        if (status === 'active') { // Approving a pending group
          const pendingGroupDoc = pendingGroups.find(g => g.id === groupId);
          if (pendingGroupDoc) {
            const { id, ...groupData } = pendingGroupDoc; // eslint-disable-line @typescript-eslint/no-unused-vars
            batch.set(targetGroupRef, { ...groupData, status: 'active' });
            batch.delete(doc(db, 'pendingGroups', groupId));
            await batch.commit();

            setPendingGroups(prev => prev.filter(g => g.id !== groupId));
            setGroups(prev => [...prev, { ...pendingGroupDoc, status: 'active'}]);
            toast({
              title: "Group Approved",
              description: `Group ${groupId} has been approved and moved to active groups.`,
              variant: "default",
              action: <CheckCircle className="text-green-500" />
            });
          }
        } else if (status === 'rejected' || status === 'pending') { // Rejecting or simply moving a pending group (should not happen for 'pending')
           // For now, just delete from pending if rejected. If it needs to go to 'groups' with 'rejected' status, adjust logic.
          await deleteDoc(doc(db, 'pendingGroups', groupId));
          setPendingGroups(prev => prev.filter(g => g.id !== groupId));
           toast({
            title: "Group Rejected",
            description: `Pending group ${groupId} has been rejected and removed.`,
            variant: "default",
             action: <XCircle className="text-red-500" />
          });
        }
      } else { // Updating status of an already active/rejected group in 'groups' collection
        await updateDoc(targetGroupRef, { status });
        setGroups(prevGroups =>
          prevGroups.map(group =>
            group.id === groupId ? { ...group, status } : group
          )
        );
        toast({
            title: "Status Opgedateer",
            description: `Groep status suksesvol verander na ${status}.`,
          });
      }
    } catch (error) {
      console.error("Error updating group status:", error);
       toast({
          title: "Status Update Failed",
          description: `Kon nie groep ${groupId} status opdateer nie. Error: ${(error as Error).message}`,
          variant: "destructive",
        });
    }
  };

  const handleDeleteGroup = async (groupId: string, from: 'groups' | 'pendingGroups') => {
    console.log(`Attempting to delete group ${groupId} from ${from}`);
    const collectionName = from;
    try {
      await deleteDoc(doc(db, collectionName, groupId));
      if (from === 'groups') {
        setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
      } else {
        setPendingGroups(prevPendingGroups => prevPendingGroups.filter(group => group.id !== groupId));
      }
      toast({
        title: "Groep Verwyder",
        description: `Groep ${groupId} is suksesvol verwyder van ${collectionName}.`,
      });
    } catch (error) {
      console.error(`Error deleting group from ${collectionName}:`, error);
      toast({
        title: "Groep Verwyder Misluk",
        description: `Kon nie groep ${groupId} van ${collectionName} verwyder nie.`,
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
        date: new Date(), // Firestore will convert this to Timestamp
      });
       const newAnnouncement: Announcement = {
        id: newAnnouncementRef.id,
        title: data.title,
        content: data.content,
        category: data.category || "General",
        date: new Date(),
      };
      setAdminAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]); // Add to the beginning of the list
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

  // if (isLoadingData) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
  //       <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
  //       <p className="text-xl text-muted-foreground">Laai admin paneel data...</p>
  //     </div>
  //   );
  // }

  const allGroupsForTable = [
    ...pendingGroups.map(g => ({ ...g, sourceType: 'pendingGroups' as const})),
    ...groups.map(g => ({ ...g, sourceType: 'groups' as const}))
  ];

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
                  Bestuur Kleingroep registrasies (Hangende en Aktief) en Kennisgewingbord.
                </CardDescription>
              </div>
            </div>
             {/* Add a logout button here if not already in AdminTable */}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
              <p className="text-muted-foreground">Laai groepdata...</p>
            </div>
          ) : (
            <AdminTable 
              groups={allGroupsForTable}
              onUpdateStatus={handleUpdateStatus} 
              onDeleteGroup={handleDeleteGroup}
              onLogout={handleLogout} // Ensure AdminTable has a prop for logout or handle it here
            />
          )}
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
           {isLoadingData && adminAnnouncements.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
              <p className="text-muted-foreground">Laai aankondigings...</p>
            </div>
          ) : (
            <AnnouncementManager
              announcements={adminAnnouncements}
              onAddAnnouncement={handleAddAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
