"use client";

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { signOutAction } from "@/app/(panel)/_actions/logout"
import { Button } from "@/components/ui/button"

type Props = {
  homeHref: string;     // np. "/panel-admin" albo "/panel-montazysty"
  homeLabel: string;    // np. "Panel admina" albo "Panel montera"
};

export default function BackBar({ homeHref, homeLabel }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 p-3">
        <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
          ← Wstecz
        </Button>

        <Button asChild variant="outline" size="sm">
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>

        <span className="ml-auto text-sm text-neutral-500">{pathname}</span>

        <form
          action={async () => {
            await signOutAction()
            router.replace("/")
          }}
        >
          <Button variant="outline" size="sm">
            Wyloguj
          </Button>
        </form>
      </div>
    </header>
  )
}
