"use client"

import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

const infos = [
  { icon: Phone, label: "Téléphone", value: "+221 77 245 70 32" },
  { icon: Mail, label: "Email", value: "malibs007@gmail.com" },
  { icon: MapPin, label: "Adresse", value: "Cambéréne, Dakar, Sénégal" },
  { icon: Clock, label: "Horaires", value: "Lun–Dim · 8h – 24h" },
]

const defaultForm = {
  name: "",
  phone: "",
  subject: "Louer un véhicule",
  message: "",
}

export function ContactSection() {
  const [form, setForm] = useState(defaultForm)
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const whatsappLink = `https://wa.me/221772457032?text=${encodeURIComponent(
    `Bonjour Teranga Automobile, je souhaite ${form.subject}.\nNom: ${form.name || ""}\nTéléphone: ${form.phone || ""}\nMessage: ${form.message || ""}`,
  )}`

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: "idle", message: "" })

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const payload = (await response.json()) as { success?: boolean; message?: string }

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Une erreur est survenue.")
      }

      setStatus({ type: "success", message: payload.message || "Votre demande a bien été enregistrée." })
      setForm(defaultForm)
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Une erreur est survenue.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 rounded-2xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Contact
          </p>
          <h2 className="mt-2 text-balance font-display text-3xl font-700 tracking-tight sm:text-4xl">
            Parlons de votre projet auto
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Réservez une voiture, demandez un devis ou passez nous voir à Dakar.
            Notre équipe vous répond avec plaisir et dans la teranga.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {infos.map((info) => (
              <div key={info.label} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <info.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {info.label}
                  </p>
                  <p className="mt-0.5 font-medium">{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1fb75a]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href="mailto:malibs007@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Votre nom"
                value={form.name}
                onChange={handleChange}
                className="h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium">
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+221 ..."
                value={form.phone}
                onChange={handleChange}
                className="h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="subject" className="text-sm font-medium">
              Je souhaite
            </label>
            <select
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option>Louer un véhicule</option>
              <option>Acheter un véhicule</option>
              <option>Un entretien / une révision</option>
              <option>Autre demande</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Dites-nous en plus sur votre besoin..."
              value={form.message}
              onChange={handleChange}
              className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          {status.message ? (
            <div
              className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {status.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : null}
              <span>{status.message}</span>
            </div>
          ) : null}

          <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
          </Button>
        </form>
      </div>
    </section>
  )
}
