import * as React from 'react'
import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/types'

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: 'bg-gray-100 text-gray-700',
  FIRST_CONTACT: 'bg-purple-100 text-purple-700',
  RESPONDED: 'bg-blue-100 text-blue-700',
  QUALIFIED: 'bg-cyan-100 text-cyan-700',
  INTERESTED: 'bg-teal-100 text-teal-700',
  MEETING_PROPOSED: 'bg-indigo-100 text-indigo-700',
  MEETING_SCHEDULED: 'bg-yellow-100 text-yellow-700',
  ATTENDED: 'bg-lime-100 text-lime-700',
  NO_SHOW: 'bg-red-100 text-red-700',
  SALE_CLOSED: 'bg-green-100 text-green-700',
  SALE_LOST: 'bg-rose-100 text-rose-700',
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Nuevo',
  FIRST_CONTACT: 'Contactado',
  RESPONDED: 'Respondió',
  QUALIFIED: 'Calificado',
  INTERESTED: 'Interesado',
  MEETING_PROPOSED: 'Reunión Propuesta',
  MEETING_SCHEDULED: 'Agendado',
  ATTENDED: 'Asistió',
  NO_SHOW: 'No Show',
  SALE_CLOSED: 'Venta Cerrada',
  SALE_LOST: 'Venta Perdida',
}

interface StatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  )
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)} {...props}>
      {children}
    </span>
  )
}
