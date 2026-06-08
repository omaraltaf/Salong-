'use client'

import { useState } from 'react'
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/app/actions/admin'

export interface Testimonial {
  id: string
  author_name: string
  content: string
  rating: number
  is_published: boolean
  sort_order: number
  created_at: string
}

interface Props {
  testimonials: Testimonial[]
}

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
        >
          &#9733;
        </button>
      ))}
    </div>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function TestimonialsManager({ testimonials: initial }: Props) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initial)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    author_name: '',
    content: '',
    rating: 5,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.author_name.trim() || !form.content.trim()) {
      setFormError('Fyll ut alle felt')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const result = await createTestimonial(form)
      if (result?.error) {
        setFormError(result.error)
      } else if (result?.data) {
        setTestimonials((prev) => [...prev, result.data as Testimonial])
        setShowModal(false)
        setForm({ author_name: '', content: '', rating: 5 })
      }
    } catch {
      setFormError('Noe gikk galt')
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublished(t: Testimonial) {
    const updated = { ...t, is_published: !t.is_published }
    setTestimonials((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
    await updateTestimonial(t.id, { is_published: !t.is_published })
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return
    const reordered = [...testimonials]
    const [item] = reordered.splice(index, 1)
    reordered.splice(index - 1, 0, item)
    setTestimonials(reordered)
    await updateTestimonial(item.id, { sort_order: index - 1 })
    await updateTestimonial(reordered[index].id, { sort_order: index })
  }

  async function handleMoveDown(index: number) {
    if (index === testimonials.length - 1) return
    const reordered = [...testimonials]
    const [item] = reordered.splice(index, 1)
    reordered.splice(index + 1, 0, item)
    setTestimonials(reordered)
    await updateTestimonial(item.id, { sort_order: index + 1 })
    await updateTestimonial(reordered[index].id, { sort_order: index })
  }

  async function handleDelete(id: string) {
    await deleteTestimonial(id)
    setTestimonials((prev) => prev.filter((t) => t.id !== id))
    setDeleteId(null)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700"
        >
          + Legg til omtale
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Forfatter</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Vurdering</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Tekst</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Rekkefølge</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t, index) => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{t.author_name}</td>
                <td className="px-4 py-3">
                  <StarDisplay rating={t.rating} />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {t.content.slice(0, 60)}{t.content.length > 60 ? '...' : ''}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.is_published ? 'Publisert' : 'Skjult'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="px-1.5 py-0.5 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30"
                    >
                      &#8593;
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === testimonials.length - 1}
                      className="px-1.5 py-0.5 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30"
                    >
                      &#8595;
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePublished(t)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {t.is_published ? 'Skjul' : 'Publiser'}
                    </button>
                    <button
                      onClick={() => setDeleteId(t.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Slett
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Ingen omtaler ennå.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Legg til omtale</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
                <input
                  type="text"
                  value={form.author_name}
                  onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Kundens navn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tekst</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Hva sa kunden?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vurdering</label>
                <StarPicker
                  value={form.rating}
                  onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormError('')
                    setForm({ author_name: '', content: '', rating: 5 })
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving ? 'Lagrer...' : 'Lagre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-2">Slett omtale</h2>
            <p className="text-sm text-gray-600 mb-6">
              Er du sikker på at du vil slette denne omtalen? Dette kan ikke angres.
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
