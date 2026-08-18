import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Eye, Plus } from "lucide-react";
import { CreateClubForm } from "@/components/create-club-form";
import { getDb } from "@/db";
import { clubs, courts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function SuperadminPage() {
  await requireAdmin();
  const rows = await getDb().select({ id: clubs.id, name: clubs.name, slug: clubs.slug, isActive: clubs.isActive, lastAccessAt: clubs.lastAccessAt, courtCount: count(courts.id) }).from(clubs).leftJoin(courts, eq(courts.clubId, clubs.id)).groupBy(clubs.id).orderBy(desc(clubs.createdAt));
  return <main className="min-h-screen p-5 md:p-10"><div className="mx-auto max-w-6xl"><header><p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Reservas</p><h1 className="text-2xl font-bold">Clubes</h1></header><section className="mt-6"><h2 className="flex items-center gap-2 font-bold"><Plus size={19}/>Crear club</h2><CreateClubForm/></section>{rows.length === 0 ? <div className="mt-7 rounded-xl bg-white p-8 text-center shadow-sm"><h2 className="font-bold">Todavía no hay clubes.</h2><p className="mt-1 text-slate-600">Crea el primero para empezar.</p></div> : <div className="mt-7 overflow-x-auto rounded-xl bg-white shadow-sm"><table className="min-w-full text-left"><thead className="border-b bg-slate-50 text-sm text-slate-600"><tr><th className="p-4">Club</th><th className="p-4">Pistas</th><th className="p-4">Estado</th><th className="p-4">Último acceso</th><th className="p-4"><span className="sr-only">Abrir</span></th></tr></thead><tbody>{rows.map((club) => <tr key={club.id} className="border-b last:border-0"><td className="p-4 font-semibold">{club.name}</td><td className="p-4">{club.courtCount}</td><td className="p-4">{club.isActive ? "Activo" : "Desactivado"}</td><td className="p-4 text-slate-600">{club.lastAccessAt ? new Intl.DateTimeFormat("es-ES", { dateStyle: "short" }).format(club.lastAccessAt) : "Sin accesos"}</td><td className="p-4"><Link href={`/c/${club.slug}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-emerald-700"><Eye size={18}/>Abrir</Link></td></tr>)}</tbody></table></div>}</div></main>;
}
