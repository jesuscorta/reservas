import { AvailabilityBoard } from "@/components/availability-board";
import { ClubShell } from "@/components/club-shell";
import { requireClub } from "@/lib/auth";
import { dayData } from "@/lib/data";
import { localDate } from "@/lib/time";

export const dynamic = "force-dynamic";
export default async function CalendarPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ date?: string }> }) {
  const { slug } = await params; const { date: selected } = await searchParams; const club = await requireClub(slug);
  const initial = localDate(new Date(), "Europe/Madrid"); const date = /^\d{4}-\d{2}-\d{2}$/.test(selected ?? "") ? selected! : initial;
  const data = await dayData(club.id, date);
  return <ClubShell slug={slug} active="calendar"><div className="p-5 md:p-8"><h1 className="text-2xl font-bold">Calendario</h1><p className="mb-5 text-slate-600">Disponibilidad de {date}.</p><form className="mb-6 flex gap-2"><input name="date" defaultValue={date} type="date" className="rounded-lg border bg-white px-3 py-2"/><button className="rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white">Ver día</button></form><AvailabilityBoard slug={slug} date={date} data={data}/></div></ClubShell>;
}
