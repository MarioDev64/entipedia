'use server';

import { db } from '@/lib/db/drizzle';
import { files } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { put, del } from '@vercel/blob';

export async function listFiles() {
  try {
    const allFiles = await db
      .select()
      .from(files)
      .orderBy(desc(files.createdAt));

    return {
      success: true,
      data: allFiles,
    };
  } catch (error) {
    console.error('Error listing files:', error);
    return {
      success: false,
      error: 'Failed to fetch files',
    };
  }
}

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Save metadata to database
    const [newFile] = await db
      .insert(files)
      .values({
        name: name || file.name,
        description: description || null,
        fileType: file.type,
        fileUrl: blob.url, // Store Blob URL
      })
      .returning();

    revalidatePath('/files');

    return {
      success: true,
      data: newFile,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: 'Failed to upload file',
    };
  }
}

export async function deleteFile(id: number) {
  try {
    // Get file info from database
    const [file] = await db.select().from(files).where(eq(files.id, id));

    if (!file) {
      return {
        success: false,
        error: 'File not found',
      };
    }

    // Delete from Vercel Blob
    await del(file.fileUrl);

    // Delete from database
    await db.delete(files).where(eq(files.id, id));

    revalidatePath('/files');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: 'Failed to delete file',
    };
  }
}

export async function getFileDownloadUrl(id: number) {
  try {
    const [file] = await db.select().from(files).where(eq(files.id, id));

    if (!file) {
      return {
        success: false,
        error: 'File not found',
      };
    }

    // Return both URL and filename for proper download
    return {
      success: true,
      data: {
        url: file.fileUrl,
        filename: file.name,
      },
    };
  } catch (error) {
    console.error('Error getting download URL:', error);
    return {
      success: false,
      error: 'Failed to generate download URL',
    };
  }
}
