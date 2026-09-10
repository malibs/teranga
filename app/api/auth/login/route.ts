import { readUsers } from "@/lib/store"
import { createSessionToken, verifyPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")

    if (!email || !password) {
      return Response.json({ success: false, message: "E-mail et mot de passe requis." }, { status: 400 })
    }

    const users = await readUsers()
    const user = users.find((entry) => entry.email === email)

    if (!user) {
      return Response.json({ success: false, message: "Identifiants invalides." }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return Response.json({ success: false, message: "Identifiants invalides." }, { status: 401 })
    }

    const token = createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    })

    const response = Response.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    })

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
