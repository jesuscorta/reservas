import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type Database, getDb } from "@/db";
import { clubSessions, clubs, superadmins } from "@/db/schema";
import { newToken, tokenHash } from "./security";

const CLUB_COOKIE = "reservas_club";
const ADMIN_COOKIE = "reservas_admin";
const sessionOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };

export async function createClubSession(clubId: string, db: Database = getDb()) {
  const token = newToken();
  await db.insert(clubSessions).values({ clubId, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + 30 * 86400000) });
  (await cookies()).set(CLUB_COOKIE, token, sessionOptions);
}

export async function currentClub(db: Database = getDb()) {
  const token = (await cookies()).get(CLUB_COOKIE)?.value;
  if (!token) return null;
  const [session] = await db.select({ club: clubs }).from(clubSessions).innerJoin(clubs, eq(clubs.id, clubSessions.clubId)).where(and(eq(clubSessions.tokenHash, tokenHash(token)), gt(clubSessions.expiresAt, new Date()))).limit(1);
  if (!session?.club.isActive) return null;
  return session.club;
}

export async function requireClub(slug: string, db?: Database) {
  const club = await currentClub(db);
  if (!club || club.slug !== slug) redirect(`/c/${slug}`);
  return club;
}

export async function createAdminSession(id: string) { (await cookies()).set(ADMIN_COOKIE, id, sessionOptions); }
export async function requireAdmin() {
  const id = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!id) redirect("/login");
  const [admin] = await getDb().select().from(superadmins).where(eq(superadmins.id, id)).limit(1);
  if (!admin) redirect("/login");
  return admin;
}
