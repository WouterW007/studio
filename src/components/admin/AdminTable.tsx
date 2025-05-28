
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

interface AdminTableProps {
  groups: Group[];
  onUpdateStatus: (groupId: string, status: Group['status']) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onLogout: () => void;
}

export default function AdminTable({ groups, onUpdateStatus, onDeleteGroup, onLogout }: AdminTableProps) {
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
        return <Badge className="bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"><CheckCircle className="mr-1 h-3 w-3" />Goedgekeur</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"><Clock className="mr-1 h-3 w-3" />Hangende</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"><XCircle className="mr-1 h-3 w-3" />Afgewys</Badge>;
      default:
        return <Badge variant="outline" className="text-neutral-700 border-neutral-300">{status}</Badge>;
    }
  };
  
  const exportToCSV = () => {
    const headers = ["ID", "Groepnaam", "Leier Naam", "Leier Kontak", "Status", "Primêre Fokus", "Ligging", "Dag", "Tyd", "Kapasiteit", "Huidige Lede"];
    const rows = groups.map(group => [
      group.id,
      `"${group.groupName.replace(/"/g, '""')}"`, 
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

    const csvString = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    // Feature detection for download attribute
    if (link.download !== undefined) { 
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "kleingroepe_data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Release the object URL
      toast({ title: "Data Uitgevoer", description: "Alle groepdata is na CSV uitgevoer." });
    } else {
      // Fallback or error message if download attribute is not supported
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
              <TableHead className="text-neutral-600">Leier</TableHead>
              <TableHead className="text-neutral-600">Status</TableHead>
              <TableHead className="text-neutral-600 text-right">Aksies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 && (
              <TableRow className="border-neutral-200">
                <TableCell colSpan={4} className="text-center h-24 text-neutral-500">
                  Geen kleingroepe gevind nie.
                </TableCell>
              </TableRow>
            )}
            {groups.map((group) => (
              <TableRow key={group.id} className="border-neutral-200 hover:bg-neutral-50">
                <TableCell className="font-medium text-neutral-800">{group.groupName}</TableCell>
                <TableCell className="text-neutral-700">{group.leaderName} ({group.leaderContact})</TableCell>
                <TableCell>{getStatusBadge(group.status)}</TableCell>
                <TableCell className="text-right space-x-1">
                  {group.status !== 'approved' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(group.id, 'approved')}
                      disabled={actioningGroupId === group.id}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 rounded-md"
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded-md"
                      title="Wys af"
                    >
                       {actioningGroupId === group.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    </Button>
                  )}
                   {group.status === 'declined' && ( 
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(group.id, 'pending')}
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
                          Hierdie aksie kan nie ontdoen word nie. Dit sal die groep permanent verwyder.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-neutral-300 text-neutral-700 hover:bg-neutral-100">Kanselleer</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(group.id)} className="bg-red-600 hover:bg-red-700 text-white">
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
