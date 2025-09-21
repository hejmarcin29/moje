"use client";

import { useEffect } from "react";

export default function PanelError(
  { error, reset }: { error: Error & { digest?: string }; reset: () => void }
) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="p-8 space-y-3">
      <h1 className="text-2xl font-semibold">Coś poszło nie tak</h1>
      <p className="text-sm text-neutral-600">
        Spróbuj ponownie. Jeśli błąd będzie wracał, daj znać administratorowi.
      </p>

      <div className="mt-2 flex gap-2">
        <button
          onClick={() => reset()}
          className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
        >
          Spróbuj ponownie
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
        >
          Wróć do strony głównej
        </button>
      </div>

      {error?.digest && (
        <p className="text-xs text-neutral-400">Kod błędu: {error.digest}</p>
      )}
    </main>
  );
}
