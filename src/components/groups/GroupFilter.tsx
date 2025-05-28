"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import type { FilterOptions, MeetingDay, MeetingTime, TargetAudience, FocusCategoryKey, MeetingType } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TARGET_AUDIENCES, MEETING_DAYS, MEETING_TIMES, FOCUS_CATEGORIES, MEETING_TYPES } from '@/lib/constants';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface GroupFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export default function GroupFilter({ onFilterChange, initialFilters = {} }: GroupFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FilterOptions) => (value: string) => {
    setFilters(prev => ({ ...prev, [name]: value || undefined }));
  };

  const handleChildcareChange = (value: string) => {
    setFilters(prev => ({ ...prev, childcare: value === "any" ? undefined : (value as "yes" | "no") }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };
  
  if (!mounted) { // Prevents hydration mismatch for select defaultValue
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><SlidersHorizontal className="mr-2 h-5 w-5" /> Filter Groepe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-md"></div>
            ))}
            <div className="h-10 bg-primary/50 rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center text-xl"><SlidersHorizontal className="mr-2 h-5 w-5 text-primary" /> Filter Groepe</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="area">Area / Ligging</Label>
            <Input 
              id="area" 
              name="area" 
              placeholder="bv. Bellville, Aanlyn" 
              value={filters.area || ""}
              onChange={handleInputChange} 
            />
          </div>

          <div>
            <Label htmlFor="primaryFocus">Primêre Fokus</Label>
            <Select name="primaryFocus" onValueChange={handleSelectChange("primaryFocus")} value={filters.primaryFocus}>
              <SelectTrigger id="primaryFocus">
                <SelectValue placeholder="Alle Fokusse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Fokusse</SelectItem>
                {FOCUS_CATEGORIES.map(cat => (
                  <SelectItem key={cat.key} value={cat.key}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetAudience">Teikengehoor</Label>
            <Select name="targetAudience" onValueChange={handleSelectChange("targetAudience")} value={filters.targetAudience}>
              <SelectTrigger id="targetAudience">
                <SelectValue placeholder="Alle Gehore" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Gehore</SelectItem>
                {TARGET_AUDIENCES.map(aud => (
                  <SelectItem key={aud} value={aud}>{aud}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="meetingDay">Dag van die Week</Label>
            <Select name="meetingDay" onValueChange={handleSelectChange("meetingDay")} value={filters.meetingDay}>
              <SelectTrigger id="meetingDay">
                <SelectValue placeholder="Alle Dae" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Dae</SelectItem>
                {MEETING_DAYS.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="meetingTime">Tyd van die Dag</Label>
            <Select name="meetingTime" onValueChange={handleSelectChange("meetingTime")} value={filters.meetingTime}>
              <SelectTrigger id="meetingTime">
                <SelectValue placeholder="Alle Tye" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Tye</SelectItem>
                {MEETING_TIMES.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="meetingType">Vergadertipe</Label>
            <Select name="meetingType" onValueChange={handleSelectChange("meetingType")} value={filters.meetingType}>
              <SelectTrigger id="meetingType">
                <SelectValue placeholder="Alle Tipes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Tipes</SelectItem>
                {MEETING_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="childcare">Kinder Toesig</Label>
            <Select name="childcare" onValueChange={handleChildcareChange} value={filters.childcare === undefined ? "any" : filters.childcare}>
              <SelectTrigger id="childcare">
                <SelectValue placeholder="Enige" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Enige</SelectItem>
                <SelectItem value="yes">Ja</SelectItem>
                <SelectItem value="no">Nee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="submit" className="flex-1">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Pas Filters Toe
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} title="Stel filters terug">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
