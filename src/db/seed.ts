import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { businessHours, bookings, clubs, clubSettings, courts, superadmins } from "./schema";
import { hashSecret } from "../lib/security";

const db = getDb();

async function seedClub(name: string, slug: string) {
  const [existing] = await db.select().from(clubs).where(eq(clubs.slug, slug));
  if (existing) return existing;
  const [club] = await db.insert(clubs).values({ name, slug, accessCodeHash: hashSecret("1234") }).returning();
  await db.insert(clubSettings).values({ clubId: club.id, slotDurationMinutes: 90, timezone: "Europe/Madrid" });
  const createdCourts = await db.insert(courts).values(Array.from({ length: 6 }, (_, sortOrder) => ({ clubId: club.id, name: `Pista ${sortOrder + 1}`, sortOrder }))).returning();
  await db.insert(businessHours).values(Array.from({ length: 7 }, (_, dayOfWeek) => ({ clubId: club.id, dayOfWeek, openingTime: "09:00", closingTime: "23:00" })));
  const today = new Date(); today.setHours(18, 0, 0, 0);
  await db.insert(bookings).values([
    { clubId: club.id, courtId: createdCourts[0].id, startsAt: today, endsAt: new Date(today.getTime() + 90 * 60000), type: "reservation", customerName: "Antonio López" },
    { clubId: club.id, courtId: createdCourts[1].id, startsAt: new Date(today.getTime() - 90 * 60000), endsAt: today, type: "lesson", customerName: "Clase de iniciación" },
    { clubId: club.id, courtId: createdCourts[2].id, startsAt: new Date(today.getTime() + 90 * 60000), endsAt: new Date(today.getTime() + 180 * 60000), type: "blocked", notes: "Mantenimiento" },
  ]);
  return club;
}

async function main() {
  await seedClub("Club Demo Pádel", "demo-padel");
  await seedClub("Pádel Sierra", "padel-sierra");
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (email && password) {
    const [existing] = await db.select().from(superadmins).where(eq(superadmins.email, email));
    if (!existing) await db.insert(superadmins).values({ email, passwordHash: hashSecret(password) });
  }
  process.exit(0);
}
main().catch((error) => { console.error(error); process.exit(1); });
