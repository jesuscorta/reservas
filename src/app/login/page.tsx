import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { loginAdmin } from "@/app/actions";

export default function LoginPage() {
  return <main className="grid min-h-screen place-items-center p-5"><section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm"><div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-white"><ShieldCheck/></div><h1 className="text-2xl font-bold">Acceso de plataforma</h1><p className="mt-2 text-slate-600">Inicia sesión como administrador de Reservas.</p><form action={async (formData) => { "use server"; await loginAdmin(formData); }} className="mt-6 space-y-4"><label className="block font-medium">Email<input name="email" type="email" className="mt-1 w-full rounded-lg border border-slate-300 p-3" autoComplete="email" required/></label><label className="block font-medium">Contraseña<input name="password" type="password" className="mt-1 w-full rounded-lg border border-slate-300 p-3" autoComplete="current-password" required/></label><button className="w-full rounded-lg bg-emerald-700 p-3 font-bold text-white">Entrar</button></form><p className="mt-6 text-sm text-slate-500">¿Acceso de club? Abre la dirección QR de tu club.</p><Link href="/c/demo-padel" className="mt-2 inline-block text-sm font-semibold text-emerald-700">Abrir acceso de club</Link></section></main>;
}
