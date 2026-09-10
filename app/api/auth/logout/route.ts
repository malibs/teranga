export async function POST() {
  const response = Response.json({ success: true, message: "Déconnecté." })
  response.headers.set(
    "Set-Cookie",
    "teranga_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  )

  return response
}
