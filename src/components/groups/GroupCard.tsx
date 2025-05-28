
import Link from 'next/link';
import Image from 'next/image';
import type { Group } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryDetails, PRIMARY_CATEGORY_VISUAL_COLORS } from '@/lib/constants';
import { MapPin, CalendarDays, Users, Sparkles, CheckCircle, XCircle } from 'lucide-react';

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  const primaryFocusDetails = getCategoryDetails(group.primaryFocus);
  const IconComponent = primaryFocusDetails?.icon || Sparkles;
  const categoryColorClass = PRIMARY_CATEGORY_VISUAL_COLORS[group.primaryFocus] || 'bg-primary';

  const spotsLeft = group.capacity - group.currentMembers;
  const capacityText = spotsLeft > 0 ? `${spotsLeft} plekke oop` : "Vol";

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
      <CardHeader className="p-0 relative">
        <div className={`w-full h-12 ${categoryColorClass} flex items-center justify-center`}>
          <IconComponent className="h-6 w-6 text-primary-foreground" />
        </div>
        {group.image && (
          <div className="aspect-[16/9] overflow-hidden">
            <Image
              src={group.image}
              alt={group.groupName}
              width={600}
              height={400}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${group.primaryFocus} group people`}
            />
          </div>
        )}
        <div className="p-6 pb-2">
            <CardTitle className="text-xl font-semibold leading-tight mb-1">
              <Link href={`/groups/${group.id}`} className="hover:text-background transition-colors">
                {group.groupName}
              </Link>
            </CardTitle>
            {primaryFocusDetails && (
              <Badge variant="secondary" className={`mb-2 ${categoryColorClass} text-primary-foreground`}>
                {primaryFocusDetails.name}
              </Badge>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow px-6 pb-4 space-y-2">
        <div className="flex items-center text-sm text-foreground">
          <MapPin className="h-4 w-4 mr-2 shrink-0" />
          <span>{group.location}</span>
        </div>
        <div className="flex items-center text-sm text-foreground">
          <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
          <span>{group.meetingDay}, {group.meetingTime} ({group.meetingFrequency})</span>
        </div>
        <div className="flex items-center text-sm text-foreground">
          <Users className="h-4 w-4 mr-2 shrink-0" />
          <span>{group.targetAudience} &bull; {group.capacity} Persone ({capacityText})</span>
        </div>
        {group.childcareAvailable !== undefined && (
           <div className="flex items-center text-sm text-foreground">
            {group.childcareAvailable ? <CheckCircle className="h-4 w-4 mr-2 text-green-500 shrink-0" /> : <XCircle className="h-4 w-4 mr-2 text-red-500 shrink-0" />}
            <span>Kinder toesig {group.childcareAvailable ? 'beskikbaar' : 'nie beskikbaar nie'}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-6 pb-6">
        <Button asChild className="w-full bg-background text-foreground hover:bg-background/90 border border-primary">
          <Link href={`/groups/${group.id}`}>Meer Inligting</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
