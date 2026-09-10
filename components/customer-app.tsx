"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, CarFront, CheckCircle2, Clock3, LogOut, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { vehicles } from "@/lib/vehicles"

type User = {
  id: string
  name: string
  email: string
  phone: string
}

type Reservation = {
  id: string
  vehicleId: string
  vehicleName: string
  startDate: string
  endDate: string
  notes: string
  status: "en_attente" | "confirmee" | "terminee"
  createdAt: string
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
}

const statusLabel = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
}

export function CustomerApp() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [user, setUser] = useState<User | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState("")
  const [booking, setBooking] = useState({ vehicleId: vehicles[0]?.id ?? "", vehicleName: vehicles[0]?.name ?? "", startDate: "", endDate: "", notes: "" })
  const [bookingStatus, setBookingStatus] = useState("")

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" })
      if (!response.ok) {
        setUser(null)
        setLoading(false)
        return
      }

      const payload = await response.json()
      setUser(payload.user)
      await fetchReservations()
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchReservations = async () => {
    const response = await fetch("/api/reservations", { cache: "no-store" })
    if (!response.ok) {
      return
    }

    const payload = await response.json()
    setReservations(payload.reservations || [])
  }

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
    const body = mode === "login"
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, phone: form.phone, password: form.password }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const payload = await response.json()
    if (!response.ok || !payload.success) {
      setError(payload.message || "Erreur d’authentification")
      return
    }

    setUser(payload.user as User)
    setForm(initialForm)
    setMode("login")
    await fetchReservations()
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setReservations([])
  }

  const handleBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBookingStatus("")

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: booking.vehicleId,
        vehicleName: booking.vehicleName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        notes: booking.notes,
      }),
    })

    const payload = await response.json()
    if (!response.ok || !payload.success) {
      setBookingStatus(payload.message || "La réservation n’a pas pu être enregistrée.")
      return
    }

    setBookingStatus("Réservation enregistrée avec succès. Notre équipe vous répondra rapidement.")
    setBooking((current) => ({ ...current, startDate: "", endDate: "", notes: "" }))
    await fetchReservations()
  }

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === booking.vehicleId) || vehicles[0],
    [booking.vehicleId],
  )

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-sm text-muted-foreground">Chargement de votre espace client…</div>
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Espace client</p>
            <h2 className="mt-3 font-display text-4xl font-700 tracking-tight">Bienvenue chez Teranga</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Gérer facilement vos locations, suivre vos réservations et réserver le véhicule idéal en quelques clics.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card/80 p-4">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-medium">Sécurisé</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-4">
                <CalendarDays className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-medium">Suivi</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-4">
                <CarFront className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-medium">Véhicules</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAuth} className="rounded-[28px] border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex rounded-xl border border-border bg-muted p-1">
              <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "login" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
                Connexion
              </button>
              <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "register" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
                Inscription
              </button>
            </div>

            {mode === "register" ? (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Nom complet</label>
                <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3" required />
              </div>
            ) : null}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3" required />
            </div>

            {mode === "register" ? (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Téléphone</label>
                <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3" required />
              </div>
            ) : null}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Mot de passe</label>
              <input type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3" required />
            </div>

            {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

            <Button type="submit" className="w-full">
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Espace client</p>
          <h2 className="mt-2 font-display text-4xl font-700 tracking-tight">Bonjour, {user.name}</h2>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Réservations</p>
          <p className="mt-3 text-3xl font-bold">{reservations.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Statut</p>
          <p className="mt-3 text-3xl font-bold">Actif</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Véhicule favori</p>
          <p className="mt-3 text-lg font-semibold">{selectedVehicle?.name ?? "Aucun"}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <UserRound className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl font-700">Profil client</h3>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-muted p-3"><span className="block text-muted-foreground">Nom</span><strong>{user.name}</strong></div>
              <div className="rounded-xl bg-muted p-3"><span className="block text-muted-foreground">E-mail</span><strong>{user.email}</strong></div>
              <div className="rounded-xl bg-muted p-3"><span className="block text-muted-foreground">Téléphone</span><strong>{user.phone}</strong></div>
              <div className="rounded-xl bg-muted p-3"><span className="block text-muted-foreground">Statut</span><strong>Client premium</strong></div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl font-700">Nouvelle réservation</h3>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Véhicule</label>
                  <select value={booking.vehicleId} onChange={(e) => {
                    const vehicle = vehicles.find((item) => item.id === e.target.value)
                    setBooking((current) => ({ ...current, vehicleId: e.target.value, vehicleName: vehicle?.name || "" }))
                  }} className="h-11 w-full rounded-md border border-input bg-background px-3">
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Véhicule sélectionné</label>
                  <div className="flex h-11 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium">{selectedVehicle?.name}</div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Date de début</label>
                  <input type="date" value={booking.startDate} onChange={(e) => setBooking((current) => ({ ...current, startDate: e.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Date de fin</label>
                  <input type="date" value={booking.endDate} onChange={(e) => setBooking((current) => ({ ...current, endDate: e.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3" required />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Notes / exigences</label>
                <textarea value={booking.notes} onChange={(e) => setBooking((current) => ({ ...current, notes: e.target.value }))} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2" placeholder="Ex: chauffeur requis, horaires préférés, destination…" />
              </div>

              {bookingStatus ? <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{bookingStatus}</div> : null}

              <Button type="submit" className="w-full">Valider la réservation</Button>
            </form>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <CarFront className="h-5 w-5 text-primary" />
            <h3 className="font-display text-2xl font-700">Suivi des réservations</h3>
          </div>

          <div className="space-y-4">
            {reservations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted p-5 text-sm text-muted-foreground">
                Aucune réservation enregistrée pour le moment.
              </div>
            ) : reservations.map((reservation) => (
              <div key={reservation.id} className="rounded-2xl border border-border bg-muted p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-base">{reservation.vehicleName}</strong>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {statusLabel[reservation.status]}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> {reservation.startDate} → {reservation.endDate}</div>
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {user.email}</div>
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {user.phone}</div>
                  {reservation.notes ? (
                    <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5" /> {reservation.notes}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" /> Confirmation rapide
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Nos équipes traitent vos demandes par téléphone et WhatsApp pour une réponse rapide.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
