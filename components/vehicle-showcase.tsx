"use client"

import { useState } from "react"
import { vehicles } from "@/lib/vehicles"
import { VehicleCard } from "@/components/vehicle-card"

const filters = [
  { label: "Tous", value: "tous" },
  { label: "Location", value: "location" },
  { label: "Vente", value: "vente" },
] as const

export function VehicleShowcase() {
  const [active, setActive] = useState<(typeof filters)[number]["value"]>("tous")

  const filtered = vehicles.filter((v) =>
    active === "tous" ? true : v.offer === active,
  )

  return (
    <section id="vehicules" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Notre parc automobile
          </p>
          <h2 className="mt-2 text-balance font-display text-3xl font-700 tracking-tight sm:text-4xl">
            Des véhicules pour chaque trajet
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            De la citadine économique au 4x4 tout-terrain, trouvez le véhicule
            idéal à louer ou à acheter au Sénégal.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActive(f.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                active === f.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  )
}
