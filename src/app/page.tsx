import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Group, Announcement } from '@/types';

// Import the new Client Component
import HomePageClient from '@/components/HomePageClient';

// Helper function to fetch active groups from Firestore
async function getActiveGroups(): Promise<Group[]> {
  try {
    const groupsCollectionRef = collection(db, 'groups');
    // Query for groups with status "active"
    const q = query(groupsCollectionRef, where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    
    const groups: Group[] = [];
    querySnapshot.forEach((doc) => {
      // Ensure data conforms to Group type, handle potential missing fields
      const data = doc.data();
      groups.push({
        id: doc.id,
        groupName: data.groupName || '',
        leaderName: data.leaderName || '',
        leaderContact: data.leaderContact || '',
        meetingDay: data.meetingDay || 'Any', // Provide defaults or handle errors
        meetingTime: data.meetingTime || 'Anytime', // Provide defaults or handle errors
        meetingFrequency: data.meetingFrequency || '',
        meetingType: data.meetingType || 'Physical', // Provide defaults
        targetAudience: data.targetAudience || 'Anyone', // Provide defaults
        childcareAvailable: data.childcareAvailable || false,
        location: data.location || '',
        primaryFocus: data.primaryFocus || 'social', // Provide defaults
        secondaryFocus: data.secondaryFocus || [],
        capacity: data.capacity || 0,
        currentMembers: data.currentMembers || 0,
        description: data.description || '',
        // Convert Firestore Timestamp to Date, handle cases where it might not be a Timestamp
        expiryDate: data.expiryDate && typeof data.expiryDate.toDate === 'function' ? data.expiryDate.toDate() : undefined,
        status: data.status || 'pending', // Provide defaults
        image: data.image || undefined,
      } as Group);
    });
    return groups;
  } catch (error) {
    console.error("Error fetching active groups: ", error);
    return []; // Return an empty array in case of error
  }
}

// Helper function to fetch announcements from Firestore
async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const announcementsCollectionRef = collection(db, 'announcements');
    // Order announcements by date, newest first
    // Note: Requires an index in Firestore for ordering if not by default document ID
    // const q = query(announcementsCollectionRef, orderBy('date', 'desc'));
    // For simplicity, fetching without order here, will sort in component
    const querySnapshot = await getDocs(announcementsCollectionRef);

    const announcements: Announcement[] = [];
    querySnapshot.forEach((doc) => {
       const data = doc.data();
      announcements.push({
        id: doc.id,
        title: data.title || '',
        content: data.content || '',
        // Convert Firestore Timestamp to Date, handle cases where it might not be a Timestamp
        date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate() : new Date(),
        category: data.category || undefined,
      } as Announcement);
    });
     // Sort by date, newest first (optional but recommended)
    announcements.sort((a, b) => b.date.getTime() - a.date.getTime());
    return announcements;
  } catch (error) {
    console.error("Error fetching announcements: ", error);
    return [];
  }
}

// This is a Server Component that fetches data and renders the Client Component
export default async function GroupDirectoryPage() {
  // Fetch data directly on the server
  const groups = await getActiveGroups();
  const announcements = await getAnnouncements();

  return (
    // Render the Client Component and pass the fetched data as props
    <HomePageClient initialGroups={groups} initialAnnouncements={announcements} />
  );
}
