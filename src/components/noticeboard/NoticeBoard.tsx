
import type { Announcement } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Megaphone, CalendarClock, Zap } from 'lucide-react'; // Zap for "Group Needs"

interface NoticeBoardProps {
  announcements: Announcement[];
}

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'event':
      return <CalendarClock className="h-4 w-4 mr-1.5 text-blue-500" />;
    case 'training':
      return <Zap className="h-4 w-4 mr-1.5 text-purple-500" />; // Using Zap for training
    case 'group needs':
      return <Megaphone className="h-4 w-4 mr-1.5 text-orange-500" />; // Using Megaphone for needs
    default:
      return <Megaphone className="h-4 w-4 mr-1.5 text-gray-500" />;
  }
};

export default function NoticeBoard({ announcements }: NoticeBoardProps) {
  if (!announcements || announcements.length === 0) {
    return null; // Don't render if no announcements
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          <Megaphone className="h-6 w-6 mr-3 text-primary" />
          Kennisgewingbord
        </CardTitle>
        <CardDescription>Bly op hoogte van die nuutste aankondigings en geleenthede.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72"> {/* Max height with scroll */}
          <div className="space-y-4 pr-4">
            {announcements.map(announcement => (
              <div 
                key={announcement.id} 
                className="p-4 border border-border rounded-lg bg-teal-600 hover:bg-background transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-md">{announcement.title}</h4>
                  {announcement.category && (
                    <Badge variant="outline" className="text-xs flex items-center">
                       {getCategoryIcon(announcement.category)}
                      {announcement.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-foreground mb-2">{announcement.content}</p>
                <p className="text-xs text-foreground/70">
                  Gepos: {new Date(announcement.date).toLocaleDateString('af-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

