'use client'

import { useState } from 'react'
import { markMessageRead } from '@/app/actions/admin'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  is_read: boolean
  created_at: string
}

interface Props {
  messages: Message[]
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

export default function MessagesTable({ messages: initial }: Props) {
  const [messages, setMessages] = useState<Message[]>(initial)
  const [selected, setSelected] = useState<Message | null>(null)

  async function handleToggleRead(msg: Message) {
    const updated = { ...msg, is_read: !msg.is_read }
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)))
    if (selected?.id === msg.id) setSelected(updated)
    await markMessageRead(msg.id, !msg.is_read)
  }

  function openMessage(msg: Message) {
    setSelected(msg)
    if (!msg.is_read) {
      const updated = { ...msg, is_read: true }
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)))
      setSelected(updated)
      markMessageRead(msg.id, true)
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read).length

  return (
    <div>
      {unreadCount > 0 && (
        <p className="mb-3 text-sm text-gray-500">
          {unreadCount} ulest{unreadCount !== 1 ? 'e' : ''} melding{unreadCount !== 1 ? 'er' : ''}
        </p>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Navn</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">E-post</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Dato</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Melding</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !msg.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <td className={`px-4 py-3 ${!msg.is_read ? 'font-bold' : ''}`}>
                  {msg.name}
                </td>
                <td className={`px-4 py-3 ${!msg.is_read ? 'font-bold' : 'text-gray-600'}`}>
                  {msg.email}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {formatDate(msg.created_at)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {msg.message.slice(0, 80)}{msg.message.length > 80 ? '...' : ''}
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Ingen meldinger ennå.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Message modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null)
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{selected.name}</h2>
                <p className="text-sm text-gray-500">{selected.email}</p>
                {selected.phone && (
                  <p className="text-sm text-gray-500">{selected.phone}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formatDate(selected.created_at)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="bg-gray-50 rounded-md p-4 mb-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {selected.message}
            </div>

            <div className="flex gap-3">
              <a
                href={`mailto:${selected.email}?subject=Re: Melding fra ${selected.name}`}
                className="flex-1 text-center px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-700"
              >
                Svar
              </a>
              <button
                onClick={() => handleToggleRead(selected)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {selected.is_read ? 'Merk som ulest' : 'Merk som lest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
