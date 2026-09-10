import { getSessionUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const user = getSessionUserFromRequest(request)

  if (!user) {
    return Response.json({ success: false, message: "Non authentifié." }, { status: 401 })
  }

  return Response.json({ success: true, user })
}
