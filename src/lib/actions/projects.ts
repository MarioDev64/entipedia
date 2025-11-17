'use server';

import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and, gte, gt, lte, lt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * List all projects from the database
 * @returns Array of all projects ordered by order field
 */
export async function listProjects() {
  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(projects.order);
    return { success: true, data: allProjects };
  } catch (error) {
    console.error('Error listing projects:', error);
    return { success: false, error: 'Failed to fetch projects' };
  }
}

/**
 * Create a new project
 * @param formData - Form data containing project details
 */
export async function createProject(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;
    const priority = formData.get('priority') as string;

    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Project name is required' };
    }

    // Valid status values
    const validStatuses = ['new', 'in_progress', 'in_review', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return { success: false, error: 'Invalid status value' };
    }

    // Valid priority values
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      return { success: false, error: 'Invalid priority value' };
    }

    // Get the highest order in the target status column
    const projectsInColumn = await db
      .select()
      .from(projects)
      .where(eq(projects.status, status || 'new'));

    const maxOrder =
      projectsInColumn.length > 0
        ? Math.max(...projectsInColumn.map((p) => p.order))
        : -1;

    // Insert into database with order
    const [newProject] = await db
      .insert(projects)
      .values({
        name: name.trim(),
        description: description?.trim() || '',
        status: status || 'new',
        priority: priority || 'medium',
        order: maxOrder + 1,
      })
      .returning();

    // Revalidate the projects page to show new data
    revalidatePath('/projects');

    return { success: true, data: newProject };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error: 'Failed to create project' };
  }
}

/**
 * Update a project's status and order (for drag and drop)
 * @param id - Project ID
 * @param newStatus - New status value
 * @param newOrder - New order value
 * @param oldStatus - Previous status value
 */
export async function updateProjectStatusAndOrder(
  id: number,
  newStatus: string,
  newOrder: number,
  oldStatus: string
) {
  try {
    const validStatuses = ['new', 'in_progress', 'in_review', 'completed'];

    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: 'Invalid status value' };
    }

    // Get the project being moved
    const [projectToMove] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!projectToMove) {
      return { success: false, error: 'Project not found' };
    }

    const oldOrder = projectToMove.order;

    // Case 1: Moving to a different column
    if (oldStatus !== newStatus) {
      // Update orders in the OLD column (collapse the gap)
      const projectsToUpdateOld = await db
        .select()
        .from(projects)
        .where(
          and(eq(projects.status, oldStatus), gt(projects.order, oldOrder))
        );

      for (const proj of projectsToUpdateOld) {
        await db
          .update(projects)
          .set({ order: proj.order - 1 })
          .where(eq(projects.id, proj.id));
      }

      // Update orders in the NEW column (make space)
      const projectsToUpdateNew = await db
        .select()
        .from(projects)
        .where(
          and(eq(projects.status, newStatus), gte(projects.order, newOrder))
        );

      for (const proj of projectsToUpdateNew) {
        await db
          .update(projects)
          .set({ order: proj.order + 1 })
          .where(eq(projects.id, proj.id));
      }

      // Update the moved project
      const [updatedProject] = await db
        .update(projects)
        .set({
          status: newStatus,
          order: newOrder,
        })
        .where(eq(projects.id, id))
        .returning();

      revalidatePath('/projects');
      return { success: true, data: updatedProject };
    }
    // Case 2: Reordering within the same column
    else {
      if (oldOrder === newOrder) {
        // No change needed
        return { success: true, data: projectToMove };
      }

      if (oldOrder < newOrder) {
        // Moving down: shift items between oldOrder and newOrder up
        const projectsToUpdate = await db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.status, newStatus),
              gt(projects.order, oldOrder),
              lte(projects.order, newOrder)
            )
          );

        for (const proj of projectsToUpdate) {
          await db
            .update(projects)
            .set({ order: proj.order - 1 })
            .where(eq(projects.id, proj.id));
        }
      } else {
        // Moving up: shift items between newOrder and oldOrder down
        const projectsToUpdate = await db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.status, newStatus),
              gte(projects.order, newOrder),
              lt(projects.order, oldOrder)
            )
          );

        for (const proj of projectsToUpdate) {
          await db
            .update(projects)
            .set({ order: proj.order + 1 })
            .where(eq(projects.id, proj.id));
        }
      }

      // Update the moved project
      const [updatedProject] = await db
        .update(projects)
        .set({ order: newOrder })
        .where(eq(projects.id, id))
        .returning();

      revalidatePath('/projects');
      return { success: true, data: updatedProject };
    }
  } catch (error) {
    console.error('Error updating project status and order:', error);
    return { success: false, error: 'Failed to update project' };
  }
}

/**
 * Update a project's full details
 * @param id - Project ID
 * @param data - Partial project data to update
 */
export async function updateProject(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    status?: string;
    priority?: string;
  }
) {
  try {
    // Validation
    if (data.name !== undefined && data.name.trim().length === 0) {
      return { success: false, error: 'Project name cannot be empty' };
    }

    if (data.status) {
      const validStatuses = ['new', 'in_progress', 'in_review', 'completed'];
      if (!validStatuses.includes(data.status)) {
        return { success: false, error: 'Invalid status value' };
      }
    }

    if (data.priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(data.priority)) {
        return { success: false, error: 'Invalid priority value' };
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) {
      updateData.description =
        data.description === null ? null : data.description.trim();
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    if (!updatedProject) {
      return { success: false, error: 'Project not found' };
    }

    revalidatePath('/projects');

    return { success: true, data: updatedProject };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, error: 'Failed to update project' };
  }
}

/**
 * Delete a project
 * @param id - Project ID
 */
export async function deleteProject(id: number) {
  try {
    // Get the project to delete
    const [projectToDelete] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!projectToDelete) {
      return { success: false, error: 'Project not found' };
    }

    // Delete the project
    const [deletedProject] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();

    // Collapse the order in the column where the project was
    const projectsToUpdate = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.status, projectToDelete.status),
          gt(projects.order, projectToDelete.order)
        )
      );

    for (const proj of projectsToUpdate) {
      await db
        .update(projects)
        .set({ order: proj.order - 1 })
        .where(eq(projects.id, proj.id));
    }

    revalidatePath('/projects');

    return { success: true, data: deletedProject };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: 'Failed to delete project' };
  }
}
