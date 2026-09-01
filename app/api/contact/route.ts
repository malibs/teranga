import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

const REQUESTS_FILE = path.join(process.cwd(), "data", "contact-requests.json")

type ContactRequest = {
  name: string
  phone: string
  subject: string
  message: string
  source: string
  createdAt: string
}

async function ensureRequestsFile() {
  await mkdir(path.dirname(REQUESTS_FILE), { recursive: true })

  try {
    await readFile(REQUESTS_FILE, "utf-8")
  } catch {
    await writeFile(REQUESTS_FILE, "[]", "utf-8")
  }
}

async function readRequests(): Promise<ContactRequest[]> {
  await ensureRequestsFile()
  const content = await readFile(REQUESTS_FILE, "utf-8")
  return JSON.parse(content || "[]") as ContactRequest[]
}

function normalizeBody(raw: unknown): ContactRequest {
  const body = raw as Record<string, unknown>

  const name = String(body.name ?? "").trim()
  const phone = String(body.phone ?? "").trim()
  const subject = String(body.subject ?? "").trim()
  const message = String(body.message ?? "").trim()

  if (!name || !phone || !subject || !message) {
    throw new Error("Tous les champs sont obligatoires.")
  }

  return {
    name,
    phone,
    subject,
    message,
    source: "website",
    createdAt: new Date().toISOString(),
  }
}

async function saveRequest(request: ContactRequest) {
  const requests = await readRequests()
  requests.unshift(request)
  await writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2), "utf-8")
}

function isAuthorizedAdmin(request: Request) {
  const url = new URL(request.url)
  const tokenFromHeader = request.headers.get("x-admin-secret")
  const tokenFromQuery = url.searchParams.get("token")
  const expectedToken = process.env.ADMIN_SECRET

  return !expectedToken || tokenFromHeader === expectedToken || tokenFromQuery === expectedToken
}

async function sendWhatsAppNotification(request: ContactRequest) {
  const token = process.env.WHATSAPP_TOKEN
  const to = process.env.WHATSAPP_TO_NUMBER
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !to || !phoneNumberId) {
    console.info("WhatsApp notification skipped: missing WHATSAPP_TOKEN / WHATSAPP_TO_NUMBER / WHATSAPP_PHONE_NUMBER_ID")
    return
  }

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: [
        "Nouvelle demande Teranga",
        `Nom: ${request.name}`,
        `Téléphone: ${request.phone}`,
        `Demande: ${request.subject}`,
        `Message: ${request.message}`,
        `Date: ${new Date(request.createdAt).toLocaleString("fr-FR")}`,
      ].join("\n"),
    },
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("WhatsApp notification failed:", errorText)
  }
}

async function sendEmailNotification(request: ContactRequest) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.EMAIL_TO

  if (!apiKey || !to) {
    console.info("Email notification skipped: missing RESEND_API_KEY or EMAIL_TO")
    return
  }

  const payload = {
    from: process.env.EMAIL_FROM || "Teranga <onboarding@resend.dev>",
    to: [to],
    subject: `Nouvelle demande - ${request.subject}`,
    html: `
      <h2>Nouvelle demande reçue</h2>
      <p><strong>Nom :</strong> ${request.name}</p>
      <p><strong>Téléphone :</strong> ${request.phone}</p>
      <p><strong>Demande :</strong> ${request.subject}</p>
      <p><strong>Message :</strong> ${request.message}</p>
      <p><strong>Date :</strong> ${new Date(request.createdAt).toLocaleString("fr-FR")}</p>
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
    const errorText = await response.text()
    console.error("Email notification failed:", errorText)
  }
}

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return Response.json({ success: false, message: "Accès non autorisé." }, { status: 401 })
  }

  const requests = await readRequests()
  return Response.json({ success: true, requests }, { status: 200 })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const normalized = normalizeBody(body)

    await saveRequest(normalized)
    await Promise.allSettled([sendWhatsAppNotification(normalized), sendEmailNotification(normalized)])

    return Response.json(
      {
        success: true,
        message: "Votre demande a bien été enregistrée et transmise.",
      },
      { status: 201 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur est survenue."

    return Response.json(
      {
        success: false,
        message,
      },
      { status: 400 },
    )
  }
}
