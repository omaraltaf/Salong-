'use client'

import { useState } from 'react'
import { createPricingTier, deletePricingTier } from '@/app/actions/admin'

interface PricingTier {
  id: string
  service_id: string
  label: string
  price: number
  is_active: boolean
  sort_order: number
}

interface Service {
  id: string
  name: string
  category: string
  pricing: PricingTier[]
}

interface Props {
  services: Service[]
}

function ServiceSection({ service }: { service: Service }) {
  const [tiers, setTiers] = useState<PricingTier[]>(service.pricing ?? [])
  const [form, setForm] = useState({ label: '', price: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.label.trim() || !form.price.trim()) {
      setFormError('Fyll ut beskrivelse og pris')
      return
    }
    const priceNum = parseInt(form.price, 10)
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Pris må være et gyldig tall')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const result = await createPricingTier({
        service_id: service.id,
        label: form.label,
        price: priceNum,
      })
      if (result?.error) {
        setFormError(result.error)
      } else {
        // Optimistically add the tier; it will sync on next page reload
        setTiers((prev) => [
          ...prev,
          { id: crypto.randomUUID(), service_id: service.id, label: form.label, price: priceNum, is_active: true, sort_order: 0 },
        ])
        setForm({ label: '', price: '' })
      }
    } catch {
      setFormError('Noe gikk galt')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await deletePricingTier(id)
    setTiers((prev) => prev.filter((t) => t.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <h2 className="font-semibold text-gray-800">{service.name}</h2>
        <p className="text-xs text-gray-500 capitalize">{service.category}</p>
      </div>

      <div className="divide-y divide-gray-100">
        {tiers.map((tier) => (
          <div key={tier.id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm">{tier.label}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">{tier.price} kr</span>
              <button
                onClick={() => setDeleteId(tier.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Fjern
              </button>
            </div>
          </div>
        ))}
        {tiers.length === 0 && (
          <p className="px-5 py-3 text-sm text-gray-400">Ingen prisalternativer ennå.</p>
        )}
      </div>

      <div className="border-t border-gray-100 px-5 py-4">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Beskrivelse (f.eks. Kort hår)"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="number"
            placeholder="Pris (kr)"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            min={0}
            className="w-28 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? 'Lagrer...' : '+ Legg til'}
          </button>
        </form>
        {formError && <p className="mt-1 text-xs text-red-600">{formError}</p>}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-2">Fjern prisalternativ</h2>
            <p className="text-sm text-gray-600 mb-6">
              Er du sikker på at du vil slette dette prisalternativet?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Slett
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PricingManager({ services }: Props) {
  if (services.length === 0) {
    return <p className="text-gray-500 text-sm">Ingen aktive tjenester funnet.</p>
  }
  return (
    <div>
      {services.map((service) => (
        <ServiceSection key={service.id} service={service} />
      ))}
    </div>
  )
}
