"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, bookings, businessHours, clubSettings, clubs, courts, superadmins } from "@/db/schema";
import { createAdminSession, createClubSession, currentClub, requireAdmin } from "@/lib/auth";
import { isWithinHours } from "@/lib/booking-domain";
import { dayData } from "@/lib/data";
import { hashSecret, verifySecret } from "@/lib/security";
import { toInstant } from "@/lib/time";

export async function loginAdmin(formData: FormData) {
  const input = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: "Introduce un email y contraseña válidos." };
  const db = getDb();
  const [admin] = await db.select().from(superadmins).where(eq(superadmins.email, input.data.email.toLowerCase())).limit(1);
  if (!admin || !verifySecret(input.data.password, admin.passwordHash)) return { error: "Email o contraseña incorrectos." };
  await createAdminSession(admin.id);
  redirect("/superadmin");
}

export async function loginClub(slug: string, formData: FormData) {
  const code = z.string().min(1).safeParse(formData.get("access-code"));
  if (!code.success) return { error: "Introduce el código de acceso." };
  const db = getDb();
  const [club] = await db.select().from(clubs).where(eq(clubs.slug, slug)).limit(1);
  if (!club || !club.isActive || !verifySecret(code.data, club.accessCodeHash)) return { error: "Código de acceso incorrecto." };
  await createClubSession(club.id, db);
  await db.update(clubs).set({ lastAccessAt: new Date() }).where(eq(clubs.id, club.id));
  const [settings] = await db.select().from(clubSettings).where(eq(clubSettings.clubId, club.id)).limit(1);
  redirect(settings?.setupCompletedAt ? `/c/${slug}/today` : `/c/${slug}/setup`);
}

const clubInput = z.object({ name: z.string().trim().min(2).max(100), accessCode: z.string().min(4).max(100), courtCount: z.coerce.number().int().min(0).max(30).optional() });
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export async function createClub(formData: FormData) {
  await requireAdmin();
  const parsed = clubInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revisa el nombre, código y número de pistas." };
  const db = getDb(); const base = slugify(parsed.data.name) || "club";
  let slug = base; let suffix = 2;
  while ((await db.select({ id: clubs.id }).from(clubs).where(eq(clubs.slug, slug)).limit(1))[0]) slug = `${base}-${suffix++}`;
  const club = await db.transaction(async (tx) => {
    const [created] = await tx.insert(clubs).values({ name: parsed.data.name, slug, accessCodeHash: hashSecret(parsed.data.accessCode) }).returning();
    await tx.insert(clubSettings).values({ clubId: created.id });
    const count = parsed.data.courtCount ?? 0;
    if (count) await tx.insert(courts).values(Array.from({ length: count }, (_, sortOrder) => ({ clubId: created.id, name: `Pista ${sortOrder + 1}`, sortOrder })));
    await tx.insert(auditLogs).values({ clubId: created.id, actorType: "superadmin", action: "CLUB_CREATED", entityType: "club", entityId: created.id, newData: { name: created.name, slug } });
    return created;
  });
  revalidatePath("/superadmin");
  return { success: club.slug };
}

const setupInput = z.object({ slug: z.string(), courtCount: z.coerce.number().int().min(1).max(30), openingTime: z.string().regex(/^\d{2}:\d{2}$/), closingTime: z.string().regex(/^\d{2}:\d{2}$/), slotDurationMinutes: z.coerce.number().int().min(30).max(240), paymentTrackingEnabled: z.coerce.boolean() });
export async function completeSetup(formData: FormData) {
  const input = setupInput.safeParse(Object.fromEntries(formData)); if (!input.success) return { error: "Revisa la configuración del club." };
  const db = getDb(); const club = await currentClub(db); if (!club || club.slug !== input.data.slug) return { error: "Tu sesión ha caducado." };
  await db.transaction(async (tx) => {
    const existing = await tx.select().from(courts).where(eq(courts.clubId, club.id));
    if (!existing.length) await tx.insert(courts).values(Array.from({ length: input.data.courtCount }, (_, sortOrder) => ({ clubId: club.id, name: `Pista ${sortOrder + 1}`, sortOrder })));
    await tx.insert(businessHours).values(Array.from({ length: 7 }, (_, dayOfWeek) => ({ clubId: club.id, dayOfWeek, openingTime: input.data.openingTime, closingTime: input.data.closingTime }))).onConflictDoUpdate({ target: [businessHours.clubId, businessHours.dayOfWeek], set: { openingTime: input.data.openingTime, closingTime: input.data.closingTime, isClosed: false, updatedAt: new Date() } });
    await tx.update(clubSettings).set({ slotDurationMinutes: input.data.slotDurationMinutes, paymentTrackingEnabled: input.data.paymentTrackingEnabled, setupCompletedAt: new Date(), updatedAt: new Date() }).where(eq(clubSettings.clubId, club.id));
    await tx.insert(auditLogs).values({ clubId: club.id, actorType: "club", action: "SETTINGS_UPDATED", entityType: "club_settings", newData: { setupCompleted: true } });
  });
  revalidatePath(`/c/${club.slug}/today`); redirect(`/c/${club.slug}/today`);
}

