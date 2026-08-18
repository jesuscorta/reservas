import { AvailabilityBoard } from "@/components/availability-board";
import { ClubShell } from "@/components/club-shell";
import { requireClub } from "@/lib/auth";
import { dayData } from "@/lib/data";
import { localDate } from "@/lib/time";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function TodayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = await requireClub(slug);
  const date = localDate(new Date(), "Europe/Madrid");
  const data = await dayData(club.id, date);
  if (!data.settings.setupCompletedAt) redirect(`/c/${slug}/setup`);
  return <ClubShell slug={slug} active="today"><header className="border-b border-emerald-950/10 bg-white px-5 py-4 md:px-8"><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Hoy</p><h1 className="text-xl font-bold">{new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</h1></header><div className="mx-auto max-w-7xl p-5 md:p-8"><AvailabilityBoard slug={slug} date={date} data={data}/></div></ClubShell>;
}
