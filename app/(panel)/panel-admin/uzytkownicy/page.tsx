// app/(panel)/panel-admin/uzytkownicy/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import AddUserForm from "./AddUserForm";
import UserRowActions from "./UserRowActions";

export const metadata = { title: "Użytkownicy — Admin" };

export default async function UsersPage() {
  const s = await getSession();
  if (!s || s.user.role !== Role.ADMIN) redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { id: "desc" },
    select: { id: true, email: true, firstName: true, role: true, isActive: true },
  });

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Użytkownicy</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">E-mail</th>
              <th className="px-3 py-2 text-left">Edycja</th>
              <th className="px-3 py-2 text-left">Rola</th>
              <th className="px-3 py-2 text-left">Aktywny</th>
              <th className="px-3 py-2 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t align-top">
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.firstName ?? "—"}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">{u.isActive ? "tak" : "nie"}</td>
                <UserRowActions id={u.id} firstName={u.firstName} role={u.role} isActive={u.isActive} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserForm />
    </main>
  );
}
