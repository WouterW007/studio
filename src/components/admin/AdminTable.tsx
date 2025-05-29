
"use client";

import type React from 'react';
import { useState } from 'react';
import type { Group as GroupType } from '@/types'; // Renamed to avoid conflict
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, FileDown, RefreshCw, Trash2, LogOut } from 'lucide-react';
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
import { useToast } from "@/hooks/use-toast";
import { Card } from '../ui/card';

// The Group type received by AdminTable will have sourceType from page.tsx
interface TableGroup extends GroupType {
  sourceType: 'pendingGroups' | 'groups';
}

interface AdminTableProps {
  groups: TableGroup[]; 
  onUpdateStatus: (groupId: string, status: TableGroup['status'], sourceType: TableGroup['sourceType']) => Promise<void>;
  onDeleteGroup: (groupId: string, sourceType: TableGroup['sourceType']) => Promise<void>;
  onLogout: () => void;
}

export default function AdminTable({ groups, onUpdateStatus, onDeleteGroup, onLogout }: AdminTableProps) {
  const [actioningGroupId, setActioningGroupId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAction = async (group: TableGroup, status: TableGroup['status']) => {
    setActioningGroupId(group.id);
    try {
      await onUpdateStatus(group.id, status, group.sourceType);
      // Toast is handled in page.tsx after successful operation
    } catch (error) {
      // Error toast is handled in page.tsx
      console.error("Error performing action from AdminTable:", error)
    } finally {
      setActioningGroupId(null);
    }
  };
  
  const handleDelete = async (group: TableGroup) => {
    setActioningGroupId(group.id);
    try {
      await onDeleteGroup(group.id, group.sourceType);
      // Toast is handled in page.tsx after successful operation
    } catch (error) {
      // Error toast is handled in page.tsx
       console.error("Error performing delete from AdminTable:", error)
    } finally {
      setActioningGroupId(null);
    }
  };

  const getStatusBadge = (status: TableGroup['status']) => {
    switch (status) {
      case 'active': 
        return <Badge className="bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"><CheckCircle className="mr-1 h-3 w-3" />Aktief</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"><Clock className="mr-1 h-3 w-3" />Hangende</Badge>;
      case 'rejected': 
        return <Badge className="bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"><XCircle className="mr-1 h-3 w-3" />Afgewys</Badge>;
      default:
        return <Badge variant="outline" className="text-neutral-700 border-neutral-300">{status}</Badge>;
    }
  };
  
  const exportToCSV = () => {
    const headers = ["ID", "Groepnaam", "Leier Naam", "Leier Kontak", "Status", "Bron", "Primêre Fokus", "Ligging", "Dag", "Tyd", "Kapasiteit", "Huidige Lede"];
    const rows = groups.map(group => [
      group.id,
      `"${group.groupName.replace(/"/g, '""')}"`, 
      `"${group.leaderName.replace(/"/g, '""')}"`,
      group.leaderContact, // Assuming this can be email or phone
      group.status,
      group.sourceType,
      group.primaryFocus,
      `"${group.location.replace(/"/g, '""')}"`,
      group.meetingDay,
      group.meetingTime,
      group.capacity,
      group.currentMembers,
    ].join(","));

    const csvString = [headers.join(","), ...rows].join("\n"); // Corrected newline character
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) { 
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "kleingroepe_data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Data Uitgevoer", description: "Alle groepdata is na CSV uitgevoer." });
    } else {
      toast({ 
        title: "Uitvoer Fout", 
        description: "CSV uitvoer word nie ten volle deur jou blaaier ondersteun nie.", 
        variant: "destructive" 
      });
    }
  };


  return (
    <div className="space-y-4">
       <div className="flex justify-end space-x-2 mb-4">
        <Button onClick={exportToCSV} variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> Uitvoer na CSV
        </Button>
        <Button onClick={onLogout} variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Log Uit
        </Button>
      </div>
      <Card className="bg-white text-neutral-900 border-neutral-200 shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-200">
              <TableHead className="text-neutral-600">Groepnaam</TableHead>
              <TableHead className="text-neutral-600">Leier (Kontak)</TableHead>
              <TableHead className="text-neutral-600">Status</TableHead>
              <TableHead className="text-neutral-600 text-right">Aksies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 && (
              <TableRow className="border-neutral-200">
                <TableCell colSpan={4} className="text-center h-24 text-neutral-500">
                  Geen kleingroepe gevind nie. (Maak seker dat registrasies via die publieke vorm ingedien word.)
                </TableCell>
              </TableRow>
            )}
            {groups.map((group) => (
              <TableRow key={group.id} className="border-neutral-200 hover:bg-neutral-50">
                <TableCell className="font-medium text-neutral-800">{group.groupName}</TableCell>
                <TableCell className="text-neutral-700">{group.leaderName} ({group.leaderContact || 'N/A'})</TableCell>
                <TableCell>{getStatusBadge(group.status)}</TableCell>
                <TableCell className="text-right space-x-1">
                  {group.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(group, 'active')}
                      disabled={actioningGroupId === group.id}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 rounded-md"
                      title="Keur goed (Aktiveer)"
                    >
                      {actioningGroupId === group.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                  )}
                  {(group.status === 'pending' || group.status === 'active') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(group, 'rejected')}
                      disabled={actioningGroupId === group.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded-md"
                      title="Wys af"
                    >
                       {actioningGroupId === group.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    </Button>
                  )}
                  {(group.status === 'rejected' || group.status === 'active') && group.sourceType === 'groups' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(group, 'pending')}
                      disabled={actioningGroupId === group.id}
                      className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 p-1 rounded-md"
                       title="Stel as hangende"
                    >
                       {actioningGroupId === group.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                    </Button>
                  )}
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="Verwyder" className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 p-1 rounded-md" disabled={actioningGroupId === group.id}>
                        {actioningGroupId === group.id && actioningGroupId === group.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-neutral-300">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-neutral-900">Is jy seker?</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-600">
                          Hierdie aksie kan nie ontdoen word nie. Dit sal die groep permanent verwyder van '{(group.sourceType === 'pendingGroups' ? 'Hangende Groepe' : 'Aktiewe Groepe')}'.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-neutral-300 text-neutral-700 hover:bg-neutral-100">Kanselleer</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(group)} className="bg-red-600 hover:bg-red-700 text-white">
                          Verwyder
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
