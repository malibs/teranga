import crypto from "node:crypto"

export type SessionUser = {
  id: string
  name: string
  email: string
  phone: string
}

export function getAuthSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.ADMIN_SECRET || "teranga-local-secret"
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex")
  const iterations = 310000
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex")

  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`
}

export async function verifyPassword(password: string, encodedHash: string) {
  try {
    const [algorithm, iterations, salt, hash] = encodedHash.split("$")

    if (!algorithm || !iterations || !salt || !hash) {
      return false
    }

    const generatedHash = crypto
      .pbkdf2Sync(password, salt, Number(iterations), 32, "sha256")
      .toString("hex")

    const expected = Buffer.from(hash)
    const actual = Buffer.from(generatedHash)

    if (expected.length !== actual.length) {
      return false
    }

    return crypto.timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

export function createSessionToken(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(`${header}.${body}`)
    .digest("base64url")

  return `${header}.${body}.${signature}`
}

export function verifySessionToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")

    if (parts.length !== 3) {
      return null
    }

    const [header, body, signature] = parts
    const expected = crypto
      .createHmac("sha256", getAuthSecret())
      .update(`${header}.${body}`)
      .digest("base64url")

    const expectedBuffer = Buffer.from(expected)
    const signatureBuffer = Buffer.from(signature)

    if (expectedBuffer.length !== signatureBuffer.length) {
      return null
    }

    if (!crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      return null
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Record<string, unknown>
    return payload
  } catch {
    return null
  }
}

export function getSessionTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("teranga_session="))

  if (!cookie) {
    return null
  }

  const token = decodeURIComponent(cookie.replace("teranga_session=", ""))
  return token || null
}

export function getSessionUserFromRequest(request: Request): SessionUser | null {
  const token = getSessionTokenFromRequest(request)

  if (!token) {
    return null
  }

  const payload = verifySessionToken(token)
  if (!payload || typeof payload.userId !== "string") {
    return null
  }

  return {
    id: payload.userId,
    name: typeof payload.name === "string" ? payload.name : "",
    email: typeof payload.email === "string" ? payload.email : "",
    phone: typeof payload.phone === "string" ? payload.phone : "",
  }
}
