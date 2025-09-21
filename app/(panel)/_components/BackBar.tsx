"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOutAction } from "@/app/(panel)/_actions/logout";

type Props = {
  homeHref: string;     // np. "/panel-admin" albo "/panel-montazysty"
  homeLabel: string;    // np. "Panel admina" albo "Panel montera"
};

export default function BackBar({ homeHref, homeLabel }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl flex items-center gap-3 p-3">
        <button
          onClick={() => router.back()}
          className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
        >
          ← Wstecz
        </button>

        <Link
          href={homeHref}
          className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
        >
          {homeLabel}
        </Link>

        <span className="ml-auto text-sm text-neutral-500">{pathname}</span>

        <form
          action={async () => {
            await signOutAction();
            router.replace("/");
          }}
        >
          <button className="rounded-md border px-3 py-1.5 hover:bg-neutral-50">
            Wyloguj
          </button>
        </form>
      </div>
    </header>
  );
}
