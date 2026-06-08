'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { updateContentBlock } from '@/app/actions/admin'

interface ContentBlock {
  id: string
  key: string
  value: string
  updated_at: string
}

interface Props {
  blocks: ContentBlock[]
}

function formatKey(key: string): string {
  const map: Record<string, string> = {
    hero_headline: 'Hero - Overskrift',
    hero_subheading: 'Hero - Underoverskrift',
    hero_tagline: 'Hero - Tagline',
    about_heading: 'Om oss - Overskrift',
    about_text: 'Om oss - Tekst',
    about_body: 'Om oss - Brødtekst',
    contact_heading: 'Kontakt - Overskrift',
    contact_subheading: 'Kontakt - Underoverskrift',
    footer_tagline: 'Bunntekst - Tagline',
  }
  if (map[key]) return map[key]
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' - ')
}

function isLongKey(key: string): boolean {
  return ['text', 'body', 'about_text'].some((k) => key === k || key.endsWith('_' + k))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RichTextBlock({ block }: { block: ContentBlock }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const editor = useEditor({
    extensions: [StarterKit],
    content: block.value,
  })

  async function handleSave() {
    if (!editor) return
    setStatus('saving')
    setErrorMsg('')
    try {
      const html = editor.getHTML()
      const result = await updateContentBlock(block.key, html)
      if (result?.error) {
        setStatus('error')
        setErrorMsg(result.error)
      } else {
        setStatus('success')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setStatus('error')
      setErrorMsg('Noe gikk galt')
    }
  }

  return (
    <div className="mb-8 bg-white rounded-lg border border-gray-200 p-5">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {formatKey(block.key)}
      </label>
      <div className="border border-gray-300 rounded-md overflow-hidden mb-3">
        <div className="flex gap-1 bg-gray-50 border-b border-gray-300 px-2 py-1.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-xs rounded font-bold ${editor?.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-xs rounded italic ${editor?.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-xs rounded ${editor?.isActive('bulletList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          >
            &#8226; Liste
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 text-xs rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          >
            H2
          </button>
        </div>
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-[120px] p-3 focus:outline-none"
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Sist oppdatert: {formatDate(block.updated_at)}
        </p>
        <div className="flex items-center gap-3">
          {status === 'success' && (
            <span className="text-sm text-green-600">Lagret!</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-600">{errorMsg || 'Feil ved lagring'}</span>
          )}
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {status === 'saving' ? 'Lagrer...' : 'Lagre'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ShortTextBlock({ block }: { block: ContentBlock }) {
  const [value, setValue] = useState(block.value)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSave() {
    setStatus('saving')
    setErrorMsg('')
    try {
      const result = await updateContentBlock(block.key, value)
      if (result?.error) {
        setStatus('error')
        setErrorMsg(result.error)
      } else {
        setStatus('success')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setStatus('error')
      setErrorMsg('Noe gikk galt')
    }
  }

  return (
    <div className="mb-8 bg-white rounded-lg border border-gray-200 p-5">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {formatKey(block.key)}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Sist oppdatert: {formatDate(block.updated_at)}
        </p>
        <div className="flex items-center gap-3">
          {status === 'success' && (
            <span className="text-sm text-green-600">Lagret!</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-600">{errorMsg || 'Feil ved lagring'}</span>
          )}
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {status === 'saving' ? 'Lagrer...' : 'Lagre'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContentManager({ blocks }: Props) {
  return (
    <div>
      {blocks.map((block) =>
        isLongKey(block.key) ? (
          <RichTextBlock key={block.id} block={block} />
        ) : (
          <ShortTextBlock key={block.id} block={block} />
        )
      )}
      {blocks.length === 0 && (
        <p className="text-gray-500 text-sm">Ingen innholdsblokker funnet.</p>
      )}
    </div>
  )
}
