"use client";
import { useActionState } from "react";
import { createClub } from "@/app/actions";

export function CreateClubForm() {
  const [state, action, pending] = useActionState(async (_: { error?: string; success?: string } | null, formData: FormData) => createClub(formData), null);
  return <form action={action} className="mt-6 grid gap-4 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2"><label className="font-medium">Nombre<input required name="name" className="mt-1 w-full rounded-lg border p-2" placeholder="Club Pádel Centro"/></label><label className="font-medium">Código de acceso<input required name="accessCode" type="password" minLength={4} className="mt-1 w-full rounded-lg border p-2"/></label><label className="font-medium">Número de pistas <span className="font-normal text-slate-500">(opcional)</span><input name="courtCount" type="number" min="1" max="30" className="mt-1 w-full rounded-lg border p-2"/></label><div className="flex items-end"><button disabled={pending} className="w-full rounded-lg bg-emerald-700 p-3 font-bold text-white">{pending ? "Creando..." : "Crear club"}</button></div>{state?.error && <p role="alert" className="text-sm font-medium text-red-700 sm:col-span-2">{state.error}</p>}{state?.success && <p role="status" className="text-sm font-medium text-emerald-700 sm:col-span-2">Club creado. Ya puedes abrir su acceso.</p>}</form>;
}
