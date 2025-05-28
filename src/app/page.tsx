"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Group, FilterOptions, Announcement } from '@/types';
import GroupCard from '@/components/groups/GroupCard';
import GroupFilter from '@/components/groups/GroupFilter';
import NoticeBoard from '@/components/noticeboard/NoticeBoard';
import { MOCK_GROUPS, MOCK_ANNOUNCEMENTS } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"


export default function GroupDirectoryPage() {
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Default to grid view

  useEffect(() => {
    // Simulate fetching data
    setAllGroups(MOCK_GROUPS.filter(group => group.status === 'approved'));
    setFilteredGroups(MOCK_GROUPS.filter(group => group.status === 'approved'));
    setAnnouncements(MOCK_ANNOUNCEMENTS);
  }, []);

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
  }, [filters, searchTerm, allGroups]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const noResults = filteredGroups.length === 0;

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-gradient-to-r from-primary/10 to-background rounded-xl shadow-inner">
        <h1 className="text-4xl font-bold mb-3 text-primary">Vind Jou Gaan Groep</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ontdek en sluit aan by 'n Gaan Groep wat by jou pas. Groei saam in geloof en gemeenskap.
        </p>
      </section>

      <NoticeBoard announcements={announcements} />

      <section>
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Soek vir groepe (naam, leier, plek...)"
              className="pl-10 w-full text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
            <GroupFilter onFilterChange={handleFilterChange} />
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4">
            {noResults ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Geen Groepe Gevind</h3>
                <p className="text-muted-foreground">
                  Probeer asseblief jou soekterme of filters aanpas.
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredGroups.map(group => (
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
