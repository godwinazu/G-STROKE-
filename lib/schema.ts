import { pgEnum, pgTable, serial, text, timestamp, varchar, integer, boolean, decimal } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'customer']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PAID', 'FULFILLED']);
export const orderTypeEnum = pgEnum('order_type', ['PHYSICAL', 'DIGITAL', 'COMMISSION']);
export const commissionStatusEnum = pgEnum('commission_status', ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: roleEnum('role').notNull().default('customer'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const artworks = pgTable('artworks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  category: varchar('category', { length: 120 }).notNull(),
  medium: varchar('medium', { length: 120 }).notNull(),
  size: varchar('size', { length: 120 }).notNull(),
  description: text('description').notNull(),
  r2ImageUrl: varchar('r2_image_url', { length: 500 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isFeatured: boolean('is_featured').notNull().default(false),
  isDigital: boolean('is_digital').notNull().default(false),
  r2DigitalFileKey: varchar('r2_digital_file_key', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  paystackReference: varchar('paystack_reference', { length: 255 }).notNull().unique(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  orderType: orderTypeEnum('order_type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const commissions = pgTable('commissions', {
  id: serial('id').primaryKey(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subjectType: varchar('subject_type', { length: 120 }).notNull(),
  medium: varchar('medium', { length: 120 }).notNull(),
  dimensions: varchar('dimensions', { length: 120 }).notNull(),
  budgetEstimate: integer('budget_estimate').notNull(),
  details: text('details').notNull(),
  status: commissionStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
