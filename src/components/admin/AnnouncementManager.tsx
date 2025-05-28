
"use client";

import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Announcement } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ANNOUNCEMENT_CATEGORIES } from '@/lib/constants';
import { Trash2, PlusCircle, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AnnouncementManagerProps {
  announcements: Announcement[];
  onAddAnnouncement: (data: { title: string; content: string; category?: string }) => Promise<void>;
  onDeleteAnnouncement: (announcementId: string) => Promise<void>;
}

const announcementFormSchema = z.object({
  title: z.string().min(3, "Titel moet ten minste 3 karakters lank wees."),
  content: z.string().min(10, "Inhoud moet ten minste 10 karakters lank wees."),
  category: z.string().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export default function AnnouncementManager({ announcements, onAddAnnouncement, onDeleteAnnouncement }: AnnouncementManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      content: '',
      category: ANNOUNCEMENT_CATEGORIES[ANNOUNCEMENT_CATEGORIES.length -1], // Default to 'General' or last category
    },
  });

  const handleFormSubmit = async (data: AnnouncementFormValues) => {
    setIsSubmitting(true);
    await onAddAnnouncement(data);
    form.reset();
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDeleteAnnouncement(id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card text-card-foreground border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Voeg Nuwe Aankondiging By</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground">Titel</FormLabel>
                    <FormControl>
                      <Input placeholder="Aankondiging titel..." {...field} className="bg-background text-foreground border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground">Inhoud</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Volledige aankondiging teks..." {...field} className="bg-background text-foreground border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground">Kategorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background text-foreground border-input">
                          <SelectValue placeholder="Kies 'n kategorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover text-popover-foreground border-border">
                        {ANNOUNCEMENT_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-background text-foreground hover:bg-background/90 border border-primary" disabled={isSubmitting}>
                {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Plaas Aankondiging
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Bestaande Aankondigings</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-card-foreground/80">Geen aankondigings gevind nie.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 border border-border/50 rounded-lg bg-background text-foreground relative">
                  <h3 className="font-semibold text-lg mb-1">{ann.title}</h3>
                  {ann.category && <p className="text-xs text-foreground/70 mb-1">Kategorie: {ann.category}</p>}
                  <p className="text-sm text-foreground/90 mb-2 whitespace-pre-wrap">{ann.content}</p>
                  <p className="text-xs text-foreground/70">
                    Gepos: {new Date(ann.date).toLocaleDateString('af-ZA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive/90 p-1"
                        disabled={deletingId === ann.id}
                        title="Verwyder Aankondiging"
                      >
                        {deletingId === ann.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Is jy seker?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Hierdie aksie kan nie ontdoen word nie. Dit sal die aankondiging permanent verwyder.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-green-500 text-white hover:bg-green-600">Kanselleer</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(ann.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Verwyder
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
