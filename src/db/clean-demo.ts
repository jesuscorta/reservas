import { sql } from "drizzle-orm";
import { getDb } from "./index";

async function main() {
  const db = getDb();
  // Explicitly targets only legacy seed slugs; it never touches real clubs.
  await db.execute(sql`DELETE FROM club_sessions WHERE club_id IN (SELECT id FROM clubs WHERE slug IN ('demo-padel', 'padel-sierra'))`);
  await db.execute(sql`DELETE FROM audit_logs WHERE club_id IN (SELECT id FROM clubs WHERE slug IN ('demo-padel', 'padel-sierra'))`);
  await db.execute(sql`DELETE FROM bookings WHERE club_id IN (SELECT id FROM clubs WHERE slug IN ('demo-padel', 'padel-sierra'))`);
  await db.execute(sql`DELETE FROM booking_recurrences WHERE club_id IN (SELECT id FROM clubs WHERE slug IN ('demo-padel', 'padel-sierra'))`);
  await db.execute(sql`DELETE FROM special_hours WHERE club_id IN (SELECT id FROM clubs WHERE slug IN ('demo-padel', 'padel-sierra'))`);
  await db.execute(sql`DELETE FROM business_hours WHERE club_id IN (SELECT id FROM clubs WHERE slug IN ('demo-padel', 'padel-sierra'))`);
  await db.execute(sql`DELETE FROM courts WHERE club_id IN (SELECT id FROM clubs WHERE slug IN ('demo-padel', 'padel-sierra'))`);
  await db.execute(sql`DELETE FROM club_settings WHERE club_id IN (SELECT id FROM clubs WHERE slug IN ('demo-padel', 'padel-sierra'))`);
  await db.execute(sql`DELETE FROM clubs WHERE slug IN ('demo-padel', 'padel-sierra')`);
  console.log("Datos demo eliminados.");
}
main().catch((error) => { console.error(error); process.exit(1); });
