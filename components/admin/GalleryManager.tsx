'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GalleryItem {
  id: string
  url: string
  alt_text?: string
  section?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

interface Props {
  items: GalleryItem[]
}

const SECTIONS = [
  { value: 'gallery', label: 'Galleri' },
  { value: 'hero', label: 'Hero' },
  { value: 'about', label: 'Om oss' },
]

export default function GalleryManager({ items: initial }: Props) {
  const [items, setItems] = useState<GalleryItem[]>(initial)
  const [urlInput, setUrlInput] = useState('')
  const [altInput, setAltInput] = useState('')
  const [sectionInput, setSectionInput] = useState('gallery')
  const [addError, setAddError] = useState('')
  const [adding, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const supabase = createClient()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!urlInput.trim()) {
      setAddError('URL er påkrevd')
      return
    }
    setSaving(true)
    setAddError('')
    try {
      const { data, error } = await supabase
        .from('gallery')
        .insert({
          url: urlInput.trim(),
          alt_text: altInput.trim() || null,
          section: sectionInput,
          sort_order: items.length,
          is_active: true,
        })
        .select()
        .single()
      if (error) {
        setAddError(error.message)
      } else if (data) {
        setItems((prev) => [...prev, data as GalleryItem])
        setUrlInput('')
        setAltInput('')
        setSectionInput('gallery')
      }
    } catch {
      setAddError('Noe gikk galt')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(item: GalleryItem) {
    const updated = { ...item, is_active: !item.is_active }
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
    await supabase
      .from('gallery')
      .update({ is_active: !item.is_active })
      .eq('id', item.id)
  }

  async function handleDelete(id: string) {
    await supabase.from('gallery').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      {/* Add by URL */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Legg til bilde (URL)</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="https://eksempel.com/bilde.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <input
              type="text"
              placeholder="Alt-tekst (valgfri)"
              value={altInput}
              onChange={(e) => setAltInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <select
              value={sectionInput}
              onChange={(e) => setSectionInput(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {SECTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap"
            >
              {adding ? 'Legger til...' : 'Legg til'}
            </button>
          </div>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
        </form>
      </div>

      {/* Gallery grid */}
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Ingen bilder ennå.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`relative rounded-lg overflow-hidden border-2 group ${
                item.is_active ? 'border-transparent' : 'border-gray-300 opacity-60'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.alt_text ?? 'Galleri'}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3EBilde ikke funnet%3C/text%3E%3C/svg%3E'
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleToggleActive(item)}
                  className="px-2 py-1 text-xs bg-white rounded-md hover:bg-gray-100"
                >
                  {item.is_active ? 'Skjul' : 'Vis'}
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Slett
                </button>
              </div>
              {item.section && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-xs bg-black/60 text-white rounded">
                  {item.section}
                </span>
              )}
              {!item.is_active && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-xs bg-gray-700 text-white rounded">
                  Skjult
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-2">Slett bilde</h2>
            <p className="text-sm text-gray-600 mb-6">
              Er du sikker på at du vil slette dette bildet? Dette kan ikke angres.
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
