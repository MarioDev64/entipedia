'use server';

import { db } from '@/lib/db/drizzle';
import { clients } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function listClients() {
  try {
    const allClients = await db
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));

    return {
      success: true,
      data: allClients,
    };
  } catch (error) {
    console.error('Error listing clients:', error);
    return {
      success: false,
      error: 'Failed to fetch clients',
    };
  }
}

export async function createClient(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const type = formData.get('type') as 'person' | 'company';
    const valueDop = formData.get('valueDop') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;

    const [newClient] = await db
      .insert(clients)
      .values({
        name,
        type,
        valueDop,
        startDate,
        endDate,
      })
      .returning();

    revalidatePath('/clients');

    return {
      success: true,
      data: newClient,
    };
  } catch (error) {
    console.error('Error creating client:', error);
    return {
      success: false,
      error: 'Failed to create client',
    };
  }
}

export async function updateClient(
  id: number,
  data: {
    name?: string;
    type?: 'person' | 'company';
    valueDop?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  try {
    const [updatedClient] = await db
      .update(clients)
      .set(data)
      .where(eq(clients.id, id))
      .returning();

    revalidatePath('/clients');

    return {
      success: true,
      data: updatedClient,
    };
  } catch (error) {
    console.error('Error updating client:', error);
    return {
      success: false,
      error: 'Failed to update client',
    };
  }
}

export async function deleteClient(id: number) {
  try {
    await db.delete(clients).where(eq(clients.id, id));

    revalidatePath('/clients');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting client:', error);
    return {
      success: false,
      error: 'Failed to delete client',
    };
  }
}
