import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import BackBar from "@/app/(panel)/_components/BackBar";

export default async function MonterLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s || s.user.role !== Role.MONTAZYSTA) redirect("/");

  return (
    <div className="min-h-dvh">
      <BackBar homeHref="/panel-montazysty" homeLabel="Panel montera" />
      <div className="p-8">{children}</div>
    </div>
  );
}
