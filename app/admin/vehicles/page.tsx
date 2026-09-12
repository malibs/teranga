"use client"

import { useEffect, useState } from "react"
import type { Vehicle } from "@/lib/vehicles"

type VehicleForm = {
  id: string
  name: string
  brand: string
  category: string
  image: string
  transmission: string
  seats: number
  fuel: string
  year: number
  offer: "location" | "vente"
  price: string
  priceUnit: string
  featured: boolean
}

const emptyVehicle: VehicleForm = {
  id: "",
  name: "",
  brand: "",
  category: "",
  image: "/cars/default-car.png",
  transmission: "Automatique",
  seats: 5,
  fuel: "Essence",
  year: new Date().getFullYear(),
  offer: "location",
  price: "",
  priceUnit: "FCFA / jour",
  featured: false,
}

export default function AdminVehiclesPage() {
  const [secret, setSecret] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [form, setForm] = useState<VehicleForm>(emptyVehicle)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Le fichier sélectionné n’est pas une image valide.")
      return
    }

    setError("")
    setIsUploadingImage(true)

    try {
      const uploadResponse = await fetch("/api/vehicles/upload", {
        method: "POST",
        headers: {
          "x-admin-secret": secret,
        },
        body: (() => {
          const formData = new FormData()
          formData.append("file", file)
          return formData
        })(),
      })

      const payload = await uploadResponse.json()

      if (!uploadResponse.ok || !payload.success) {
        throw new Error(payload.message || "L’upload de l’image a échoué.")
      }

      setForm((current) => ({ ...current, image: payload.image || payload.url || current.image }))
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "Erreur de lecture de l’image.")
    } finally {
      setIsUploadingImage(false)
      event.target.value = ""
    }
  }

  const loadVehicles = async (adminSecret: string) => {
    setError("")
    setIsLoading(true)
    try {
      const response = await fetch("/api/vehicles", {
        headers: { "x-admin-secret": adminSecret },
      })

      const text = await response.text()
      let payload: any = {}

      if (text) {
        try {
          payload = JSON.parse(text)
        } catch {
          payload = { success: false, message: "Réponse invalide reçue du serveur." }
        }
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Impossible de charger le parc automobile.")
      }

      setVehicles(Array.isArray(payload.vehicles) ? payload.vehicles : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erreur inconnue")
      setVehicles([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const savedSecret = window.sessionStorage.getItem("teranga-admin-secret") || ""
    setSecret(savedSecret)
    if (savedSecret) {
      loadVehicles(savedSecret)
    }
  }, [])

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")

    const response = await fetch("/api/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify(form),
    })

    const text = await response.text()
    let payload: any = {}

    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = { success: false, message: "Réponse invalide reçue du serveur." }
      }
    }

    if (!response.ok || !payload.success) {
      setError(payload.message || "L’enregistrement du véhicule a échoué.")
      return
    }

    setMessage("Véhicule enregistré avec succès.")
    setForm(emptyVehicle)
    await loadVehicles(secret)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setForm({
      id: vehicle.id,
      name: vehicle.name,
      brand: vehicle.brand,
      category: vehicle.category,
      image: vehicle.image,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      fuel: vehicle.fuel,
      year: vehicle.year,
      offer: vehicle.offer,
      price: vehicle.price,
      priceUnit: vehicle.priceUnit,
      featured: Boolean(vehicle.featured),
    })
  }

  const handleDelete = async (vehicleId: string) => {
    const response = await fetch("/api/vehicles", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify({ id: vehicleId }),
    })

    const text = await response.text()
    let payload: any = {}

    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = { success: false, message: "Réponse invalide reçue du serveur." }
      }
    }

    if (!response.ok || !payload.success) {
      setError(payload.message || "La suppression a échoué.")
      return
    }

    setMessage("Véhicule supprimé.")
    await loadVehicles(secret)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Gestion de notre parc automobile</h1>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            window.sessionStorage.setItem("teranga-admin-secret", secret)
            loadVehicles(secret)
          }}
          className="flex w-full max-w-md gap-2"
        >
          <input
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
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
      {message ? <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{message}</div> : null}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-xl font-semibold">Ajouter / modifier un véhicule</h2>

          <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm md:col-span-2">
              <span>Nom du véhicule</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-md border border-input bg-background px-3" required />
            </label>

            <label className="space-y-2 text-sm">
              <span>Marque</span>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="h-11 w-full rounded-md border border-input bg-background px-3" required />
            </label>

            <label className="space-y-2 text-sm">
              <span>Catégorie</span>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11 w-full rounded-md border border-input bg-background px-3" required />
            </label>

            <label className="space-y-2 text-sm">
              <span>Type d’offre</span>
              <select value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value as "location" | "vente" })} className="h-11 w-full rounded-md border border-input bg-background px-3">
                <option value="location">Location</option>
                <option value="vente">Vente</option>
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span>Prix</span>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-11 w-full rounded-md border border-input bg-background px-3" placeholder="75 000" />
            </label>

            <label className="space-y-2 text-sm">
              <span>Unité</span>
              <input value={form.priceUnit} onChange={(e) => setForm({ ...form, priceUnit: e.target.value })} className="h-11 w-full rounded-md border border-input bg-background px-3" placeholder="FCFA / jour" />
            </label>

            <label className="space-y-2 text-sm">
              <span>Transmission</span>
              <input value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className="h-11 w-full rounded-md border border-input bg-background px-3" />
            </label>

            <label className="space-y-2 text-sm">
              <span>Carburant</span>
              <input value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} className="h-11 w-full rounded-md border border-input bg-background px-3" />
            </label>

            <label className="space-y-2 text-sm">
              <span>Année</span>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="h-11 w-full rounded-md border border-input bg-background px-3" />
            </label>

            <label className="space-y-2 text-sm">
              <span>Places</span>
              <input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} className="h-11 w-full rounded-md border border-input bg-background px-3" />
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span>Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelection}
                className="block h-11 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
              />
              {isUploadingImage ? (
                <span className="text-xs text-muted-foreground">Téléversement vers Vercel Blob…</span>
              ) : form.image ? (
                <span className="text-xs text-muted-foreground">Image prête à être enregistrée.</span>
              ) : null}
            </label>

            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Mettre en avant sur la page d’accueil
            </label>

            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setForm(emptyVehicle)} className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium">
                Réinitialiser
              </button>
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
                {form.id ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-xl font-semibold">Parc actuel</h2>

          {isLoading ? (
            <div className="text-sm text-muted-foreground">Chargement du parc...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucun véhicule enregistré.</div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <article key={vehicle.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{vehicle.name}</h3>
                      <p className="text-sm text-muted-foreground">{vehicle.brand} · {vehicle.category}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {vehicle.offer}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p>Prix : {vehicle.price} {vehicle.priceUnit}</p>
                    <p>{vehicle.transmission} · {vehicle.fuel} · {vehicle.seats} places</p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => handleEdit(vehicle)} className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm">
                      Modifier
                    </button>
                    <button type="button" onClick={() => handleDelete(vehicle.id)} className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-sm text-red-700">
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
