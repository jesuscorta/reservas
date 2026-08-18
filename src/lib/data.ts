import { and, asc, eq, gte, lt } from "drizzle-orm";
import { type Database, getDb } from "@/db";
import { bookings, businessHours, clubSettings, courts, specialHours } from "@/db/schema";
import { dayOfWeek, nextDate, toInstant } from "./time";
import { makeSlots } from "./booking-domain";

export async function dayData(clubId: string, date: string, db: Database = getDb()) {
  const [[settings], activeCourts, [special], [regular]] = await Promise.all([
    db.select().from(clubSettings).where(eq(clubSettings.clubId, clubId)).limit(1),
    db.select().from(courts).where(and(eq(courts.clubId, clubId), eq(courts.isActive, true))).orderBy(asc(courts.sortOrder)),
    db.select().from(specialHours).where(and(eq(specialHours.clubId, clubId), eq(specialHours.date, date))).limit(1),
    db.select().from(businessHours).where(and(eq(businessHours.clubId, clubId), eq(businessHours.dayOfWeek, dayOfWeek(date)))).limit(1),
  ]);
  if (!settings) throw new Error("El club no tiene configuración.");
  const hours = special ?? regular ?? { openingTime: null, closingTime: null, isClosed: true };
  const start = toInstant(date, "00:00", settings.timezone);
  const end = toInstant(nextDate(date), "00:00", settings.timezone);
  const dayBookings = await db.select().from(bookings).where(and(eq(bookings.clubId, clubId), eq(bookings.status, "active"), gte(bookings.startsAt, start), lt(bookings.startsAt, end))).orderBy(asc(bookings.startsAt));
  return { settings, courts: activeCourts, hours, slots: makeSlots(hours, settings.slotDurationMinutes), bookings: dayBookings };
}
