
"use client";

import type React from 'react';
import { useState } from 'react';
import type { Group } from '@/types';
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
import { CheckCircle, XCircle, Clock, FileDown, RefreshCw, Trash2 } from 'lucide-react';
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

interface AdminTableProps {
  groups: Group[];
  onUpdateStatus: (groupId: string, status: Group['status']) => Promise<void>; // Returns a promise for async operations
  onDeleteGroup: (groupId: string) => Promise<void>;
}

export default function AdminTable({ groups, onUpdateStatus, onDeleteGroup }: AdminTableProps) {
  const [actioningGroupId, setActioningGroupId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAction = async (groupId: string, status: Group['status']) => {
    setActioningGroupId(groupId);
    try {
      await onUpdateStatus(groupId, status);
      toast({
        title: "Status Opgedateer",
        description: `Groep status is verander na ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Fout met Opdatering",
        description: "Kon nie groep status opdateer nie. Probeer asseblief weer.",
        variant: "destructive",
      });
    } finally {
      setActioningGroupId(null);
    }
  };
  
  const handleDelete = async (groupId: string) => {
    setActioningGroupId(groupId);
    try {
      await onDeleteGroup(groupId);
       toast({
        title: "Groep Verwyder",
        description: `Groep is suksesvol verwyder.`,
      });
    } catch (error) {
      toast({
        title: "Fout met Verwydering",
        description: "Kon nie die groep verwyder nie. Probeer asseblief weer.",
        variant: "destructive",
      });
    } finally {
      setActioningGroupId(null);
    }
  };

  const getStatusBadge = (status: Group['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-3 w-3" />Goedgekeur</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black"><Clock className="mr-1 h-3 w-3" />Hangende</Badge>;
      case 'declined':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Afgewys</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const exportToCSV = () => {
    // Basic CSV export
    const headers = ["ID", "Groepnaam", "Leier Naam", "Leier Kontak", "Status", "Primêre Fokus", "Ligging", "Dag", "Tyd", "Kapasiteit", "Huidige Lede"];
    const rows = groups.map(group => [
      group.id,
      `"${group.groupName.replace(/"/g, '""')}"`, // Handle quotes in name
      `"${group.leaderName.replace(/"/g, '""')}"`,
      group.leaderContact,
      group.status,
      group.primaryFocus,
      `"${group.location.replace(/"/g, '""')}"`,
      group.meetingDay,
      group.meetingTime,
      group.capacity,
      group.currentMembers,
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kleingroepe_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Data Uitgevoer", description: "Alle groepdata is na CSV uitgevoer." });
  };


  return (
    <div className="space-y-4">
       <div className="flex justify-end">
        <Button onClick={exportToCSV} variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> Uitvoer na CSV
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Groepnaam</TableHead>
              <TableHead>Leier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Geen kleingroepe gevind nie.
                </TableCell>
              </TableRow>
            )}
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.groupName}</TableCell>
                <TableCell>{group.leaderName} ({group.leaderContact})</TableCell>
                <TableCell>{getStatusBadge(group.status)}</TableCell>
                <TableCell className="text-right space-x-1">
                  {group.status !== 'approved' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(group.id, 'approved')}
                      disabled={actioningGroupId === group.id}
                      className="text-green-600 hover:text-green-700"
                      title="Keur goed"
                    >
                      {actioningGroupId === group.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                  )}
                  {group.status !== 'declined' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(group.id, 'declined')}
                      disabled={actioningGroupId === group.id}
                      className="text-red-600 hover:text-red-700"
                      title="Wys af"
                    >
                       {actioningGroupId === group.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    </Button>
                  )}
                   {group.status === 'declined' && ( // Allow re-pending declined groups
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(group.id, 'pending')}
                      disabled={actioningGroupId === group.id}
                      className="text-yellow-600 hover:text-yellow-700"
                       title="Stel as hangende"
                    >
                       {actioningGroupId === group.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                    </Button>
                  )}
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="Verwyder" className="text-destructive hover:text-destructive/80" disabled={actioningGroupId === group.id}>
                        {actioningGroupId === group.id && actioningGroupId === group.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Is jy seker?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hierdie aksie kan nie ontdoen word nie. Dit sal die groep permanent verwyder.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Kanselleer</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(group.id)} className="bg-destructive hover:bg-destructive/90">
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

    