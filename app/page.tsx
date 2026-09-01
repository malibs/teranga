import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { VehicleShowcase } from "@/components/vehicle-showcase"
import { Services } from "@/components/services"
import { ContactSection } from "@/components/contact-section"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <VehicleShowcase />
        <Services />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}
