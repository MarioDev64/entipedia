'use client';

import { useState } from 'react';
import { useCreateClient } from '@/hooks/useClients';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { clientSchema } from '@/lib/validations/client';
import { z } from 'zod';
import { toast } from 'sonner';

export const NewClientDialog = () => {
  const createClient = useCreateClient();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [type, setType] = useState<'person' | 'company'>('company');
  const [valueDop, setValueDop] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = clientSchema.parse({
        name,
        type,
        valueDop,
        startDate,
        endDate,
      });

      setErrors({});

      const formData = new FormData();
      formData.append('name', validatedData.name);
      formData.append('type', validatedData.type);
      formData.append('valueDop', validatedData.valueDop);
      formData.append('startDate', validatedData.startDate);
      formData.append('endDate', validatedData.endDate);

      createClient.mutate(formData, {
        onSuccess: () => {
          setOpen(false);
          // Reset form
          setName('');
          setType('company');
          setValueDop('');
          setStartDate('');
          setEndDate('');
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the validation errors');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Add a new client to your database. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Name</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter client name"
              disabled={createClient.isPending}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(val) => setType(val as 'person' | 'company')}
              disabled={createClient.isPending}
            >
              <SelectTrigger
                id="type"
                className={errors.type ? 'border-destructive' : ''}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-destructive text-sm">{errors.type}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value (DOP)</Label>
            <Input
              id="value"
              type="number"
              value={valueDop}
              onChange={(e) => setValueDop(e.target.value)}
              placeholder="0.00"
              step="0.01"
              disabled={createClient.isPending}
              className={errors.valueDop ? 'border-destructive' : ''}
            />
            {errors.valueDop && (
              <p className="text-destructive text-sm">{errors.valueDop}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={createClient.isPending}
                className={errors.startDate ? 'border-destructive' : ''}
              />
              {errors.startDate && (
                <p className="text-destructive text-sm">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={createClient.isPending}
                className={errors.endDate ? 'border-destructive' : ''}
              />
              {errors.endDate && (
                <p className="text-destructive text-sm">{errors.endDate}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createClient.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={createClient.isPending}
            >
              {createClient.isPending ? 'Creating...' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
