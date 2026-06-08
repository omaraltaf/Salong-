'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createService,
  updateService,
  deleteService,
  type ServiceCategory,
} from '@/app/actions/admin'
import type { ServiceRow } from '@/types/database'

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'dame', label: 'Dame' },
  { value: 'herre', label: 'Herre' },
  { value: 'barn', label: 'Barn' },
  { value: 'behandling', label: 'Behandling' },
]

function categoryLabel(cat: ServiceCategory): string {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat
}

// ─── Form state type ──────────────────────────────────────────────────────────

interface ServiceFormState {
  name: string
  description: string
  duration_minutes: number
  price_from: number
  price_to: number
  category: ServiceCategory
  icon: string
  is_active: boolean
}

const EMPTY_FORM: ServiceFormState = {
  name: '',
  description: '',
  duration_minutes: 60,
  price_from: 0,
  price_to: 0,
  category: 'dame',
  icon: '✂️',
  is_active: true,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ServiceModalProps {
  initial?: ServiceFormState
  title: string
  onClose: () => void
  onSave: (data: ServiceFormState) => Promise<void>
  loading: boolean
  error: string | null
}

function ServiceModal({ initial, title, onClose, onSave, loading, error }: ServiceModalProps) {
  const [form, setForm] = useState<ServiceFormState>(initial ?? EMPTY_FORM)

  function setField<K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Lukk"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Navn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              placeholder="F.eks. Dameklipp"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Beskrivelse
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              placeholder="Kort beskrivelse av tjenesten…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40 resize-none"
            />
          </div>

          {/* Duration + Icon */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Varighet (min) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={5}
                max={480}
                step={5}
                value={form.duration_minutes}
                onChange={(e) => setField('duration_minutes', Number(e.target.value))}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ikon
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setField('icon', e.target.value)}
                placeholder="✂️"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
              />
            </div>
          </div>

          {/* Price range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pris fra (kr)
              </label>
              <input
                type="number"
                min={0}
                value={form.price_from}
                onChange={(e) => setField('price_from', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pris til (kr)
              </label>
              <input
                type="number"
                min={0}
                value={form.price_to}
                onChange={(e) => setField('price_to', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value as ServiceCategory)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() => setField('is_active', !form.is_active)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40',
                form.is_active ? 'bg-[#C4A882]' : 'bg-gray-200',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                  form.is_active ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
            <span className="text-sm text-gray-700">Aktiv</span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-[#C4A882] hover:bg-[#b39372] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Lagre
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  services: ServiceRow[]
}

export default function ServicesManager({ services }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // ── Modal state ──
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // ── Delete state ──
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Toggle loading ──
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // ── Feedback ──
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showFeedback(type: 'success' | 'error', msg: string) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 4000)
  }

  function refresh() {
    startTransition(() => router.refresh())
  }

  // ── Handlers ──
  async function handleCreate(data: ServiceFormState) {
    setModalLoading(true)
    setModalError(null)
    const result = await createService(data)
    setModalLoading(false)
    if (result.error) {
      setModalError(result.error)
    } else {
      setShowCreate(false)
      showFeedback('success', 'Tjeneste opprettet!')
      refresh()
    }
  }

  async function handleEdit(id: string, data: ServiceFormState) {
    setModalLoading(true)
    setModalError(null)
    const result = await updateService(id, data)
    setModalLoading(false)
    if (result.error) {
      setModalError(result.error)
    } else {
      setEditingId(null)
      showFeedback('success', 'Tjeneste oppdatert!')
      refresh()
    }
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true)
    const result = await deleteService(id)
    setDeleteLoading(false)
    setConfirmDeleteId(null)
    if (result.error) {
      showFeedback('error', result.error)
    } else {
      showFeedback('success', 'Tjeneste slettet.')
      refresh()
    }
  }

  async function handleToggleActive(service: ServiceRow) {
    setTogglingId(service.id)
    await updateService(service.id, { is_active: !service.is_active })
    setTogglingId(null)
    refresh()
  }

  const editingService = editingId ? services.find((s) => s.id === editingId) : null

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback && (
        <div
          className={cn(
            'px-4 py-3 rounded-lg text-sm font-medium',
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200',
          )}
        >
          {feedback.msg}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{services.length} tjeneste(r) totalt</p>
        <button
          onClick={() => {
            setModalError(null)
            setShowCreate(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#C4A882] hover:bg-[#b39372] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Legg til tjeneste
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Navn
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Kategori
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Varighet
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Pris fra
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Pris til
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm italic">
                    Ingen tjenester ennå.
                  </td>
                </tr>
              )}
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <span className="mr-2">{service.icon ?? '✂️'}</span>
                    {service.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {categoryLabel(service.category)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {service.duration_minutes} min
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {service.price_from != null ? `${service.price_from} kr` : '–'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {service.price_to != null ? `${service.price_to} kr` : '–'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(service)}
                      disabled={togglingId === service.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50',
                        service.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                      )}
                      title="Klikk for å endre status"
                    >
                      {togglingId === service.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            service.is_active ? 'bg-green-500' : 'bg-gray-400',
                          )}
                        />
                      )}
                      {service.is_active ? 'Aktiv' : 'Inaktiv'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setModalError(null)
                          setEditingId(service.id)
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Rediger"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(service.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Slett"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <ServiceModal
          title="Legg til tjeneste"
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
          loading={modalLoading}
          error={modalError}
        />
      )}

      {/* Edit modal */}
      {editingService && (
        <ServiceModal
          title="Rediger tjeneste"
          initial={{
            name: editingService.name,
            description: editingService.description ?? '',
            duration_minutes: editingService.duration_minutes,
            price_from: editingService.price_from ?? 0,
            price_to: editingService.price_to ?? 0,
            category: editingService.category,
            icon: editingService.icon ?? '✂️',
            is_active: editingService.is_active,
          }}
          onClose={() => setEditingId(null)}
          onSave={(data) => handleEdit(editingId!, data)}
          loading={modalLoading}
          error={modalError}
        />
      )}

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Slett tjeneste?</h3>
            <p className="text-sm text-gray-600">
              Denne handlingen kan ikke angres. Er du sikker?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deleteLoading}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteLoading && <Loader2 size={14} className="animate-spin" />}
                Slett
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
