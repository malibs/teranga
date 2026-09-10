import { readReservations, writeReservations } from "@/lib/store"

type ReservationStatus = "en_attente" | "confirmee" | "terminee"

function isAuthorizedAdmin(request: Request) {
  const tokenFromHeader = request.headers.get("x-admin-secret")
  const expectedToken = process.env.ADMIN_SECRET

  return !expectedToken || tokenFromHeader === expectedToken
}

function normalizeStatus(value: unknown): ReservationStatus {
  const status = String(value ?? "").trim()

  if (status === "confirmee" || status === "terminee") {
    return status
  }

  return "en_attente"
}

async function sendStatusWhatsAppNotification(reservation: {
  name: string
  phone: string
  vehicleName: string
  status: ReservationStatus
}) {
  const token = process.env.WHATSAPP_TOKEN
  const to = process.env.WHATSAPP_TO_NUMBER
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !to || !phoneNumberId) {
    return
  }

  const statusText = {
    en_attente: "en attente de validation",
    confirmee: "confirmée",
    terminee: "terminée",
  }[reservation.status]

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: [
          `Bonjour ${reservation.name},`,
          `Votre réservation pour ${reservation.vehicleName} est ${statusText}.`,
          "Merci de contacter Teranga Automobile pour la suite.",
        ].join("\n"),
      },
    }),
  })

  if (!response.ok) {
    console.error("Admin status WhatsApp notification failed:", await response.text())
  }
}

async function sendStatusEmailNotification(reservation: {
  name: string
  email: string
  vehicleName: string
  status: ReservationStatus
}) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.EMAIL_TO

  if (!apiKey || !to) {
    return
  }

  const statusText = {
    en_attente: "en attente de validation",
    confirmee: "confirmée",
    terminee: "terminée",
  }[reservation.status]

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Teranga <onboarding@resend.dev>",
      to: [to],
      subject: `Mise à jour réservation - ${reservation.vehicleName}`,
      html: `
        <h2>Réservation ${statusText}</h2>
        <p>Bonjour ${reservation.name},</p>
        <p>Votre réservation pour <strong>${reservation.vehicleName}</strong> est maintenant <strong>${statusText}</strong>.</p>
      `,
    }),
  })

  if (!response.ok) {
    console.error("Admin status email notification failed:", await response.text())
  }
}

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return Response.json({ success: false, message: "Accès non autorisé." }, { status: 401 })
  }

  const reservations = (await readReservations()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const summary = {
    total: reservations.length,
    en_attente: reservations.filter((item) => item.status === "en_attente").length,
    confirmee: reservations.filter((item) => item.status === "confirmee").length,
    terminee: reservations.filter((item) => item.status === "terminee").length,
  }

  return Response.json({ success: true, reservations, summary }, { status: 200 })
}

export async function PATCH(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return Response.json({ success: false, message: "Accès non autorisé." }, { status: 401 })
  }

  try {
    const body = (await request.json()) as Record<string, unknown>
    const id = String(body.id ?? "").trim()
    const status = normalizeStatus(body.status)

    if (!id) {
      return Response.json({ success: false, message: "Identifiant de réservation requis." }, { status: 400 })
    }

    const reservations = await readReservations()
    const index = reservations.findIndex((entry) => entry.id === id)

    if (index === -1) {
      return Response.json({ success: false, message: "Réservation introuvable." }, { status: 404 })
    }

    reservations[index] = { ...reservations[index], status }
    await writeReservations(reservations)

    const updated = reservations[index]

    await Promise.allSettled([
      sendStatusWhatsAppNotification({
        name: updated.name,
        phone: updated.phone,
        vehicleName: updated.vehicleName,
        status: updated.status,
      }),
      sendStatusEmailNotification({
        name: updated.name,
        email: updated.email,
        vehicleName: updated.vehicleName,
        status: updated.status,
      }),
    ])

    return Response.json({ success: true, reservation: updated }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur est survenue."
    return Response.json({ success: false, message }, { status: 500 })
  }
}
