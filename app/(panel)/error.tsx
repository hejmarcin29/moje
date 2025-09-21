"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function PanelError(
  { error, reset }: { error: Error & { digest?: string }; reset: () => void }
) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="space-y-3 p-8">
      <h1 className="text-2xl font-semibold">Coś poszło nie tak</h1>
      <p className="text-sm text-neutral-600">
        Spróbuj ponownie. Jeśli błąd będzie wracał, daj znać administratorowi.
      </p>

      <div className="mt-2 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => reset()}>
          Spróbuj ponownie
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = "/")}
        >
          Wróć do strony głównej
        </Button>
      </div>

      {error?.digest && (
        <p className="text-xs text-neutral-400">Kod błędu: {error.digest}</p>
      )}
    </main>
  )
}
