"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, bookings, clubs, courts, superadmins } from "@/db/schema";
import { createAdminSession, createClubSession, currentClub } from "@/lib/auth";
import { isWithinHours } from "@/lib/booking-domain";
import { dayData } from "@/lib/data";
import { verifySecret } from "@/lib/security";
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
  redirect(`/c/${slug}/today`);
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
    return { success: `Reserva creada correctamente (${booking.id.slice(0, 8)}).` };
  } catch (error) {
    if ((error as { code?: string }).code === "23P01") return { error: "Ese horario acaba de ser reservado. Selecciona otro hueco." };
    throw error;
  }
}
