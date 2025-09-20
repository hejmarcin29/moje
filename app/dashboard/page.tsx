// app/dashboard/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export default async function Dashboard() {
  const s = await getSession();

  if (!s) redirect("/"); // nie zalogowany
  if (s.user.role === Role.ADMIN) redirect("/panel-admin");
  if (s.user.role === Role.MONTAZYSTA) redirect("/panel-montazysty");

  // fallback — gdyby doszły inne role
  redirect("/");
}
