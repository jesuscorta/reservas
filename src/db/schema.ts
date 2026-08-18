import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const bookingType = pgEnum("booking_type", ["reservation", "lesson", "blocked", "other"]);
export const bookingStatus = pgEnum("booking_status", ["active", "cancelled"]);
export const paymentStatus = pgEnum("payment_status", ["pending", "paid"]);

export const clubs = pgTable("clubs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  accessCodeHash: text("access_code_hash").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastAccessAt: timestamp("last_access_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("clubs_slug_unique").on(table.slug)]);

export const clubSettings = pgTable("club_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").notNull().references(() => clubs.id),
  slotDurationMinutes: integer("slot_duration_minutes").default(90).notNull(),
  paymentTrackingEnabled: boolean("payment_tracking_enabled").default(false).notNull(),
  timezone: text("timezone").default("Europe/Madrid").notNull(),
  setupCompletedAt: timestamp("setup_completed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("club_settings_club_unique").on(table.clubId)]);

export const courts = pgTable("courts", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").notNull().references(() => clubs.id),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
}, (table) => [index("courts_club_order_idx").on(table.clubId, table.sortOrder)]);

export const businessHours = pgTable("business_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").notNull().references(() => clubs.id),
  dayOfWeek: integer("day_of_week").notNull(),
  openingTime: time("opening_time"),
  closingTime: time("closing_time"),
  isClosed: boolean("is_closed").default(false).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("business_hours_club_day_unique").on(table.clubId, table.dayOfWeek)]);

export const specialHours = pgTable("special_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").notNull().references(() => clubs.id),
  date: date("date").notNull(),
  openingTime: time("opening_time"),
  closingTime: time("closing_time"),
  isClosed: boolean("is_closed").default(false).notNull(),
  reason: text("reason"),
  ...timestamps,
}, (table) => [uniqueIndex("special_hours_club_date_unique").on(table.clubId, table.date)]);

export const bookingRecurrences = pgTable("booking_recurrences", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").notNull().references(() => clubs.id),
  courtId: uuid("court_id").notNull().references(() => courts.id),
  type: bookingType("type").notNull(),
  customerName: text("customer_name"),
  notes: text("notes"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  durationSlots: integer("duration_slots").default(1).notNull(),
  paymentStatus: paymentStatus("payment_status").default("pending").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").notNull().references(() => clubs.id),
  courtId: uuid("court_id").notNull().references(() => courts.id),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  type: bookingType("type").notNull(),
  customerName: text("customer_name"),
  notes: text("notes"),
  paymentStatus: paymentStatus("payment_status").default("pending").notNull(),
  status: bookingStatus("status").default("active").notNull(),
  recurrenceId: uuid("recurrence_id").references(() => bookingRecurrences.id),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("bookings_club_starts_idx").on(table.clubId, table.startsAt),
  index("bookings_court_starts_idx").on(table.courtId, table.startsAt),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").notNull().references(() => clubs.id),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  previousData: jsonb("previous_data").default(sql`'{}'::jsonb`).notNull(),
  newData: jsonb("new_data").default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("audit_logs_club_created_idx").on(table.clubId, table.createdAt)]);

export const clubSessions = pgTable("club_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").notNull().references(() => clubs.id),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("club_sessions_token_unique").on(table.tokenHash)]);

export const superadmins = pgTable("superadmins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
}, (table) => [uniqueIndex("superadmins_email_unique").on(table.email)]);
