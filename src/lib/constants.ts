import type { FocusCategory, MeetingDay, MeetingTime, MeetingType, TargetAudience, FocusCategoryKey } from "@/types";
import { BookOpen, HandHeart, UsersRound, Send, HeartHandshake, Baby, Landmark, Briefcase, Smile, MessageSquareHeart, Palette, Dumbbell } from "lucide-react";

export const APP_NAME = "Gaan Groepe Directory";

export const MEETING_DAYS: MeetingDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MEETING_TIMES: MeetingTime[] = ["Morning", "Afternoon", "Evening", "Anytime"];
export const MEETING_TYPES: MeetingType[] = ["Physical", "Online", "Hybrid"];
export const MEETING_FREQUENCIES: string[] = ["Weekly", "Bi-weekly", "Monthly", "Fortnightly"];
export const TARGET_AUDIENCES: TargetAudience[] = ["Anyone", "Men", "Women", "Mixed Adults", "Young Adults (18-25)", "Youth (12-17)", "Seniors (60+)", "Families"];

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
  "bible-study": "bg-blue-500 hover:bg-blue-600", // Blue
  "prayer": "bg-red-500 hover:bg-red-600",       // Red
  "discipleship": "bg-purple-500 hover:bg-purple-600", // Purple
  "outreach": "bg-yellow-500 hover:bg-yellow-600",   // Yellow
};


export const FOCUS_CATEGORIES: FocusCategory[] = [
  { key: "bible-study", name: "Bybelstudie", icon: BookOpen, color: CATEGORY_COLORS.blue, description: "Verdieping in God se Woord." },
  { key: "prayer", name: "Gebed", icon: HandHeart, color: CATEGORY_COLORS.red, description: "Saam bid vir mekaar en die wêreld." },
  { key: "discipleship", name: "Dissipelskap", icon: UsersRound, color: CATEGORY_COLORS.purple, description: "Groei in geloof en volgelingskap." },
  { key: "outreach", name: "Uitreik", icon: Send, color: CATEGORY_COLORS.yellow, description: "Impak maak in die gemeenskap." },
  { key: "marriage", name: "Huwelik", icon: HeartHandshake, color: CATEGORY_COLORS.pink, description: "Versterking en groei vir getroude pare." },
  { key: "parenting", name: "Ouerskap", icon: Baby, color: CATEGORY_COLORS.green, description: "Ondersteuning en wysheid vir ouers." },
  { key: "finances", name: "Finansies", icon: Landmark, color: CATEGORY_COLORS.orange, description: "Bybelse beginsels vir finansiële bestuur." },
  { key: "career", name: "Werk & Loopbaan", icon: Briefcase, color: CATEGORY_COLORS.teal, description: "Geloof en werk integreer." },
  { key: "social", name: "Sosiaal & Konneksie", icon: Smile, color: CATEGORY_COLORS.cyan, description: "Gemeenskap bou en verhoudings versterk." },
  { key: "support", name: "Ondersteuning & Herstel", icon: MessageSquareHeart, color: "text-indigo-500", description: "Ondersteuning deur moeilike tye." },
  { key: "creative-arts", name: "Kreatiewe Kunste", icon: Palette, color: "text-lime-500", description: "Uitdrukking van geloof deur kreatiwiteit."},
  { key: "sports-fitness", name: "Sport & Fiksheid", icon: Dumbbell, color: "text-amber-500", description: "Gemeenskap deur fisiese aktiwiteit."}
];

export const getCategoryDetails = (key?: FocusCategoryKey): FocusCategory | undefined => {
  if (!key) return undefined;
  return FOCUS_CATEGORIES.find(cat => cat.key === key);
};
