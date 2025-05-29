// src/app/groups/[id]/page.tsx
import { doc, getDoc, collection, documentId, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Group, User } from '@/types'; // Make sure User type is imported
import GroupDetailClient from '@/components/groups/GroupDetailClient';
import { notFound } from 'next/navigation';
// REMOVED: import { mockUsers } from '@/data/mockData'; (Ensured it's not here)

export const dynamic = 'force-dynamic'; // Ensures dynamic rendering

interface GroupDetailPageProps {
  params: {
    id: string;
  };
}

// Helper to safely convert Firestore data to Group, handling Timestamps and missing fields
function safeConvertFirestoreDataToGroup(id: string, data: any): Group {
  return {
    id: id,
    groupName: data.groupName || 'Onbekende Groep',
    leaderName: data.leaderName || 'Onbekende Leier', // Keep for fallback
    leaderId: data.leaderId || '', // Ensure leaderId is string
    leaderContact: data.leaderContact || '',
    meetingDay: data.meetingDay || 'Enige Dag',
    meetingTime: data.meetingTime || 'Enige Tyd',
    meetingFrequency: data.meetingFrequency || 'Onbekend',
    meetingType: data.meetingType || 'Onbekend',
    targetAudience: data.targetAudience || 'Almal',
    childcareAvailable: data.childcareAvailable === true, // Ensure boolean
    location: data.location || 'Onbekend',
    primaryFocus: data.primaryFocus || 'algemeen',
    secondaryFocus: Array.isArray(data.secondaryFocus) ? data.secondaryFocus : [],
    capacity: typeof data.capacity === 'number' ? data.capacity : 0,
    currentMembers: typeof data.currentMembers === 'number' ? data.currentMembers : 0, // This will be derived from members.length later
    description: data.description || '',
    expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate() : undefined,
    status: data.status || 'pending',
    image: data.image || undefined,
    members: Array.isArray(data.members) ? data.members : [], // Ensure members is an array of strings
    category: data.category || data.primaryFocus || 'algemeen', // Fallback for category
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
  } as Group;
}

// Helper to safely convert Firestore data to User
function safeConvertFirestoreDataToUser(id: string, data: any): User {
  return {
    id: id,
    name: data.name || 'Onbekende Gebruiker',
    email: data.email || undefined,
    isAdmin: data.isAdmin === true,
    avatarUrl: data.avatarUrl || undefined,
  };
}

async function getGroupAndUserDetails(id: string): Promise<{ group: Group; leader: User | null; members: User[] } | null> {
  try {
    // Fetch group document
    const groupDocRef = doc(db, 'groups', id);
    const groupDocSnap = await getDoc(groupDocRef);

    if (!groupDocSnap.exists()) {
      console.warn(`Group with ID ${id} not found.`);
      return null;
    }
    const groupData = safeConvertFirestoreDataToGroup(groupDocSnap.id, groupDocSnap.data());

    let leader: User | null = null;
    let members: User[] = [];

    // Fetch leader details
    if (groupData.leaderId) {
      const leaderDocRef = doc(db, 'users', groupData.leaderId);
      const leaderDocSnap = await getDoc(leaderDocRef);
      if (leaderDocSnap.exists()) {
        leader = safeConvertFirestoreDataToUser(leaderDocSnap.id, leaderDocSnap.data());
      } else { // <<< FIX: Corrected the syntax error here
        console.warn(`Leader with ID ${groupData.leaderId} not found for group ${id}.`);
      }
    }

    // Fetch member details (if groupData.members is an array of IDs)
    if (groupData.members && groupData.members.length > 0) {
      const validMemberIds = groupData.members.filter(memberId => typeof memberId === 'string' && memberId.trim() !== '');
      if (validMemberIds.length > 0) {
        const membersQuery = query(collection(db, 'users'), where(documentId(), 'in', validMemberIds));
        const membersSnapshot = await getDocs(membersQuery);
        membersSnapshot.forEach(memberDoc => {
          if (memberDoc.exists()) {
            members.push(safeConvertFirestoreDataToUser(memberDoc.id, memberDoc.data()));
          }
        });
      }
    }
    // Update groupData.currentMembers based on the actual fetched members count
    groupData.currentMembers = members.length;

    return { group: groupData, leader, members };

  } catch (error) {
    console.error(`Error fetching group and user details for group ID ${id}:`, error);
    if (error instanceof Error && error.message.includes("Invalid Query. A non-empty array is required for 'in' filters.")) {
        console.error("The members array for the group might be empty or contain invalid IDs.");
    }
    return null;
  }
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const groupDetails = await getGroupAndUserDetails(params.id);

  if (!groupDetails) {
    notFound();
  }

  const { group, leader, members } = groupDetails;

  return (
    <div className="container mx-auto px-4 py-8">
      <GroupDetailClient group={group} initialLeader={leader} initialMembers={members} />
    </div>
  );
}

export async function generateMetadata({ params }: GroupDetailPageProps) {
  const groupDetails = await getGroupAndUserDetails(params.id); 
  if (!groupDetails) {
    return {
      title: 'Groep Nie Gevind Nie',
    };
  }
  return {
    title: groupDetails.group.groupName || 'Groep Detail',
    description: groupDetails.group.description || 'Besonderhede vir hierdie groep.',
  };
}
