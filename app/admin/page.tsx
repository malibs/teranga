"use client"

import { useEffect, useState } from "react"

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
  const [secret, setSecret] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadRequests = async (adminSecret: string) => {
    setIsLoading(true)
    setError("")

    fetch("/api/contact", {
      headers: { "x-admin-secret": adminSecret },
    })
      .then(async (response) => {
        const payload = (await response.json()) as { success?: boolean; requests?: ContactRequest[]; message?: string }

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Accès refusé")
        }

        setRequests(payload.requests || [])
        setIsAuthenticated(true)
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Impossible de charger les demandes.")
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    const savedSecret = window.sessionStorage.getItem("teranga-admin-secret")

    if (savedSecret) {
      setSecret(savedSecret)
      loadRequests(savedSecret)
    }
  }, [])

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.sessionStorage.setItem("teranga-admin-secret", secret)
    loadRequests(secret)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Demandes de contact</h1>
        </div>
      </div>

      {!isAuthenticated && !isLoading ? (
        <form onSubmit={handleLogin} className="max-w-md rounded-xl border border-border bg-card p-6">
          <label htmlFor="admin-secret" className="text-sm font-medium">
            Secret administrateur
          </label>
          <input
            id="admin-secret"
            type="password"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            placeholder="Votre secret Vercel"
            className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
          <button
            type="submit"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Accéder aux demandes
          </button>
        </form>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      {isAuthenticated && isLoading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Chargement des demandes...
        </div>
      ) : isAuthenticated && requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Aucune demande enregistrée pour le moment.
        </div>
      ) : isAuthenticated ? (
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
      ) : null}
    </main>
  )
}
