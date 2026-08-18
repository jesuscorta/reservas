import { count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SetupForm } from "@/components/setup-form";
import { getDb } from "@/db";
import { clubSettings, courts } from "@/db/schema";
import { requireClub } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function SetupPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const club = await requireClub(slug); const db = getDb(); const [[settings], [{ courtCount }]] = await Promise.all([db.select().from(clubSettings).where(eq(clubSettings.clubId, club.id)).limit(1), db.select({ courtCount: count(courts.id) }).from(courts).where(eq(courts.clubId, club.id))]); if (settings?.setupCompletedAt) redirect(`/c/${slug}/today`); return <main className="grid min-h-screen place-items-center p-5"><section className="w-full max-w-xl rounded-2xl bg-white p-7 shadow-sm"><p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Primer acceso</p><h1 className="mt-2 text-2xl font-bold">Configura {club.name}</h1><p className="mt-2 text-slate-600">Solo necesitamos estos cuatro datos para empezar.</p><SetupForm slug={slug} initialCourtCount={courtCount}/></section></main>; }
