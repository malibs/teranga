import { randomUUID } from "node:crypto"
import { defaultVehicles, type Vehicle } from "@/lib/vehicles"
import { readVehicles, writeVehicles } from "@/lib/store"

function isAuthorizedAdmin(request: Request) {
  const tokenFromHeader = request.headers.get("x-admin-secret")
  const expectedToken = process.env.ADMIN_SECRET

  return !expectedToken || tokenFromHeader === expectedToken
}

export async function GET() {
  const vehicles = await readVehicles()
  return Response.json({ success: true, vehicles: vehicles.length ? vehicles : defaultVehicles }, { status: 200 })
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return Response.json({ success: false, message: "Accès non autorisé." }, { status: 401 })
  }

  try {
    const body = (await request.json()) as Partial<Vehicle> & Record<string, unknown>
    const vehicle: Vehicle = {
      id: String(body.id || randomUUID()),
      name: String(body.name || "").trim(),
      brand: String(body.brand || "").trim(),
      category: String(body.category || "").trim(),
      image: String(body.image || "/cars/default-car.png").trim(),
      transmission: String(body.transmission || "Automatique").trim(),
      seats: Number(body.seats || 5),
      fuel: String(body.fuel || "Essence").trim(),
      year: Number(body.year || new Date().getFullYear()),
      offer: (body.offer === "vente" ? "vente" : "location") as Vehicle["offer"],
      price: String(body.price || "").trim(),
      priceUnit: String(body.priceUnit || "FCFA").trim(),
      featured: Boolean(body.featured),
    }

    if (!vehicle.name || !vehicle.brand || !vehicle.category) {
      return Response.json({ success: false, message: "Nom, marque et catégorie sont requis." }, { status: 400 })
    }

    const vehicles = await readVehicles()
    const existingIndex = vehicles.findIndex((entry) => entry.id === vehicle.id)

    if (existingIndex >= 0) {
      vehicles[existingIndex] = vehicle
    } else {
      vehicles.unshift(vehicle)
    }

    await writeVehicles(vehicles)
    return Response.json({ success: true, vehicle }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur est survenue."
    return Response.json({ success: false, message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return Response.json({ success: false, message: "Accès non autorisé." }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { id?: string }
  const id = String(body.id || "").trim()

  if (!id) {
    return Response.json({ success: false, message: "Identifiant de véhicule requis." }, { status: 400 })
  }

  const vehicles = await readVehicles()
  const nextVehicles = vehicles.filter((vehicle) => vehicle.id !== id)
  await writeVehicles(nextVehicles)

  return Response.json({ success: true, vehicles: nextVehicles }, { status: 200 })
}
