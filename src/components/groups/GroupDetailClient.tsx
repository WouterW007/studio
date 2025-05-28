
"use client";

import type { Group } from "@/types";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Users, MapPin, CalendarDays, CheckCircle, XCircle, Info, UserCircle, Clock, Repeat, Tv, Users2 } from "lucide-react";
import { getCategoryDetails, PRIMARY_CATEGORY_VISUAL_COLORS } from "@/lib/constants";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupDetailClientProps {
  group: Group;
}

export default function GroupDetailClient({ group }: GroupDetailClientProps) {
  const primaryFocusDetails = getCategoryDetails(group.primaryFocus);
  const IconComponent = primaryFocusDetails?.icon;
  const categoryColorClass = PRIMARY_CATEGORY_VISUAL_COLORS[group.primaryFocus] || 'bg-primary';

  const handleContactLeader = () => {
    // Basic mailto/tel link. Could be a modal form in a real app.
    if (group.leaderContact.includes('@')) {
      window.location.href = `mailto:${group.leaderContact}?subject=Navraag oor Kleingroep: ${group.groupName}`;
    } else {
      // Basic check; for more robust phone number detection, a library might be needed.
      // This assumes if it's not an email, it's a phone number.
      window.location.href = `tel:${group.leaderContact}`;
    }
  };
  
  const spotsLeft = group.capacity - group.currentMembers;
  const capacityText = spotsLeft > 0 
    ? `${group.currentMembers} / ${group.capacity} (${spotsLeft} plekke oop)`
    : `${group.currentMembers} / ${group.capacity} (Vol)`;

  return (
    <Card className="overflow-hidden shadow-xl">
       {group.image && (
        <div className="relative w-full h-64 md:h-80 bg-muted">
          <Image
            src={group.image}
            alt={group.groupName}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
            data-ai-hint={`${group.primaryFocus} group activity`}
          />
           <div className={`absolute top-0 left-0 w-full h-16 ${categoryColorClass} bg-opacity-70 flex items-center px-6`}>
            {IconComponent && <IconComponent className="h-8 w-8 text-primary-foreground mr-3" />}
            <CardTitle className="text-3xl font-bold text-primary-foreground">{group.groupName}</CardTitle>
          </div>
        </div>
      )}
      {!group.image && (
         <div className={`w-full p-6 ${categoryColorClass} flex items-center`}>
            {IconComponent && <IconComponent className="h-8 w-8 text-primary-foreground mr-3" />}
            <CardTitle className="text-3xl font-bold text-primary-foreground">{group.groupName}</CardTitle>
          </div>
      )}

      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Main Details */}
          <div className="md:col-span-2 space-y-4">
            {primaryFocusDetails && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Primêre Fokus:</span>
                <Badge variant="default" className={`${categoryColorClass} text-primary-foreground`}>
                  {IconComponent && <IconComponent className="h-4 w-4 mr-1.5" />}
                  {primaryFocusDetails.name}
                </Badge>
              </div>
            )}
            {group.secondaryFocus && group.secondaryFocus.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Sekondêre Fokus:</span>
                {group.secondaryFocus.map(sfKey => {
                  const sfDetails = getCategoryDetails(sfKey);
                  return sfDetails ? (
                    <Badge key={sfKey} variant="outline">
                      {sfDetails.icon && <sfDetails.icon className="h-3 w-3 mr-1" />}
                      {sfDetails.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            {group.description && (
              <div className="space-y-1">
                <h3 className="font-semibold text-lg flex items-center"><Info className="h-5 w-5 mr-2 text-primary"/>Oor hierdie kleingroep</h3>
                <p className="text-muted-foreground leading-relaxed">{group.description}</p>
              </div>
            )}
          </div>

          {/* Column 2: Meta Info */}
          <div className="space-y-3 md:border-l md:pl-6 border-border">
             <h3 className="font-semibold text-lg flex items-center"><UserCircle className="h-5 w-5 mr-2 text-primary"/>Leier Inligting</h3>
            <p className="flex items-center"><strong className="w-28 shrink-0">Naam:</strong> {group.leaderName}</p>
            <Button onClick={handleContactLeader} variant="outline" className="w-full">
              {group.leaderContact.includes('@') ? <Mail className="mr-2 h-4 w-4" /> : <Phone className="mr-2 h-4 w-4" />}
              Kontak Leier
            </Button>
            
            <h3 className="font-semibold text-lg mt-4 flex items-center"><CalendarDays className="h-5 w-5 mr-2 text-primary"/>Bywoning</h3>
            <p className="flex items-center"><strong className="w-28 shrink-0">Dag:</strong> {group.meetingDay}</p>
            <p className="flex items-center"><Clock className="inline h-4 w-4 mr-1.5 text-muted-foreground"/> <strong className="w-24 shrink-0">Tyd:</strong> {group.meetingTime}</p>
            <p className="flex items-center"><Repeat className="inline h-4 w-4 mr-1.5 text-muted-foreground"/> <strong className="w-24 shrink-0">Frekwensie:</strong> {group.meetingFrequency}</p>
            <p className="flex items-center">
              {group.meetingType === "Online" ? <Tv className="inline h-4 w-4 mr-1.5 text-muted-foreground"/> : group.meetingType === "Hybrid" ? <Users2 className="inline h-4 w-4 mr-1.5 text-muted-foreground"/> : <MapPin className="inline h-4 w-4 mr-1.5 text-muted-foreground"/>}
              <strong className="w-24 shrink-0">Tipe:</strong> {group.meetingType}
            </p>
             {group.meetingType !== "Online" && <p className="flex items-center"><MapPin className="inline h-4 w-4 mr-1.5 text-muted-foreground"/> <strong className="w-24 shrink-0">Plek:</strong> {group.location}</p>}

            <h3 className="font-semibold text-lg mt-4 flex items-center"><Users className="h-5 w-5 mr-2 text-primary"/>Wie's Welkom?</h3>
            <p className="flex items-center"><strong className="w-28 shrink-0">Teikengehoor:</strong> {group.targetAudience}</p>
            <p className="flex items-center"><strong className="w-28 shrink-0">Kapasiteit:</strong> {capacityText}</p>
            <div className="flex items-center">
              <strong className="w-28 shrink-0">Kinder Toesig:</strong>
              {group.childcareAvailable ? 
                <span className="flex items-center text-green-500"><CheckCircle className="h-4 w-4 mr-1.5" /> Ja</span> : 
                <span className="flex items-center text-red-500"><XCircle className="h-4 w-4 mr-1.5" /> Nee</span>
              }
            </div>
            {group.expiryDate && (
              <p className="flex items-center text-sm text-amber-600 dark:text-amber-400 mt-2">
                <Clock className="h-4 w-4 mr-1.5"/> Groeplys verval op: {new Date(group.expiryDate).toLocaleDateString('af-ZA')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
