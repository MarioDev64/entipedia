'use client';

import { useState, Suspense } from 'react';
import {
  useClients,
  useUpdateClient,
  useDeleteClient,
} from '@/hooks/useClients';
import { ClientsSkeleton } from '@/components/skeletons/ClientsSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NewClientDialog } from '@/components/NewClientDialog';
import { DeleteClientDialog } from '@/components/DeleteClientDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Save,
  X,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client } from '@/types';

function ClientsContent() {
  const { data: clients, isLoading, error, refetch } = useClients();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'person' | 'company'>('person');
  const [editValue, setEditValue] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const itemsPerPage = 10;

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setEditName(client.name);
    setEditType(client.type);
    setEditValue(client.valueDop);
    setEditStartDate(client.startDate);
    setEditEndDate(client.endDate);
  };

  const handleSave = (id: number) => {
    updateClient.mutate(
      {
        id,
        data: {
          name: editName,
          type: editType,
          valueDop: editValue,
          startDate: editStartDate,
          endDate: editEndDate,
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (client: Client) => {
    setDeletingClient(client);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingClient) return;

    deleteClient.mutate(deletingClient.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setDeletingClient(null);
      },
    });
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(numValue);
  };

  if (isLoading) {
    return <ClientsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="bg-destructive/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <AlertCircle className="text-destructive h-8 w-8" />
        </div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          Failed to load clients
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const clientsList = clients || [];
  const totalPages = Math.ceil(clientsList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = clientsList.slice(startIndex, endIndex);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mt-2 text-foreground text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client relationships
          </p>
        </div>
        <NewClientDialog />
      </div>

      <div className="border-border bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-muted-foreground text-lg">
                      No clients yet
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Create your first client to get started
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentClients.map((client) => {
                const isEditing = editingId === client.id;
                return (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        client.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={editType}
                          onValueChange={(val) =>
                            setEditType(val as 'person' | 'company')
                          }
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="person">Person</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant={
                            client.type === 'company' ? 'default' : 'secondary'
                          }
                        >
                          {client.type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          step="0.01"
                          className="h-8 w-32"
                        />
                      ) : (
                        formatCurrency(client.valueDop)
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          className="h-8 w-36"
                        />
                      ) : (
                        format(new Date(client.startDate), 'MMM d, yyyy')
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editEndDate}
                          onChange={(e) => setEditEndDate(e.target.value)}
                          className="h-8 w-36"
                        />
                      ) : (
                        format(new Date(client.endDate), 'MMM d, yyyy')
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSave(client.id)}
                            className="h-8 w-8 p-0"
                            disabled={updateClient.isPending}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0"
                            disabled={updateClient.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(client)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(client)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {clientsList.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, clientsList.length)} of{' '}
            {clientsList.length} clients
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <DeleteClientDialog
        client={deletingClient}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      {(updateClient.isPending || deleteClient.isPending) && (
        <div className="bg-primary text-primary-foreground fixed right-4 bottom-4 rounded-lg px-4 py-2 shadow-lg">
          {updateClient.isPending ? 'Updating...' : 'Deleting...'}
        </div>
      )}
    </>
  );
}

export default function ClientsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ClientsSkeleton />}>
        <ClientsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
