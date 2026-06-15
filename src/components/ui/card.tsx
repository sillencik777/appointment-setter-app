import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-100', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  color?: string
  subtitle?: string
}

export function StatCard({ title, value, change, changeType, icon, color = 'indigo', subtitle }: StatCardProps) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide leading-tight mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900 leading-none break-all">{value}</p>
          {subtitle && <p className="mt-1 text-[11px] text-gray-500 leading-tight">{subtitle}</p>}
          {change && (
            <p className={cn('mt-1.5 text-[11px] font-medium', {
              'text-green-600': changeType === 'up',
              'text-red-600': changeType === 'down',
              'text-gray-500': changeType === 'neutral',
            })}>
              {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('p-2 rounded-lg flex-shrink-0', colors[color] || colors.indigo)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
