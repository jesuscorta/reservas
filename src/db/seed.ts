import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { superadmins } from "./schema";
import { hashSecret } from "../lib/security";

const db = getDb();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (email && password) {
    const [existing] = await db.select().from(superadmins).where(eq(superadmins.email, email));
    if (!existing) await db.insert(superadmins).values({ email, passwordHash: hashSecret(password) });
  }
  console.log("Superadmin preparado. Crea el primer club desde /superadmin.");
  process.exit(0);
}
main().catch((error) => { console.error(error); process.exit(1); });
