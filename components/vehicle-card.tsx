import { Fuel, Gauge, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Vehicle } from "@/lib/vehicles"

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const isRental = vehicle.offer === "location"

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={vehicle.image || "/placeholder.svg"}
          alt={`${vehicle.name} ${vehicle.year}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            isRental
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
          }`}
        >
          {isRental ? "Location" : "À vendre"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {vehicle.category} · {vehicle.year}
            </p>
            <h3 className="mt-1 font-display text-lg font-700 leading-tight">
              {vehicle.name}
            </h3>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-y border-border py-3 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <Gauge className="h-4 w-4 text-primary" />
            {vehicle.transmission}
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="h-4 w-4 text-primary" />
            {vehicle.seats} places
          </div>
          <div className="flex flex-col items-center gap-1">
            <Fuel className="h-4 w-4 text-primary" />
            {vehicle.fuel}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-display text-xl font-700 text-foreground">
              {vehicle.price}
            </p>
            <p className="text-xs text-muted-foreground">{vehicle.priceUnit}</p>
          </div>
          <Button
            render={<a href="#contact" />}
            nativeButton={false}
            size="sm"
            variant={isRental ? "default" : "secondary"}
          >
            {isRental ? "Réserver" : "Détails"}
          </Button>
        </div>
      </div>
    </article>
  )
}
