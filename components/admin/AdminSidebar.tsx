'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Scissors,
  Tag,
  FileText,
  Clock3,
  Star,
  Image as ImageIcon,
  Share2,
  MessageSquare,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { salonConfig } from '@/config/salon.config'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Bestillinger', href: '/admin/bookings', icon: <Calendar size={18} /> },
  { label: 'Timeslots', href: '/admin/timeslots', icon: <Clock size={18} /> },
  { label: 'Tjenester', href: '/admin/services', icon: <Scissors size={18} /> },
  { label: 'Priser', href: '/admin/pricing', icon: <Tag size={18} /> },
  { label: 'Innhold', href: '/admin/content', icon: <FileText size={18} /> },
  { label: 'Åpningstider', href: '/admin/hours', icon: <Clock3 size={18} /> },
  { label: 'Omtaler', href: '/admin/testimonials', icon: <Star size={18} /> },
  { label: 'Galleri', href: '/admin/gallery', icon: <ImageIcon size={18} /> },
  { label: 'Sosiale medier', href: '/admin/social', icon: <Share2 size={18} /> },
  { label: 'Meldinger', href: '/admin/messages', icon: <MessageSquare size={18} /> },
]

interface AdminSidebarProps {
  userEmail: string
}

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const sidebarContent = (
    <div className="flex h-full w-60 flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <Scissors size={22} style={{ color: '#C4A882' }} />
        <span className="font-semibold text-gray-800 text-sm leading-tight">
          {salonConfig.name}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5',
                isActive
                  ? 'text-[#9a7c5f] bg-[#C4A882]/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <span className={cn(isActive ? 'text-[#C4A882]' : 'text-gray-400')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-4">
        <p className="text-xs text-gray-500 truncate mb-3">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={16} />
          Logg ut
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">{sidebarContent}</div>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle meny"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-out */}
      <div
        className={cn(
          'md:hidden fixed top-0 left-0 z-50 h-full transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>
    </>
  )
}
