import { randomUUID } from "node:crypto"
import { readUsers, writeUsers } from "@/lib/store"
import { createSessionToken, hashPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const phone = String(body.phone ?? "").trim()
    const password = String(body.password ?? "")

    if (!name || !email || !phone || !password) {
      return Response.json({ success: false, message: "Tous les champs sont obligatoires." }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ success: false, message: "Adresse e-mail invalide." }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ success: false, message: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 })
    }

    const users = await readUsers()
    if (users.some((user) => user.email === email)) {
      return Response.json({ success: false, message: "Un compte existe déjà pour cette adresse e-mail." }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = {
      id: randomUUID(),
      name,
      email,
      phone,
      passwordHash,
      createdAt: new Date().toISOString(),
    }

    await writeUsers([user, ...users])

    const token = createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    })

    const response = Response.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
      { status: 201 },
    )

    response.headers.set(
      "Set-Cookie",
      `teranga_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    )

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur est survenue."
    return Response.json({ success: false, message }, { status: 500 })
  }
}
