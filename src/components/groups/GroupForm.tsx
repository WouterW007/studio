"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FOCUS_CATEGORIES, MEETING_DAYS, MEETING_TIMES, MEETING_FREQUENCIES, TARGET_AUDIENCES, MEETING_TYPES, AREAS } from "@/lib/constants"; 
import type { FocusCategoryKey, MeetingDay, MeetingTime, TargetAudience, MeetingType } from "@/types";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


const targetAudienceValues = TARGET_AUDIENCES;

const groupFormSchema = z.object({
  leaderName: z.string().min(2, "Leier se naam moet ten minste 2 karakters lank wees."),
  leaderEmail: z.string().email("Ongeldige e-posadres.").or(z.literal('')).optional(),
  leaderCellphone: z.string().optional(),
  groupName: z.string().min(3, "Groepnaam moet ten minste 3 karakters lank wees."),
  meetingDay: z.enum(MEETING_DAYS as [MeetingDay, ...MeetingDay[]], { required_error: "Kies 'n vergaderdag." }),
  meetingTime: z.enum(MEETING_TIMES as [MeetingTime, ...MeetingTime[]], { required_error: "Kies 'n vergadertyd." }),
  meetingFrequency: z.string().min(1, "Kies 'n vergaderfrekwensie."),
  meetingType: z.enum(MEETING_TYPES as [MeetingType, ...MeetingType[]], { required_error: "Kies 'n vergadertipe." }),
  childcareAvailable: z.boolean().default(false),
  location: z.enum(AREAS as [string, ...string[]], { required_error: "Kies 'n area/ligging." }), 
  primaryFocus: z.custom<FocusCategoryKey>(val => FOCUS_CATEGORIES.some(fc => fc.key === val), {message: "Kies 'n primêre fokus."}),
  secondaryFocus: z.array(z.custom<FocusCategoryKey>(val => FOCUS_CATEGORIES.some(fc => fc.key === val))).optional().nullable(),
  capacity: z.coerce.number().min(1, "Kapasiteit moet ten minste 1 wees.").positive("Kapasiteit moet 'n positiewe getal wees.").nullable(),
  description: z.string().max(500, "Beskrywing mag nie meer as 500 karakters wees nie.").optional().nullable(),
  expiryDate: z.date().optional().nullable(),
  targetAudience: z.enum(targetAudienceValues as [string, ...string[]], { required_error: "Kies 'n teikengehoor." }),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

const defaultValues: Partial<GroupFormValues> = {
  childcareAvailable: false,
  capacity: 10, // Default capacity
  secondaryFocus: [], 
  targetAudience: TARGET_AUDIENCES[0], // Default target audience
  description: '', // Default description to empty string
  expiryDate: undefined, // Default expiryDate to undefined
};

export function GroupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: GroupFormValues) {
    console.log(data);

    try {
      const { db } = await import("@/lib/firebase"); 

      const groupDataToSave = {
        leaderName: data.leaderName,
        leaderEmail: data.leaderEmail || null, 
        leaderCellphone: data.leaderCellphone || null,
        groupName: data.groupName,
        meetingDay: data.meetingDay,
        meetingTime: data.meetingTime,
        meetingFrequency: data.meetingFrequency,
        meetingType: data.meetingType,
        childcareAvailable: data.childcareAvailable,
        location: data.location, 
        primaryFocus: data.primaryFocus,
        secondaryFocus: (data.secondaryFocus && data.secondaryFocus.length > 0) ? data.secondaryFocus : null, 
        capacity: data.capacity ?? null, 
        description: data.description || null,
        expiryDate: data.expiryDate || null,
        targetAudience: data.targetAudience,
        status: "pending", 
        createdAt: new Date(), 
      };

      const docRef = await addDoc(collection(db, "pendingGroups"), groupDataToSave);
      console.log("Document written with ID: ", docRef.id);

      toast({
        title: "Kleingroep Registrasie Ingedien",
        description: (<p>Dankie, {data.leaderName}! Jou kleingroep "{data.groupName}" is ingedien vir goedkeuring.</p>),
        variant: "default",
      });

    form.reset(); 
    router.push('/'); 

    } catch (e) {
      console.error("Error adding document: ", e);
      toast({
        title: "Registrasie Fout",
        description: "Daar was 'n fout met die indiening van jou kleingroep. Probeer asseblief weer. Fout: " + (e instanceof Error ? e.message : String(e)),
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Leader Name, Email, Cellphone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="leaderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naam en Van</FormLabel>
                <FormControl>
                  <Input placeholder="bv. Jan Coetzee" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leaderEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-pos</FormLabel>
                <FormControl>
                  <Input placeholder="bv. jan@example.com" {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="leaderCellphone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sel Nr.</FormLabel>
                <FormControl>
                  <Input placeholder="082 1234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Group Name */}
        <FormField
          control={form.control}
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Groepnaam</FormLabel>
              <FormControl>
                <Input placeholder="bv. Oggend Bybelstudie Manne" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meeting Day, Time, Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="meetingDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergaderdag</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies 'n dag" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MEETING_DAYS.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meetingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergadertyd</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies 'n tyd" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MEETING_TIMES.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meetingFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hoe gereeld vergader julle?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies frekwensie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MEETING_FREQUENCIES.map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Meeting Type, Target Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="meetingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergadertipe</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies tipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MEETING_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teikengehoor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies teikengehoor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TARGET_AUDIENCES.map((audience) => (
                      <SelectItem key={audience} value={audience}>
                        {audience}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Location / Area */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ligging / Area</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies 'n area" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AREAS.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Primary Focus, Secondary Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="primaryFocus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primêre Fokus</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies primêre fokus" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FOCUS_CATEGORIES.map(category => (
                      <SelectItem key={category.key} value={category.key}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="secondaryFocus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sekondêre Fokus (Opsioneel)</FormLabel>
                 <Select 
                    onValueChange={(value) => {
                        field.onChange(value === "none" ? [] : [value as FocusCategoryKey]); 
                    }} 
                    value={field.value && field.value.length > 0 ? field.value[0] : "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies sekondêre fokus" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     <SelectItem value="none">Geen</SelectItem> 
                    {FOCUS_CATEGORIES.map(category => (
                      <SelectItem key={category.key} value={category.key}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Kies een addisionele fokus indien van toepassing.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Capacity, Childcare */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kapasiteit (Aantal Mense)</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        placeholder="bv. 10" 
                        {...field} 
                        value={field.value ?? ''} // Handle null/undefined for value
                        onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? null : parseInt(value, 10));
                        }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="childcareAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4 md:mt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Kinder toesig beskikbaar? (Merk indien Ja)
                      </FormLabel>
                      <FormDescription>
                        As jy hierdie merk, beteken dit 'Ja', kinder toesig is beskikbaar. Los dit oop indien kinder toesig 'Nee' is (nie beskikbaar nie).
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
        </div>
        
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kort Beskrywing (Opsioneel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Vertel ons 'n bietjie meer oor die groep..."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ''} // Handle null/undefined for value
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Expiry Date */}
        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Vervaldatum vir Groeplys (Opsioneel)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        "bg-background border border-input text-foreground hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Kies 'n datum</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined} // Handle null for selected
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Indien die groep slegs vir 'n beperkte tyd loop.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full md:w-auto bg-background text-foreground border border-primary hover:bg-background/90" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Besig om te stuur..." : "Registreer Kleingroep"}
        </Button>
      </form>
    </Form>
  );
}
