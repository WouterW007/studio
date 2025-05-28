
import type { FocusCategory, MeetingDay, MeetingTime, MeetingType, TargetAudience, FocusCategoryKey } from "@/types";
import { BookOpen, HandHeart, UsersRound, Send, HeartHandshake, Baby, Landmark, Briefcase, Smile, MessageSquareHeart, Palette, Dumbbell } from "lucide-react";

export const APP_NAME = "Kleingroepe";

export const MEETING_DAYS: MeetingDay[] = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrydag", "Saterdag", "Sondag"];
export const MEETING_TIMES: MeetingTime[] = ["Oggend", "Middag", "Aand", "Enige tyd"];
export const MEETING_TYPES: MeetingType[] = ["in persoon", "aanlyn"];
export const MEETING_FREQUENCIES: string[] = ["Weekliks", "Maandeliks"];
export const TARGET_AUDIENCES: TargetAudience[] = ["Mans", "Vroue", "Gemengde Volwassenes", "Jong Volwassenes (18-25)", "Jeug (12-17)", "Seniors (60+)", "Gesinne"];
export const AREAS: string[] = ["Langenhovenpark", "Universitas", "Westdene", "Brandwag", "Fichardtpark", "Pellissier", "Wilgehof", "Gardenia Park"];


export const CATEGORY_COLORS = {
  blue: "text-blue-500", // For icon color
  red: "text-red-500",
  purple: "text-purple-500",
  yellow: "text-yellow-500", // The category yellow, not theme primary
  pink: "text-pink-500",
  green: "text-green-500",
  orange: "text-orange-500",
  teal: "text-teal-500",
  cyan: "text-cyan-500",
};

// Define specific colors for the 4 main visual categories as requested
export const PRIMARY_CATEGORY_VISUAL_COLORS: Record<string, string> = {
  "vryheid": "bg-blue-500 hover:bg-blue-600", // Blue
  "mekaar": "bg-red-500 hover:bg-red-600",       // Red
  "geestelike-groei": "bg-purple-500 hover:bg-purple-600", // Purple
  "gaan": "bg-yellow-500 hover:bg-yellow-600",   // Yellow
};


export const FOCUS_CATEGORIES: FocusCategory[] = [
  { key: "vryheid", name: "Vryheid Groep", icon: BookOpen, color: CATEGORY_COLORS.blue, description: "Verdieping in God se Woord." },
  { key: "mekaar", name: "Mekaar Groep", icon: HandHeart, color: CATEGORY_COLORS.red, description: "Saam bid vir mekaar en die wêreld." },
  { key: "geestelike-groei", name: "Geestelike Groei", icon: UsersRound, color: CATEGORY_COLORS.purple, description: "Groei in geloof en volgelingskap." },
  { key: "gaan", name: "Gaan Groep", icon: Send, color: CATEGORY_COLORS.yellow, description: "Impak maak in die gemeenskap." },
];

export const getCategoryDetails = (key?: FocusCategoryKey): FocusCategory | undefined => {
  if (!key) return undefined;
  return FOCUS_CATEGORIES.find(cat => cat.key === key);
};

    
