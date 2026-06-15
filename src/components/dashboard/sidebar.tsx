'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, GitBranch, BarChart3,
  FileText, Settings, LogOut, TrendingUp, Target, Bell,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN','MANAGER','SETTER','CLOSER'] },
  { href: '/dashboard/leads', label: 'Leads', icon: Users, roles: ['ADMIN','MANAGER','SETTER','CLOSER'] },
  { href: '/dashboard/pipeline', label: 'Pipeline', icon: GitBranch, roles: ['ADMIN','MANAGER','SETTER','CLOSER'] },
  { href: '/dashboard/kpis', label: 'KPIs', icon: BarChart3, roles: ['ADMIN','MANAGER','SETTER'] },
  { href: '/dashboard/reports', label: 'Reportes', icon: FileText, roles: ['ADMIN','MANAGER'] },
  { href: '/dashboard/team', label: 'Equipo', icon: Target, roles: ['ADMIN','MANAGER'] },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings, roles: ['ADMIN','MANAGER'] },
]

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const visibleItems = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  )

  return (
    <div className={cn('flex flex-col h-full bg-white border-r border-gray-200', mobile ? 'w-full' : 'w-64')}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Closer Metrics</p>
            <p className="text-xs text-gray-500">CRM</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-gray-50">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
