import { put } from "@vercel/blob"

function isAuthorizedAdmin(request: Request) {
  const tokenFromHeader = request.headers.get("x-admin-secret")
  const expectedToken = process.env.ADMIN_SECRET

  return !expectedToken || tokenFromHeader === expectedToken
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return Response.json({ success: false, message: "Accès non autorisé." }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const fileEntry = formData.get("file")

    if (!(fileEntry instanceof File)) {
      return Response.json({ success: false, message: "Aucune image fournie." }, { status: 400 })
    }

    if (!fileEntry.type.startsWith("image/")) {
      return Response.json({ success: false, message: "Le fichier doit être une image." }, { status: 400 })
    }

    const extension = fileEntry.name.includes(".") ? fileEntry.name.split(".").pop() : "png"
    const filename = `vehicles/${Date.now()}-${crypto.randomUUID()}.${extension}`

    const blob = await put(filename, fileEntry, {
      access: "private",
      addRandomSuffix: false,
      contentType: fileEntry.type,
      allowOverwrite: true,
    })

    return Response.json({ success: true, image: blob.pathname }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de l’upload de l’image."
    return Response.json({ success: false, message }, { status: 500 })
  }
}
