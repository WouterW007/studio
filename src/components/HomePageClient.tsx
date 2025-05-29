"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Group, FilterOptions, Announcement } from '@/types';
import GroupCard from '@/components/groups/GroupCard';
import GroupFilter from '@/components/groups/GroupFilter';
import NoticeBoard from '@/components/noticeboard/NoticeBoard';
import { Input } from '@/components/ui/input';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Image from 'next/image';

interface HomePageClientProps {
  initialGroups: Group[];
  initialAnnouncements: Announcement[];
}

export default function HomePageClient({ initialGroups, initialAnnouncements }: HomePageClientProps) {
  const [allGroups, setAllGroups] = useState<Group[]>(initialGroups);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>(initialGroups);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Default to grid view

  // This effect handles client-side filtering and searching
  useEffect(() => {
    let groups = allGroups;

    if (searchTerm) {
      groups = groups.filter(group =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply filters from GroupFilter component
    if (filters.area) {
      groups = groups.filter(group => group.location.toLowerCase().includes(filters.area!.toLowerCase()));
    }
    if (filters.primaryFocus) {
      groups = groups.filter(group => group.primaryFocus === filters.primaryFocus);
    }
    if (filters.targetAudience) {
      groups = groups.filter(group => group.targetAudience === filters.targetAudience);
    }
    if (filters.meetingDay) {
      groups = groups.filter(group => group.meetingDay === filters.meetingDay);
    }
    if (filters.meetingTime) {
      groups = groups.filter(group => group.meetingTime === filters.meetingTime);
    }
    if (filters.meetingType) {
      groups = groups.filter(group => group.meetingType === filters.meetingType);
    }
    if (filters.childcare !== undefined && filters.childcare !== "any") {
      groups = groups.filter(group => group.childcareAvailable === (filters.childcare === "yes"));
    }

    setFilteredGroups(groups);
  }, [filters, searchTerm, allGroups]); // Depend on filters, searchTerm, and the original allGroups

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleScrollToSearch = () => {
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const noResults = filteredGroups.length === 0;

  return (
    <div className="space-y-12">
      <section className="py-8 md:py-16">
        <div className="container mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground">
              Vind die perfekte <br className="md:hidden"/>
              <span className="inline-block mt-1 md:mt-0">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-5xl sm:text-6xl lg:text-7xl font-bold">
                  Kleingroep.
                </span>
              </span>
            </h1>
            <p className="text-lg text-foreground/80 max-w-xl mx-auto md:mx-0">
              Ontdek 'n gemeenskap waar jy kan groei, leer en saam met ander jou geloof kan uitleef. Soek en vind 'n kleingroep naby jou.
            </p>
            {/* This button is now in a Client Component, so the onClick handler is valid */}
            <Button size="lg" onClick={handleScrollToSearch}>
              Vind 'n Groep
            </Button>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/kleingroepe-site.firebasestorage.app/o/banner-bg.jpeg?alt=media&token=1ea7b3f5-77cf-4408-a576-0973ef227ba4" // <-- IMPORTANT: Replace this with the actual public URL of your banner-bg.jpeg
              alt="Kleingroep banier"
              layout="fill"
              objectFit="cover"
              data-ai-hint="banner"
              className="transform transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </section>

      <NoticeBoard announcements={announcements} />

      <section id="search-section">
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            {/* This Input is now in a Client Component, onClick is valid */}
            <Input
              type="text"
              placeholder="Soek vir groepe (naam, leier, plek...)"
              className="pl-10 w-full text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // Removed disabled attribute
            />
          </div>
           {/* This ToggleGroup is now in a Client Component, onValueChange is valid */}
           <ToggleGroup type="single" variant="outline" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as 'grid' | 'list')}}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            {/* GroupFilter is a Client Component and used within this Client Component */}
            <GroupFilter onFilterChange={handleFilterChange} />
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4">
            {noResults ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Geen Kleingroepe Gevind</h3>
                <p className="text-muted-foreground">
                  Probeer asseblief jou soekterme of filters aanpas.
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredGroups.map(group => (
                  // GroupCard can remain a Server Component if it doesn't need interactivity,
                  // or be a Client Component if it does (e.g., click handling on the card itself).
                  // For now, assuming it takes Group data as props and is rendered here.
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}