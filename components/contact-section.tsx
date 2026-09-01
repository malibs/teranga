import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

const infos = [
  { icon: Phone, label: "Téléphone", value: "+221 77 245 70 32" },
  { icon: Mail, label: "Email", value: "malibs007@gmail.com" },
  { icon: MapPin, label: "Adresse", value: "Cambéréne, Dakar, Sénégal" },
  { icon: Clock, label: "Horaires", value: "Lun–Sam · 8h – 20h" },
]

export function ContactSection() {
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
        </div>

        <form className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                placeholder="Votre nom"
                className="h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+221 ..."
                className="h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="subject" className="text-sm font-medium">
              Je souhaite
            </label>
            <select
              id="subject"
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
              rows={4}
              placeholder="Dites-nous en plus sur votre besoin..."
              className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <Button type="submit" size="lg" className="mt-2">
            Envoyer ma demande
          </Button>
        </form>
      </div>
    </section>
  )
}
