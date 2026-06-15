export type Role = 'ADMIN' | 'MANAGER' | 'SETTER' | 'CLOSER'

export type LeadStatus =
  | 'NEW'
  | 'FIRST_CONTACT'
  | 'RESPONDED'
  | 'QUALIFIED'
  | 'INTERESTED'
  | 'MEETING_PROPOSED'
  | 'MEETING_SCHEDULED'
  | 'ATTENDED'
  | 'NO_SHOW'
  | 'SALE_CLOSED'
  | 'SALE_LOST'

export type LeadSource =
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'LINKEDIN'
  | 'GOOGLE'
  | 'REFERRAL'
  | 'COLD_EMAIL'
  | 'COLD_CALL'
  | 'WEBINAR'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'OTHER'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  isActive: boolean
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
  email?: string
  country?: string
  source: LeadSource
  campaign?: string
  status: LeadStatus
  notes?: string
  dealValue?: number
  setterId?: string
  setter?: User
  closerId?: string
  closer?: User
  activities?: LeadActivity[]
  appointments?: Appointment[]
  lastContactAt?: string
  qualifiedAt?: string
  createdAt: string
  updatedAt: string
}

export interface LeadActivity {
  id: string
  leadId: string
  userId: string
  user?: User
  fromStatus?: LeadStatus
  toStatus: LeadStatus
  notes?: string
  timeFromPrev?: number
  createdAt: string
}

export interface Appointment {
  id: string
  leadId: string
  lead?: Lead
  closerId: string
  closer?: User
  scheduledAt: string
  duration: number
  attended?: boolean
  notes?: string
  meetingLink?: string
  createdAt: string
}

export interface Sale {
  id: string
  leadId: string
  lead?: Lead
  closerId: string
  closer?: User
  amount: number
  currency: string
  product?: string
  closedAt: string
  notes?: string
}

export interface Goal {
  id: string
  userId?: string
  period: 'weekly' | 'monthly'
  year: number
  week?: number
  month?: number
  leadsTarget: number
  contactsTarget: number
  meetingsTarget: number
  salesTarget: number
  revenueTarget: number
}

export interface SetterKPIs {
  userId: string
  userName: string
  leadsReceived: number
  leadsContacted: number
  responded: number
  qualified: number
  interested: number
  meetingsProposed: number
  meetingsScheduled: number
  attended: number
  noShow: number
  salesClosed: number
  contactRate: number
  responseRate: number
  qualificationRate: number
  appointmentRate: number
  showRate: number
  closeRate: number
  avgFirstResponseTime: number
  avgTimeToAppointment: number
  totalRevenue: number
}

export interface TeamKPIs {
  totalLeads: number
  totalContacted: number
  totalResponded: number
  totalQualified: number
  totalMeetings: number
  totalShows: number
  totalSales: number
  totalRevenue: number
  contactRate: number
  responseRate: number
  appointmentRate: number
  showRate: number
  closeRate: number
  setterKPIs: SetterKPIs[]
}

export interface FunnelData {
  stage: string
  label: string
  count: number
  conversionFromPrev: number
  conversionFromTop: number
}

export interface Alert {
  type: 'warning' | 'danger' | 'info'
  message: string
  userId?: string
  leadId?: string
}

export interface AuthToken {
  userId: string
  email: string
  role: Role
  firstName: string
  lastName: string
}

export type PipelineStage = {
  status: LeadStatus
  label: string
  color: string
  icon: string
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { status: 'NEW', label: 'Nuevo Lead', color: '#6366f1', icon: '🆕' },
  { status: 'FIRST_CONTACT', label: 'Primer Contacto', color: '#8b5cf6', icon: '📞' },
  { status: 'RESPONDED', label: 'Respondió', color: '#a855f7', icon: '💬' },
  { status: 'QUALIFIED', label: 'Calificado', color: '#3b82f6', icon: '✅' },
  { status: 'INTERESTED', label: 'Interesado', color: '#06b6d4', icon: '🔥' },
  { status: 'MEETING_PROPOSED', label: 'Reunión Propuesta', color: '#10b981', icon: '📅' },
  { status: 'MEETING_SCHEDULED', label: 'Reunión Agendada', color: '#f59e0b', icon: '🗓️' },
  { status: 'ATTENDED', label: 'Asistió', color: '#84cc16', icon: '🎯' },
  { status: 'NO_SHOW', label: 'No Show', color: '#ef4444', icon: '❌' },
  { status: 'SALE_CLOSED', label: 'Venta Cerrada', color: '#22c55e', icon: '💰' },
  { status: 'SALE_LOST', label: 'Venta Perdida', color: '#dc2626', icon: '💔' },
]

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Nuevo Lead',
  FIRST_CONTACT: 'Primer Contacto',
  RESPONDED: 'Respondió',
  QUALIFIED: 'Calificado',
  INTERESTED: 'Interesado',
  MEETING_PROPOSED: 'Reunión Propuesta',
  MEETING_SCHEDULED: 'Reunión Agendada',
  ATTENDED: 'Asistió',
  NO_SHOW: 'No Show',
  SALE_CLOSED: 'Venta Cerrada',
  SALE_LOST: 'Venta Perdida',
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  LINKEDIN: 'LinkedIn',
  GOOGLE: 'Google',
  REFERRAL: 'Referido',
  COLD_EMAIL: 'Email Frío',
  COLD_CALL: 'Llamada Fría',
  WEBINAR: 'Webinar',
  YOUTUBE: 'YouTube',
  TIKTOK: 'TikTok',
  OTHER: 'Otro',
}
