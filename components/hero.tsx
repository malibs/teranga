import { MapPin, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="accueil" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/cars/hero-suv.png"
          alt="SUV de luxe sur une route côtière à Dakar au coucher du soleil"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/20" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 py-24 sm:px-6 md:py-32 lg:py-40">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-background/25 bg-background/10 px-4 py-1.5 text-sm font-medium text-background backdrop-blur">
            <MapPin className="h-4 w-4 text-accent" />
            Dakar · Sénégal
          </span>

          <h1 className="mt-6 text-balance font-display text-4xl font-800 leading-[1.05] tracking-tight text-background sm:text-5xl lg:text-6xl">
            Louez ou achetez votre voiture avec la{" "}
            <span className="text-accent">teranga</span> sénégalaise
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-background/80">
            Des véhicules fiables et entretenus, une équipe locale à votre
            écoute, et des prix transparents. Que vous soyez de passage à Dakar
            ou installé au Sénégal, TERANGA AUTOMOBILE vous accompagne.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              render={<a href="#vehicules" />}
              nativeButton={false}
              size="lg"
              className="text-base"
            >
              Voir les véhicules
            </Button>
            <Button
              render={<a href="#contact" />}
              nativeButton={false}
              size="lg"
              variant="outline"
              className="border-background/40 bg-background/10 text-base text-background hover:bg-background/20 hover:text-background"
            >
              Demander un devis
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-background/85">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-accent text-accent" />
              <span className="text-sm font-medium">4,9/5 · 300+ clients</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">
                Véhicules assurés & révisés
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
