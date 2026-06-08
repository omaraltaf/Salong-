'use client'

import { useState } from 'react'
import {
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '@/app/actions/admin'

interface SocialLink {
  id: string
  platform: string
  url: string
  is_active: boolean
}

interface Props {
  links: SocialLink[]
}

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'Twitter / X',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
}

function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform
}

export default function SocialLinksManager({ links: initial }: Props) {
  const [links, setLinks] = useState<SocialLink[]>(initial)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ platform: '', url: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.platform.trim() || !form.url.trim()) {
      setFormError('Fyll ut plattform og URL')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const result = await createSocialLink(form)
      if (result?.error) {
        setFormError(result.error)
      } else {
        setLinks((prev) => [...prev, { id: crypto.randomUUID(), platform: form.platform, url: form.url, is_active: true }])
        setForm({ platform: '', url: '' })
      }
    } catch {
      setFormError('Noe gikk galt')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(link: SocialLink) {
    const updated = { ...link, is_active: !link.is_active }
    setLinks((prev) => prev.map((l) => (l.id === link.id ? updated : l)))
    await updateSocialLink(link.id, { is_active: !link.is_active })
  }

  async function handleDelete(id: string) {
    await deleteSocialLink(id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{platformLabel(link.platform)}</p>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline truncate block"
              >
                {link.url}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleActive(link)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  link.is_active ? 'bg-gray-900' : 'bg-gray-300'
                }`}
                title={link.is_active ? 'Aktiv — klikk for å deaktivere' : 'Inaktiv — klikk for å aktivere'}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    link.is_active ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="text-xs text-gray-500 w-14">
                {link.is_active ? 'Aktiv' : 'Inaktiv'}
              </span>
              <button
                onClick={() => setDeleteId(link.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Slett
              </button>
            </div>
          </div>
        ))}
        {links.length === 0 && (
          <p className="px-5 py-6 text-sm text-gray-400">Ingen lenker ennå.</p>
        )}
      </div>

      {/* Add form */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Legg til lenke</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Plattform (f.eks. instagram)"
            value={form.platform}
            onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="url"
            placeholder="https://instagram.com/..."
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? 'Legger til...' : 'Legg til'}
          </button>
        </form>
        {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-2">Slett lenke</h2>
            <p className="text-sm text-gray-600 mb-6">
              Er du sikker på at du vil slette denne lenken?
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
