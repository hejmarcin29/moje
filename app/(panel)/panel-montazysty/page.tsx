import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import Link from "next/link";

export const metadata = { title: "Panel montera" };

export default async function MonterPanel() {
  const s = await getSession();
  if (!s || s.user.role !== Role.MONTAZYSTA) redirect("/");

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Panel MONTAŻYSTY</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/panel-montazysty/zlecenia" className="rounded-xl border p-4 transition hover:bg-neutral-50">
          <div className="text-lg font-medium">Moje zlecenia</div>
          <p className="text-sm text-neutral-600">Podgląd i aktualizacja statusu.</p>
        </Link>
      </div>
    </main>
  );
}
