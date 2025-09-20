import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import BackBar from "@/app/(panel)/_components/BackBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s || s.user.role !== Role.ADMIN) redirect("/");

  return (
    <div className="min-h-dvh">
      <BackBar homeHref="/panel-admin" homeLabel="Panel admina" />
      <div className="p-8">{children}</div>
    </div>
  );
}

