import { mkdir, readFile, writeFile } from "fs/promises"
import { get, put } from "@vercel/blob"
import path from "path"
import { defaultVehicles, type Vehicle } from "@/lib/vehicles"

export type UserRecord = {
  id: string
  name: string
  email: string
  phone: string
  passwordHash: string
  createdAt: string
}

export type ReservationRecord = {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  vehicleId: string
  vehicleName: string
  startDate: string
  endDate: string
  notes: string
  status: "en_attente" | "confirmee" | "terminee"
  createdAt: string
}

export type ArchivedReservationRecord = ReservationRecord & {
  archivedAt: string
}

export type VehicleRecord = Vehicle

const USERS_FILE = path.join(process.cwd(), "data", "users.json")
const USERS_BLOB = "teranga/users.json"

const RESERVATIONS_FILE = path.join(process.cwd(), "data", "reservations.json")
const RESERVATIONS_BLOB = "teranga/reservations.json"

const ARCHIVED_RESERVATIONS_FILE = path.join(process.cwd(), "data", "archived-reservations.json")
const ARCHIVED_RESERVATIONS_BLOB = "teranga/archived-reservations.json"

const VEHICLES_FILE = path.join(process.cwd(), "data", "vehicles.json")
const VEHICLES_BLOB = "teranga/vehicles.json"

async function ensureFile(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true })
}

async function readJsonStore<T>(blobName: string, filePath: string, fallback: T): Promise<T> {
  const safeFallback = () => fallback

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await get(blobName, { access: "private", useCache: false })

      if (blob) {
        const content = await new Response(blob.stream).text()
        if (!content || content.trim() === "") {
          return safeFallback()
        }

        try {
          return JSON.parse(content) as T
        } catch (parseError) {
          console.warn(`Invalid JSON received from blob ${blobName}. Falling back to default values.`, parseError)
          return safeFallback()
        }
      }
    } catch (error) {
      console.warn(`Blob read skipped for ${blobName}:`, error)

      if (process.env.NODE_ENV === "production") {
        throw new Error(`Impossible de lire le stockage Vercel Blob pour ${blobName}. Vérifiez BLOB_READ_WRITE_TOKEN et le store Blob.`)
      }
    }
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Le stockage Vercel Blob n'est pas configuré. Ajoutez BLOB_READ_WRITE_TOKEN dans Vercel.")
    }

    // A serverless deployment cannot write to its /var/task filesystem.
    return safeFallback()
  }

  await ensureFile(filePath)

  try {
    const content = await readFile(filePath, "utf-8")
    if (!content || content.trim() === "") {
      await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8")
      return safeFallback()
    }

    try {
      return JSON.parse(content) as T
    } catch (parseError) {
      console.warn(`Invalid JSON in local store for ${filePath}. Resetting file.`, parseError)
      await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8")
      return safeFallback()
    }
  } catch {
    await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8")
    return safeFallback()
  }
}

async function writeJsonStore<T>(blobName: string, filePath: string, value: T) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(blobName, JSON.stringify(value, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    })
    return
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(`BLOB_READ_WRITE_TOKEN missing for ${blobName}; skipping blob write and keeping local fallback.`)
    return
  }

  await ensureFile(filePath)
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf-8")
}

export async function readUsers(): Promise<UserRecord[]> {
  return readJsonStore<UserRecord[]>(USERS_BLOB, USERS_FILE, [])
}

export async function writeUsers(users: UserRecord[]) {
  await writeJsonStore(USERS_BLOB, USERS_FILE, users)
}

export async function readReservations(): Promise<ReservationRecord[]> {
  return readJsonStore<ReservationRecord[]>(RESERVATIONS_BLOB, RESERVATIONS_FILE, [])
}

export async function writeReservations(reservations: ReservationRecord[]) {
  await writeJsonStore(RESERVATIONS_BLOB, RESERVATIONS_FILE, reservations)
}

export async function readArchivedReservations(): Promise<ArchivedReservationRecord[]> {
  return readJsonStore<ArchivedReservationRecord[]>(ARCHIVED_RESERVATIONS_BLOB, ARCHIVED_RESERVATIONS_FILE, [])
}

export async function writeArchivedReservations(reservations: ArchivedReservationRecord[]) {
  await writeJsonStore(ARCHIVED_RESERVATIONS_BLOB, ARCHIVED_RESERVATIONS_FILE, reservations)
}

export async function readVehicles(): Promise<VehicleRecord[]> {
  return readJsonStore<VehicleRecord[]>(VEHICLES_BLOB, VEHICLES_FILE, defaultVehicles)
}

export async function writeVehicles(vehicles: VehicleRecord[]) {
  await writeJsonStore(VEHICLES_BLOB, VEHICLES_FILE, vehicles)
}
