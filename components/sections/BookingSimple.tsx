'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Service {
  id: string
  name: string
}

interface Timeslot {
  id: string
  date: string
  start_time: string
}

export default function BookingSimple({
  services,
  initialTimeslots,
}: {
  services: Service[]
  initialTimeslots: Timeslot[]
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <section id="booking" className="bg-background py-24">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-32 mb-6"></div>
            <div className="h-64 bg-secondary rounded"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="booking" className="bg-background py-24 md:py-32">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-12">
          <h2 className="font-heading text-4xl font-bold text-foreground mb-2">
            Book din time
          </h2>
          <p className="text-foreground/70">
            Velg din foretrukne tjeneste og tidspunkt nedenfor.
          </p>
        </div>

        <div className="bg-secondary rounded-2xl p-8 shadow-lg shadow-black/30">
          <div className="space-y-6">
            {/* Services */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Velg tjeneste
              </label>
              <div className="grid gap-2">
                {services.slice(0, 5).map((service) => (
                  <button
                    key={service.id}
                    className="p-3 text-left rounded-lg bg-background hover:bg-background/80 text-foreground transition"
                  >
                    {service.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-background/50 rounded-lg p-4 border border-foreground/10">
              <p className="text-sm text-foreground/70">
                ✓ {initialTimeslots.filter((t) => t.is_available).length} ledige tider available
              </p>
              <p className="text-sm text-foreground/70 mt-2">
                ✓ Rask online booking
              </p>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <a href="#contact" className="block w-full">
                <Button variant="primary" className="w-full">
                  Book time via kontaktskjema
                </Button>
              </a>
              <p className="text-xs text-foreground/50 mt-3 text-center">
                Eller ring oss direkte for raskeste respons
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
