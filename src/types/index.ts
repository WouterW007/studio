import type { LucideIcon } from 'lucide-react';

// Define User interface
export interface User {
  id: string;
  name: string;
  email?: string;
  isAdmin?: boolean;
  avatarUrl?: string; // For profile pictures
  // other fields...
}

export interface Group {
  id: string;
  leaderName: string; // This can remain for quick display if leaderId isn't resolved
  leaderContact: string; 
  groupName: string;
  meetingDay: MeetingDay;
  meetingTime: MeetingTime;
  meetingFrequency: string; 
  meetingType: MeetingType; 
  targetAudience: TargetAudience;
  childcareAvailable: boolean;
  location: string; 
  primaryFocus: FocusCategoryKey;
  secondaryFocus?: FocusCategoryKey[]; 
  capacity: number;
  currentMembers: number; 
  description?: string;
  expiryDate?: Date;
  status: "pending" | "active" | "rejected"; 
  image?: string; 
  // Added fields for leader and members linking to User collection
  leaderId: string; // Store ID of the leader (from 'users' collection)
  members: string[]; // Array of user IDs (from 'users' collection)
  createdAt?: any; // Firestore Timestamp or Date (as per your example)
  // Optional: category field as per your example if different from primaryFocus
  category?: string; // Example: GroupCategory type or string
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: Date;
  category?: string; 
}

export type MeetingDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
export type MeetingTime = "Morning" | "Afternoon" | "Evening" | "Anytime";
export type MeetingType = "Physical" | "Online" | "Hybrid";
export type TargetAudience = "Men" | "Women" | "Mixed Adults" | "Young Adults (18-25)" | "Youth (12-17)" | "Seniors (60+)" | "Families" | "Anyone";

export type FocusCategoryKey = 
  | "bible-study" 
  | "prayer" 
  | "discipleship" 
  | "outreach"
  | "marriage"
  | "parenting"
  | "finances"
  | "career"
  | "social"
  | "support"
  | "creative-arts"
  | "sports-fitness";

export interface FocusCategory {
  key: FocusCategoryKey;
  name: string;
  icon: LucideIcon;
  color: string; 
  description?: string;
}

export interface FilterOptions {
  area?: string;
  primaryFocus?: FocusCategoryKey;
  targetAudience?: TargetAudience;
  meetingDay?: MeetingDay;
  meetingTime?: MeetingTime;
  meetingType?: MeetingType;
  childcare?: "yes" | "no" | "any";
}

// Optional: Define GroupCategory enum if it's different from FocusCategoryKey
// export enum GroupCategory {
//   Faith = "Faith",
//   Community = "Community",
//   Support = "Support",
//   // ... other categories
// }
