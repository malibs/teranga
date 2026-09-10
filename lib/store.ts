import { mkdir, readFile, writeFile } from "fs/promises"
import { get, put } from "@vercel/blob"
import path from "path"

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

const USERS_FILE = path.join(process.cwd(), "data", "users.json")
const USERS_BLOB = "teranga/users.json"

const RESERVATIONS_FILE = path.join(process.cwd(), "data", "reservations.json")
const RESERVATIONS_BLOB = "teranga/reservations.json"

async function ensureFile(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true })
}

async function readJsonStore<T>(blobName: string, filePath: string, fallback: T): Promise<T> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await get(blobName, { access: "private", useCache: false })

      if (blob) {
        const content = await new Response(blob.stream).text()
        return JSON.parse(content || JSON.stringify(fallback)) as T
      }
    } catch (error) {
      console.warn(`Blob read skipped for ${blobName}:`, error)
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Le stockage Vercel Blob n'est pas configuré. Ajoutez BLOB_READ_WRITE_TOKEN dans Vercel.")
  }

  await ensureFile(filePath)

  try {
    const content = await readFile(filePath, "utf-8")
    return JSON.parse(content || JSON.stringify(fallback)) as T
  } catch {
    await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8")
    return fallback
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
    throw new Error("Le stockage Vercel Blob n'est pas configuré. Ajoutez BLOB_READ_WRITE_TOKEN dans Vercel.")
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
