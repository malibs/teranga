import { randomUUID } from "node:crypto"
import { getSessionUserFromRequest } from "@/lib/auth-utils"
import { readReservations, writeReservations } from "@/lib/store"

async function sendWhatsAppReservationNotification(reservation: {
  name: string
  phone: string
  vehicleName: string
  startDate: string
  endDate: string
  notes: string
}) {
  const token = process.env.WHATSAPP_TOKEN
  const to = process.env.WHATSAPP_TO_NUMBER
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !to || !phoneNumberId) {
    console.info("WhatsApp reservation notification skipped: missing WHATSAPP_TOKEN / WHATSAPP_TO_NUMBER / WHATSAPP_PHONE_NUMBER_ID")
    return
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: [
        "Nouvelle réservation Teranga",
        `Client: ${reservation.name}`,
        `Téléphone: ${reservation.phone}`,
        `Véhicule: ${reservation.vehicleName}`,
        `Dates: ${reservation.startDate} → ${reservation.endDate}`,
        `Notes: ${reservation.notes || "Aucune"}`,
      ].join("\n"),
    },
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    console.error("WhatsApp reservation notification failed:", await response.text())
  }
}

async function sendReservationEmailNotification(reservation: {
  name: string
  email: string
  phone: string
  vehicleName: string
  startDate: string
  endDate: string
  notes: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.EMAIL_TO

  if (!apiKey || !to) {
    console.info("Reservation email notification skipped: missing RESEND_API_KEY or EMAIL_TO")
    return
  }

  const payload = {
    from: process.env.EMAIL_FROM || "Teranga <onboarding@resend.dev>",
    to: [to],
    subject: `Nouvelle réservation - ${reservation.vehicleName}`,
    html: `
      <h2>Nouvelle réservation reçue</h2>
      <p><strong>Client :</strong> ${reservation.name}</p>
      <p><strong>Email :</strong> ${reservation.email}</p>
      <p><strong>Téléphone :</strong> ${reservation.phone}</p>
      <p><strong>Véhicule :</strong> ${reservation.vehicleName}</p>
      <p><strong>Dates :</strong> ${reservation.startDate} → ${reservation.endDate}</p>
      <p><strong>Notes :</strong> ${reservation.notes || "Aucune"}</p>
    `,
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    console.error("Reservation email notification failed:", await response.text())
  }
}

export async function GET(request: Request) {
  const user = getSessionUserFromRequest(request)

  if (!user) {
    return Response.json({ success: false, message: "Accès non autorisé." }, { status: 401 })
  }

  const reservations = (await readReservations()).filter((entry) => entry.userId === user.id)
  return Response.json({ success: true, reservations })
}

export async function POST(request: Request) {
  const user = getSessionUserFromRequest(request)

  if (!user) {
    return Response.json({ success: false, message: "Vous devez être connecté pour réserver." }, { status: 401 })
  }

  try {
    const body = (await request.json()) as Record<string, unknown>
    const vehicleId = String(body.vehicleId ?? "")
    const vehicleName = String(body.vehicleName ?? "")
    const startDate = String(body.startDate ?? "")
    const endDate = String(body.endDate ?? "")
    const notes = String(body.notes ?? "")

    if (!vehicleId || !vehicleName || !startDate || !endDate) {
      return Response.json({ success: false, message: "Véhicule, date de début et date de fin sont requis." }, { status: 400 })
    }

    const now = new Date().toISOString()
    const reservation = {
      id: randomUUID(),
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      vehicleId,
      vehicleName,
      startDate,
      endDate,
      notes,
      status: "en_attente",
      createdAt: now,
    } as const

    const reservations = await readReservations()
    await writeReservations([reservation, ...reservations])

    await Promise.allSettled([
      sendWhatsAppReservationNotification({
        name: reservation.name,
        phone: reservation.phone,
        vehicleName: reservation.vehicleName,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        notes: reservation.notes,
      }),
      sendReservationEmailNotification({
        name: reservation.name,
        email: reservation.email,
        phone: reservation.phone,
        vehicleName: reservation.vehicleName,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        notes: reservation.notes,
      }),
    ])

    return Response.json({ success: true, reservation }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur est survenue."
    return Response.json({ success: false, message }, { status: 500 })
  }
}
