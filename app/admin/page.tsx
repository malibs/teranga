"use client"

import { useEffect, useState } from "react"

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ""

type ContactRequest = {
  name: string
  phone: string
  subject: string
  message: string
  source: string
  createdAt: string
}

export default function AdminPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const url = ADMIN_SECRET ? `/api/contact?token=${encodeURIComponent(ADMIN_SECRET)}` : "/api/contact"

    fetch(url, {
      headers: ADMIN_SECRET ? { "x-admin-secret": ADMIN_SECRET } : undefined,
    })
      .then(async (response) => {
        const payload = (await response.json()) as { success?: boolean; requests?: ContactRequest[]; message?: string }

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Accès refusé")
        }

        setRequests(payload.requests || [])
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Impossible de charger les demandes.")
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Demandes de contact</h1>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Chargement des demandes...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Aucune demande enregistrée pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <article key={`${request.phone}-${request.createdAt}-${index}`} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{request.name}</h2>
                  <p className="text-sm text-muted-foreground">{request.subject}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {new Date(request.createdAt).toLocaleString("fr-FR")}
                </span>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><strong>Téléphone :</strong> {request.phone}</p>
                <p><strong>Source :</strong> {request.source}</p>
              </div>

              <div className="mt-4 rounded-lg bg-background p-3 text-sm text-foreground">
                {request.message}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
