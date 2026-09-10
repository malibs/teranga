"use client"

import { useEffect, useMemo, useState } from "react"

type ReservationStatus = "en_attente" | "confirmee" | "terminee"

type Reservation = {
  id: string
  name: string
  email: string
  phone: string
  vehicleName: string
  startDate: string
  endDate: string
  notes: string
  status: ReservationStatus
  createdAt: string
}

type Summary = {
  total: number
  en_attente: number
  confirmee: number
  terminee: number
}

const labels: Record<ReservationStatus, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
}

export default function AdminReservationsPage() {
  const [secret, setSecret] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [filter, setFilter] = useState<ReservationStatus | "tous">("tous")
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, en_attente: 0, confirmee: 0, terminee: 0 })
  const [error, setError] = useState("")

  useEffect(() => {
    const stored = window.sessionStorage.getItem("teranga-admin-secret") || ""
    setSecret(stored)
    if (stored) {
      loadReservations(stored)
    }
  }, [])

  const loadReservations = async (adminSecret: string) => {
    setError("")
    setIsLoaded(true)

    const response = await fetch("/api/reservations/admin", {
      headers: { "x-admin-secret": adminSecret },
    })

    const payload = await response.json()
    if (!response.ok || !payload.success) {
      setError(payload.message || "Impossible de charger les réservations.")
      return
    }

    setReservations(payload.reservations || [])
    setSummary(payload.summary || { total: 0, en_attente: 0, confirmee: 0, terminee: 0 })
  }

  const handleStatusUpdate = async (reservationId: string, nextStatus: ReservationStatus) => {
    const response = await fetch("/api/reservations/admin", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify({ id: reservationId, status: nextStatus }),
    })

    const payload = await response.json()
    if (!response.ok || !payload.success) {
      setError(payload.message || "La mise à jour du statut a échoué.")
      return
    }

    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === reservationId ? { ...reservation, status: nextStatus } : reservation,
      ),
    )
    await loadReservations(secret)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.sessionStorage.setItem("teranga-admin-secret", secret)
    loadReservations(secret)
  }

  const filteredReservations = useMemo(() => {
    if (filter === "tous") {
      return reservations
    }

    return reservations.filter((reservation) => reservation.status === filter)
  }, [filter, reservations])

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Gestion des réservations</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            type="password"
            placeholder="Secret administrateur"
            className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm"
          />
          <button type="submit" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            Charger
          </button>
        </form>
      </div>

      {error ? <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      {!isLoaded ? (
        <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Saisissez le secret administrateur pour afficher les réservations.
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="mt-3 text-3xl font-bold">{summary.total}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="mt-3 text-3xl font-bold text-amber-600">{summary.en_attente}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Confirmées</p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">{summary.confirmee}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Terminées</p>
              <p className="mt-3 text-3xl font-bold text-slate-600">{summary.terminee}</p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {(["tous", "en_attente", "confirmee", "terminee"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === option ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"
                }`}
              >
                {option === "tous" ? "Toutes" : labels[option]}
              </button>
            ))}
          </div>

          {filteredReservations.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
              Aucune réservation pour ce filtre.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <article key={reservation.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold">{reservation.name}</h2>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          {labels[reservation.status]}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">{reservation.vehicleName}</p>

                      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                        <p><strong>Email :</strong> {reservation.email}</p>
                        <p><strong>Téléphone :</strong> {reservation.phone}</p>
                        <p><strong>Début :</strong> {reservation.startDate}</p>
                        <p><strong>Fin :</strong> {reservation.endDate}</p>
                      </div>

                      {reservation.notes ? (
                        <div className="mt-4 rounded-lg bg-background p-3 text-sm text-foreground">
                          {reservation.notes}
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full max-w-xs">
                      <label className="mb-2 block text-sm font-medium">Changer le statut</label>
                      <select
                        value={reservation.status}
                        onChange={(event) => handleStatusUpdate(reservation.id, event.target.value as ReservationStatus)}
                        className="h-11 w-full rounded-md border border-input bg-background px-3"
                      >
                        <option value="en_attente">En attente</option>
                        <option value="confirmee">Confirmée</option>
                        <option value="terminee">Terminée</option>
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
