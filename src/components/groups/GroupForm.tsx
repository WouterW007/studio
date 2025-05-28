
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
import { FOCUS_CATEGORIES, MEETING_DAYS, MEETING_TIMES, MEETING_FREQUENCIES, TARGET_AUDIENCES, MEETING_TYPES } from "@/lib/constants";
import type { FocusCategoryKey, MeetingDay, MeetingTime, TargetAudience, MeetingType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


const groupFormSchema = z.object({
  leaderName: z.string().min(2, "Leier se naam moet ten minste 2 karakters lank wees."),
  leaderEmail: z.string().email("Ongeldige e-posadres.").or(z.literal('')).optional(),
  leaderCellphone: z.string().optional(), // Basic string validation for now
  groupName: z.string().min(3, "Groepnaam moet ten minste 3 karakters lank wees."),
  meetingDay: z.enum(MEETING_DAYS as [MeetingDay, ...MeetingDay[]], { required_error: "Kies 'n vergaderdag." }),
  meetingTime: z.enum(MEETING_TIMES as [MeetingTime, ...MeetingTime[]], { required_error: "Kies 'n vergadertyd." }),
  meetingFrequency: z.string().min(1, "Kies 'n vergaderfrekwensie."),
  meetingType: z.enum(MEETING_TYPES as [MeetingType, ...MeetingType[]], { required_error: "Kies 'n vergadertipe." }),
  childcareAvailable: z.boolean().default(false),
  location: z.string().min(3, "Ligging moet ten minste 3 karakters lank wees."),
  primaryFocus: z.custom<FocusCategoryKey>(val => FOCUS_CATEGORIES.some(fc => fc.key === val), {message: "Kies 'n primêre fokus."}),
  secondaryFocus: z.array(z.custom<FocusCategoryKey>(val => FOCUS_CATEGORIES.some(fc => fc.key === val))).optional(),
  capacity: z.coerce.number().min(1, "Kapasiteit moet ten minste 1 wees.").positive("Kapasiteit moet 'n positiewe getal wees."),
  description: z.string().max(500, "Beskrywing mag nie meer as 500 karakters wees nie.").optional(),
  expiryDate: z.date().optional(),
});
// Define options for targetAudience explicitly with values and labels
const targetAudienceOptions = [
  { value: "Men", label: "Mans" },
  { value: "Women", label: "Vroue" },
  { value: "Mixed Adults", label: "Gemengde Volwassenes" },
  { value: "Young Adults (18-25)", label: "Jong Volwassenes (18-25)" },
  { value: "Youth (12-17)", label: "Jeug (12-17)" },
  { value: "Seniors (60+)", label: "Seniors (60+)" },
  { value: "Families", label: "Gesinne" },
];

// Extract values for zod enum validation
const targetAudienceValues = targetAudienceOptions.map(option => option.value);
groupFormSchema.extend({ targetAudience: z.enum(targetAudienceValues as [TargetAudience, ...TargetAudience[]], { required_error: "Kies 'n teikengehoor." }), });
type GroupFormValues = z.infer<typeof groupFormSchema>;

const defaultValues: Partial<GroupFormValues> = {
  childcareAvailable: false,
  capacity: 10,
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
    // In a real app, this would submit to a backend/Firebase
    console.log(data);
    // Mock submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Kleingroep Registrasie Ingedien",
      description: (
        <p>Dankie, {data.leaderName}! Jou kleingroep "{data.groupName}" is ingedien vir goedkeuring.</p>
      ),
      variant: "default",
    });
    form.reset(); // Reset form after successful submission
    router.push('/'); // Redirect to home page
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            control={form.control} // Assuming leaderEmail is now optional in your schema
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
            control={form.control} // Assuming leaderCellphone is now optional in your schema
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies teikengehoor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Use the new targetAudienceOptions array */}
                    {targetAudienceOptions.map((audience) => (
                      <SelectItem
                        key={audience.value} // Use value as key for consistency
                        value={audience.value}
                      >
                        {audience.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ligging / Area</FormLabel>
              <FormControl>
                <Input placeholder="bv. Kerk / Aanlyn via Zoom" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                 <Select onValueChange={(value) => field.onChange(value ? [value as FocusCategoryKey] : [])} >{/* Simplified for single secondary focus for now */}
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies sekondêre fokus" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
 <SelectItem value={undefined}></SelectItem> {/* Use undefined for "None" selection */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kapasiteit (Aantal Mense)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="bv. 10" {...field} />
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    selected={field.value}
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
        
        <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Besig om te stuur..." : "Registreer Kleingroep"}
        </Button>
      </form>
    </Form>
  );
}
    
