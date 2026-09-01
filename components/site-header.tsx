"use client"

import { useState } from "react"
import Image from "next/image"
import { Menu, Phone, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Accueil", href: "#accueil" },
  { label: "Location", href: "#vehicules" },
  { label: "Vente", href: "#vehicules" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#accueil" className="flex items-center gap-2" aria-label="TERANGA AUTOMOBILE - Accueil">
          <Image
            src="/teranga-logo.png"
            alt="TERANGA AUTOMOBILE"
            width={160}
            height={160}
            priority
            className="h-12 w-auto"
          />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button render={<a href="#contact" />} nativeButton={false}>
            <Phone className="h-4 w-4" />
            Nous appeler
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Button
              render={<a href="#contact" onClick={() => setOpen(false)} />}
              nativeButton={false}
              className="mt-2"
            >
              <Phone className="h-4 w-4" />
              Nous appeler
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
