import { CarFront, KeyRound, Wrench } from "lucide-react"

const services = [
  {
    icon: KeyRound,
    title: "Location courte & longue durée",
    description:
      "À la journée, à la semaine ou au mois. Avec ou sans chauffeur, à Dakar et dans tout le Sénégal.",
  },
  {
    icon: CarFront,
    title: "Vente de véhicules",
    description:
      "Voitures neuves et d'occasion vérifiées, avec papiers en règle et accompagnement pour le financement.",
  },
  {
    icon: Wrench,
    title: "Entretien & assistance",
    description:
      "Révision, dépannage et assistance routière pour rouler l'esprit tranquille partout au pays.",
  },
]

export function Services() {
  return (
    <section id="services" className="bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Nos services
          </p>
          <h2 className="mt-2 text-balance font-display text-3xl font-700 tracking-tight sm:text-4xl">
            Tout pour votre mobilité au Sénégal
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <service.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-700">
                {service.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 rounded-xl border border-border bg-card p-8 text-center md:grid-cols-4">
          {[
            { value: "300+", label: "Clients satisfaits" },
            { value: "60+", label: "Véhicules disponibles" },
            { value: "14", label: "Régions couvertes" },
            { value: "24/7", label: "Assistance routière" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-800 text-primary sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