const bookingInput = z.object({ slug: z.string().min(1), date: z.string().date(), courtId: z.string().uuid(), startTime: z.string().regex(/^\d{2}:\d{2}$/), durationSlots: z.coerce.number().int().min(1).max(12), type: z.enum(["reservation", "lesson", "blocked", "other"]), customerName: z.string().trim().max(120).optional(), notes: z.string().trim().max(1000).optional() });
export async function createBooking(formData: FormData) {
  const parsed = bookingInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revisa los datos de la reserva." };
  const input = parsed.data;
  const db = getDb();
  const club = await currentClub(db);
  if (!club || club.slug !== input.slug) return { error: "Tu sesión ha caducado." };
  const [data, courtResult] = await Promise.all([
    dayData(club.id, input.date, db),
    db.select().from(courts).where(and(eq(courts.id, input.courtId), eq(courts.clubId, club.id), eq(courts.isActive, true))).limit(1),
  ]);
  const [court] = courtResult;
  if (!court) return { error: "La pista está desactivada o no existe." };
  if (!isWithinHours(input.startTime, input.durationSlots, data.settings.slotDurationMinutes, data.hours)) return { error: "No se puede reservar fuera del horario del club." };
  const startsAt = toInstant(input.date, input.startTime, data.settings.timezone);
  const endsAt = new Date(startsAt.getTime() + input.durationSlots * data.settings.slotDurationMinutes * 60000);
  try {
    const [booking] = await db.transaction(async (tx) => {
      const [created] = await tx.insert(bookings).values({ clubId: club.id, courtId: court.id, startsAt, endsAt, type: input.type, customerName: input.customerName || null, notes: input.notes || null }).returning();
      await tx.insert(auditLogs).values({ clubId: club.id, actorType: "club", action: "BOOKING_CREATED", entityType: "booking", entityId: created.id, newData: { startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), type: input.type } });
      return [created];
    });
    revalidatePath(`/c/${input.slug}/today`);
    return { success: "Reserva creada correctamente.", bookingId: booking.id };
  } catch (error) {
    if ((error as { code?: string }).code === "23P01") return { error: "Ese horario acaba de ser reservado. Selecciona otro hueco." };
    throw error;
  }
}

export async function cancelBooking(bookingId: string, slug: string) {
  const db = getDb(); const club = await currentClub(db); if (!club || club.slug !== slug) return { error: "Tu sesión ha caducado." };
  const [booking] = await db.select().from(bookings).where(and(eq(bookings.id, bookingId), eq(bookings.clubId, club.id), eq(bookings.status, "active"))).limit(1);
  if (!booking) return { error: "La reserva ya no está disponible." };
  await db.transaction(async (tx) => { await tx.update(bookings).set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() }).where(eq(bookings.id, booking.id)); await tx.insert(auditLogs).values({ clubId: club.id, actorType: "club", action: "BOOKING_CANCELLED", entityType: "booking", entityId: booking.id, previousData: { status: "active" }, newData: { status: "cancelled" } }); });
  revalidatePath(`/c/${slug}/today`); return { success: "Reserva deshecha." };
}

export async function updateSettings(formData: FormData) {
  const input = setupInput.safeParse(Object.fromEntries(formData)); if (!input.success) return { error: "Revisa los ajustes." };
  const db = getDb(); const club = await currentClub(db); if (!club || club.slug !== input.data.slug) return { error: "Tu sesión ha caducado." };
  await db.transaction(async (tx) => { await tx.insert(businessHours).values(Array.from({ length: 7 }, (_, dayOfWeek) => ({ clubId: club.id, dayOfWeek, openingTime: input.data.openingTime, closingTime: input.data.closingTime }))).onConflictDoUpdate({ target: [businessHours.clubId, businessHours.dayOfWeek], set: { openingTime: input.data.openingTime, closingTime: input.data.closingTime, isClosed: false, updatedAt: new Date() } }); await tx.update(clubSettings).set({ slotDurationMinutes: input.data.slotDurationMinutes, paymentTrackingEnabled: input.data.paymentTrackingEnabled, updatedAt: new Date() }).where(eq(clubSettings.clubId, club.id)); await tx.insert(auditLogs).values({ clubId: club.id, actorType: "club", action: "SETTINGS_UPDATED", entityType: "club_settings", newData: { slotDurationMinutes: input.data.slotDurationMinutes } }); });
  revalidatePath(`/c/${club.slug}/settings`); revalidatePath(`/c/${club.slug}/today`); return { success: "Cambios guardados." };
}
