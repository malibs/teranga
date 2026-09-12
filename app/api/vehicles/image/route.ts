import { get } from "@vercel/blob"

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path")

  if (!path || !path.startsWith("vehicles/")) {
    return new Response("Image introuvable", { status: 404 })
  }

  try {
    const blob = await get(path, { access: "private", useCache: false })

    if (!blob) {
      return new Response("Image introuvable", { status: 404 })
    }

    return new Response(blob.stream, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": blob.blob.contentType || "application/octet-stream",
      },
    })
  } catch (error) {
    console.error("Vehicle image read failed:", error)
    return new Response("Image indisponible", { status: 404 })
  }
}
