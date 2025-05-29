"use client"; 

import { useEffect, useState } from 'react';
import { Group, User } from '@/types'; //
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; //
import { Button } from '@/components/ui/button'; //
import { CalendarDays, Clock, Users, UserCircle, Tag, Mail, Phone, Repeat, Tv, Users2, MapPin, CheckCircle, XCircle, Info } from 'lucide-react';
import { auth, db } from '@/lib/firebase'; //
import { User as FirebaseUser } from 'firebase/auth';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast'; //
import { getCategoryDetails } from "@/lib/constants"; //
import Image from 'next/image';
// import { useRouter } from 'next/navigation';

interface GroupDetailClientProps {
  group: Group;
  initialLeader: User | null;
  initialMembers: User[];
}

export default function GroupDetailClient({ group: initialGroup, initialLeader, initialMembers }: GroupDetailClientProps) {
  const [group, setGroup] = useState<Group>(initialGroup);
  const [leader, setLeader] = useState<User | null>(initialLeader);
  const [members, setMembers] = useState<User[]>(initialMembers);
  
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isLoadingJoin, setIsLoadingJoin] = useState(false);
  const { toast } = useToast();
  // const router = useRouter();

  const primaryFocusDetails = getCategoryDetails(group.primaryFocus);
  const IconComponent = primaryFocusDetails?.icon;
  
  // Theme based on your site's primary dark blue color
  const pageBackgroundColor = "bg-primary";                 
  const mainTextColor = "text-primary-foreground";      // All text will use this    
  const mutedTextColor = "text-primary-foreground";         // Changed from text-neutral-400 to make ALL text white
  const iconColor = "text-primary-foreground";              
  const sectionTitleColor = "text-primary-foreground";
  const borderColor = "border-primary-foreground/30";       // Light, semi-transparent border

  // Button Styles
  // Normal: White bg, dark blue (primary) text & border
  // Hover: Dark blue (primary) bg, white (primary-foreground) text
  const themedButtonClasses = "bg-white text-primary border border-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-150";
  const themedButtonIconColor = "text-primary group-hover:text-primary-foreground transition-colors duration-150"; 

  const avatarFallbackBg = "bg-primary-foreground"; 
  const avatarFallbackText = "text-primary"; 


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setGroup(initialGroup);
    setLeader(initialLeader);
    setMembers(initialMembers);
  }, [initialGroup, initialLeader, initialMembers]);

  useEffect(() => {
    if (currentUser && group.members?.includes(currentUser.uid)) {
      setIsMember(true);
    } else {
      setIsMember(false);
    }
  }, [currentUser, group.members]);

  const handleJoinOrLeaveGroup = async () => {
    if (!currentUser) {
      toast({ title: "Aanmelding Vereis", description: "Jy moet aangemeld wees om by 'n groep aan te sluit of te verlaat.", variant: "destructive" });
      return;
    }
    if (!group.id) {
      toast({ title: "Fout", description: "Groep ID is onbekend.", variant: "destructive" });
      return;
    }
    setIsLoadingJoin(true);
    const groupDocRef = doc(db, 'groups', group.id);
    try {
      if (isMember) {
        await updateDoc(groupDocRef, { members: arrayRemove(currentUser.uid) });
        toast({ title: "Sukses", description: `Jy het die groep "${group.groupName}" verlaat.` });
        setMembers(prevMembers => prevMembers.filter(m => m.id !== currentUser.uid));
        setGroup(prevGroup => ({ ...prevGroup, currentMembers: Math.max(0, prevGroup.currentMembers - 1) }));
      } else {
        await updateDoc(groupDocRef, { members: arrayUnion(currentUser.uid) });
        toast({ title: "Sukses", description: `Jy het by die groep "${group.groupName}" aangesluit!` });
        const userProfileDocRef = doc(db, 'users', currentUser.uid);
        const userProfileSnap = await getDoc(userProfileDocRef);
        if (userProfileSnap.exists()) {
          const userProfile = { id: userProfileSnap.id, ...userProfileSnap.data() } as User;
          setMembers(prevMembers => [...prevMembers, userProfile]);
        } else {
          setMembers(prevMembers => [...prevMembers, { id: currentUser.uid, name: currentUser.displayName || 'Nuwe Lid', email: currentUser.email || undefined } as User]);
        }
        setGroup(prevGroup => ({ ...prevGroup, currentMembers: prevGroup.currentMembers + 1 }));
      }
      setIsMember(!isMember);
    } catch (error) {
      console.error("Error joining/leaving group: ", error);
      toast({ title: "Fout", description: "Kon nie die aksie voltooi nie. Probeer asseblief weer.", variant: "destructive" });
    } finally {
      setIsLoadingJoin(false);
    }
  };

  const handleContactLeader = () => {
    if (group.leaderContact?.includes('@')) {
      window.location.href = `mailto:${group.leaderContact}?subject=Navraag oor Kleingroep: ${group.groupName}`;
    } else if (group.leaderContact) {
      window.location.href = `tel:${group.leaderContact}`;
    } else {
      toast({title: "Kontak Inligting Ontbreek", description: "Die leier se kontak inligting is nie beskikbaar nie.", variant: "default"});
    }
  };

  const spotsLeft = group.capacity > 0 ? group.capacity - group.currentMembers : Infinity;
  const capacityText = group.capacity > 0 
    ? spotsLeft > 0 
      ? `${group.currentMembers} / ${group.capacity} (${spotsLeft} plekke oop)`
      : `${group.currentMembers} / ${group.capacity} (Vol)`
    : 'Onbeperk';

  return (
    <div className={`${pageBackgroundColor} shadow-xl rounded-lg overflow-hidden min-h-screen`}>
      {group.image && (
        <div className="relative w-full h-64 md:h-80">
          <Image src={group.image} alt={group.groupName} layout="fill" objectFit="cover" />
        </div>
      )}
      <div className="p-6 md:p-8">
        <div className={`flex items-center mb-6 ${!group.image ? 'py-4' : '' }`}>
            {IconComponent && <IconComponent className={`h-8 w-8 mr-3 ${iconColor}`} />}
            <h1 className={`text-3xl md:text-4xl font-bold ${mainTextColor}`}>{group.groupName}</h1>
        </div>
        
        {group.description && (
            <p className={`${mutedTextColor} mb-8 text-lg leading-relaxed`}>{group.description}</p>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 mb-8 pt-6 border-t ${borderColor}`}>
          {/* Column 1: Group Info */}
          <div className="space-y-4">
            <h2 className={`text-xl font-semibold ${sectionTitleColor} mb-3`}>Groep Inligting</h2>
            {primaryFocusDetails && (
              <div className={`flex items-start ${mutedTextColor}`}><Tag className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`} /><div><span className={`font-medium ${mainTextColor}`}>Kategorie:</span> {primaryFocusDetails.name}</div></div>
            )}
            {group.targetAudience && (
              <div className={`flex items-start ${mutedTextColor}`}><Users className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`} /><div><span className={`font-medium ${mainTextColor}`}>Doelgroep:</span> {group.targetAudience}</div></div>
            )}
            <div className={`flex items-start ${mutedTextColor}`}><Users className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`} /><div><span className={`font-medium ${mainTextColor}`}>Kapasiteit:</span> {capacityText}</div></div>
            <div className={`flex items-start ${mutedTextColor}`}> 
                {group.childcareAvailable ? 
                    <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-400 flex-shrink-0" /> : 
                    <XCircle className="h-5 w-5 mr-3 mt-1 text-red-400 flex-shrink-0" />
                }
                <div><span className={`font-medium ${mainTextColor}`}>Kinder Toesig:</span> {group.childcareAvailable ? 'Beskikbaar' : 'Nie Beskikbaar Nie'}</div>
            </div>
          </div>

          {/* Column 2: Meeting Details */}
          <div className="space-y-4">
            <h2 className={`text-xl font-semibold ${sectionTitleColor} mb-3`}>Bywoning Inligting</h2>
            {group.meetingDay && (
              <div className={`flex items-start ${mutedTextColor}`}><CalendarDays className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`} /><div><span className={`font-medium ${mainTextColor}`}>Dag:</span> {group.meetingDay}</div></div>
            )}
            {group.meetingTime && (
              <div className={`flex items-start ${mutedTextColor}`}><Clock className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`} /><div><span className={`font-medium ${mainTextColor}`}>Tyd:</span> {group.meetingTime}</div></div>
            )}
            {group.meetingFrequency && (
              <div className={`flex items-start ${mutedTextColor}`}><Repeat className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`} /><div><span className={`font-medium ${mainTextColor}`}>Frekwensie:</span> {group.meetingFrequency}</div></div>
            )}
            {group.meetingType && (
                <div className={`flex items-start ${mutedTextColor}`}> 
                    {group.meetingType === "Online" ? <Tv className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`}/> : group.meetingType === "Hybrid" ? <Users2 className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`}/> : <MapPin className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`}/>}
                    <div><span className={`font-medium ${mainTextColor}`}>Tipe:</span> {group.meetingType}</div>
                </div>
            )}
            {group.location && group.meetingType !== "Online" && (
              <div className={`flex items-start ${mutedTextColor}`}><MapPin className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`} /><div><span className={`font-medium ${mainTextColor}`}>Plek:</span> {group.location}</div></div>
            )}
          </div>

          {/* Column 3: Leader & Members */}
          <div className="space-y-3"> {/* Changed space-y-4 to space-y-3 to match original if needed */}
            <h2 className={`text-xl font-semibold ${sectionTitleColor} mb-2 border-b pb-2 ${borderColor}`}>Leier & Lede</h2>
            {leader && (
              <div className={`flex items-start ${mutedTextColor}`}><UserCircle className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`} /><div><span className={`font-medium ${mainTextColor}`}>Leier:</span> {leader.name} <br/> <span className={`text-xs ${mutedTextColor}`}>{leader.email}</span></div></div>
            )}
            {!leader && group.leaderName && (
                 <div className={`flex items-start ${mutedTextColor}`}><UserCircle className={`h-5 w-5 mr-3 mt-1 ${iconColor} flex-shrink-0`} /><div><span className={`font-medium ${mainTextColor}`}>Leier:</span> {group.leaderName}</div></div>
            )}
             <Button 
                size="sm" 
                onClick={handleContactLeader} 
                className={`w-full group ${themedButtonClasses}`}
            >
                {group.leaderContact?.includes('@') ? <Mail className={`mr-2 h-4 w-4 ${themedButtonIconColor}`} /> : <Phone className={`mr-2 h-4 w-4 ${themedButtonIconColor}`} />}
                Kontak Leier
            </Button>

            <div className="mt-4">
              <h3 className={`text-md font-semibold mb-2 ${mainTextColor}`}>Huidige Lede ({members.length}):</h3>
              <div className="flex flex-wrap gap-2">
                {members.map(member => (
                  <Avatar key={member.id} title={member.name} className="h-8 w-8">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback className={`${avatarFallbackBg} ${avatarFallbackText}`}>{member.name?.substring(0, 1).toUpperCase() || 'L'}</AvatarFallback>
                  </Avatar>
                ))}
                {members.length === 0 && <p className={`text-xs ${mutedTextColor}`}>Nog geen lede nie.</p>}
              </div>
            </div>
          </div>
        </div>
        
        {currentUser && ( 
          <div className={`mt-10 pt-6 border-t ${borderColor} flex justify-center`}>
            <Button 
              size="lg" 
              className={`min-w-[200px] group ${themedButtonClasses}`}
              onClick={handleJoinOrLeaveGroup}
              disabled={isLoadingJoin || (!isMember && group.capacity > 0 && group.currentMembers >= group.capacity) }
            >
              {isLoadingJoin ? 
                (isMember ? 'Besig om te verlaat...' : 'Besig om aan te sluit...') : 
                (isMember ? 'Verlaat Groep' : 
                  (group.capacity > 0 && group.currentMembers >= group.capacity ? 'Groep is Vol' : 'Sluit Aan by Groep'))
              }
            </Button>
          </div>
        )}
        {!currentUser && (
             <div className={`mt-10 pt-6 border-t ${borderColor} text-center`}>
                <p className={`${mutedTextColor} mb-2`}>Jy moet aangemeld wees om by hierdie groep aan te sluit.</p>
            </div>
        )}
         {group.expiryDate && (
            <p className={`text-center text-xs ${mutedTextColor} mt-8`}>
                <Clock className={`inline h-3 w-3 mr-1 ${iconColor}`}/> Hierdie groeplys verval op: {new Date(group.expiryDate).toLocaleDateString('af-ZA')}
            </p>
        )}
      </div>
    </div>
  );
}