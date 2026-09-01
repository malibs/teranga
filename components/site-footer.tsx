import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center">
              <Image
                src="/teranga-logo.png"
                alt="TERANGA AUTOMOBILE"
                width={200}
                height={200}
                className="h-16 w-auto"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Location et vente de véhicules au Sénégal. La mobilité en toute
              confiance, avec la teranga.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="font-display text-sm font-700">Navigation</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#accueil" className="hover:text-foreground">Accueil</a></li>
                <li><a href="#vehicules" className="hover:text-foreground">Véhicules</a></li>
                <li><a href="#services" className="hover:text-foreground">Services</a></li>
                <li><a href="#contact" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="font-display text-sm font-700">Services</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Location de voitures</li>
                <li>Vente de véhicules</li>
                <li>Entretien</li>
                <li>Assistance 24/7</li>
              </ul>
            </div>
            <div>
              <p className="font-display text-sm font-700">Contact</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>+221 77 245 70 32</li>
                <li>malibs007@gmail.com</li>
                <li>Camberene, Dakar - Sénégal</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TERANGA AUTOMOBILE. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
