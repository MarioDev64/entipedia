import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  decimal,
  date,
} from 'drizzle-orm/pg-core';

/**
 * Projects Table
 * Stores all project information for the Kanban board
 */
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('new'), // "new" | "in_progress" | "in_review" | "completed"
  priority: text('priority').notNull().default('medium'), // "low" | "medium" | "high"
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Clients Table
 * Will be implemented in Phase 2
 */
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // "person" | "company"
  valueDop: decimal('value_dop', { precision: 12, scale: 2 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Files Table
 * Will be implemented in Phase 3 (with S3 integration)
 */
export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  fileType: text('file_type').notNull(),
  fileUrl: text('file_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Export types for TypeScript
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
