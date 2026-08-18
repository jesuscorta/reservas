import Link from "next/link";
import { BarChart3, CalendarDays, CircleDot, Settings } from "lucide-react";

const items = [
  ["Hoy", "today", CircleDot], ["Calendario", "calendar", CalendarDays], ["Estadísticas", "statistics", BarChart3], ["Ajustes", "settings", Settings],
] as const;

export function ClubShell({ slug, active, children }: { slug: string; active: string; children: React.ReactNode }) {
  return <div className="min-h-screen pb-20 md:grid md:grid-cols-[220px_1fr] md:pb-0">
    <aside className="hidden border-r border-emerald-950/10 bg-white p-5 md:block">
      <Link href={`/c/${slug}/today`} className="mb-10 flex items-center gap-2 text-lg font-bold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-700 text-white">R</span> Reservas</Link>
      <nav aria-label="Principal" className="space-y-1">{items.map(([label, path, Icon]) => <Link key={path} href={`/c/${slug}/${path}`} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 font-medium ${active === path ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={20}/>{label}</Link>)}</nav>
    </aside>
    <main className="min-w-0">{children}</main>
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-10 flex border-t border-emerald-950/10 bg-white px-2 py-1 md:hidden">{items.map(([label, path, Icon]) => <Link key={path} href={`/c/${slug}/${path}`} className={`flex min-h-15 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${active === path ? "text-emerald-700" : "text-slate-500"}`}><Icon size={20}/>{label}</Link>)}</nav>
  </div>;
}
