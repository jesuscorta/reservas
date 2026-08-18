import { loginClub } from "@/app/actions";

export default async function ClubAccess({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <main className="grid min-h-screen place-items-center p-5"><section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm"><span className="text-sm font-bold uppercase tracking-widest text-emerald-700">Acceso del club</span><h1 className="mt-2 text-2xl font-bold">Introduce el código de acceso</h1><p className="mt-2 text-slate-600">Este acceso es solo para el equipo del club.</p><form action={async (formData) => { "use server"; await loginClub(slug, formData); }} className="mt-6 space-y-4"><label className="block font-medium">Código de acceso<input name="access-code" type="password" className="mt-1 w-full rounded-lg border border-slate-300 p-3" autoFocus autoComplete="current-password" required/></label><button className="w-full rounded-lg bg-emerald-700 p-3 font-bold text-white">Acceder</button></form></section></main>;
}
