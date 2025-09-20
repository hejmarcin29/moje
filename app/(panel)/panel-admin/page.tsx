// app/(panel)/panel-admin/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import Link from "next/link";

export const metadata = { title: "Panel admina" };

export default async function AdminPanel() {
  const s = await getSession();
  if (!s || s.user.role !== Role.ADMIN) redirect("/");

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Panel ADMIN</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/panel-admin/uzytkownicy"
          className="rounded-xl border p-4 transition hover:bg-neutral-50"
        >
          <div className="text-lg font-medium">Użytkownicy</div>
          <p className="text-sm text-neutral-600">
            Dodawaj adminów i monterów, zarządzaj kontami.
          </p>
        </Link>

        <Link
  href="/panel-admin/zlecenia"
  className="rounded-xl border p-4 transition hover:bg-neutral-50"
>
  <div className="text-lg font-medium">Zlecenia</div>
  <p className="text-sm text-neutral-600">Przejdź do listy zleceń.</p>
</Link>


        <div className="rounded-xl border p-4 opacity-70">
          <div className="text-lg font-medium">Raporty</div>
          <p className="text-sm text-neutral-600">Wkrótce.</p>
        </div>
      </div>
    </main>
  );
}
