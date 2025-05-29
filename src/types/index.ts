import type { LucideIcon } from 'lucide-react';

export interface Group {
  id: string;
  leaderName: string;
  leaderContact: string; // Could be email or phone
  groupName: string;
  meetingDay: MeetingDay;
  meetingTime: MeetingTime;
  meetingFrequency: string; // e.g., "Weekly", "Bi-weekly", "Monthly"
  meetingType: MeetingType; // "Physical" | "Online"
  targetAudience: TargetAudience;
  childcareAvailable: boolean;
  location: string; // Area or specific address
  primaryFocus: FocusCategoryKey;
  secondaryFocus?: FocusCategoryKey[]; // Optional, can be multiple
  capacity: number;
  currentMembers: number; // For display like "8/10 spots"
  description?: string;
  expiryDate?: Date;
  status: "pending" | "active" | "rejected"; // For admin - Standardized
  image?: string; // Optional image URL for the group
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: Date;
  category?: string; // e.g., "Group Needs", "Training", "Event"
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
  color: string; // Tailwind color class or HSL string
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
