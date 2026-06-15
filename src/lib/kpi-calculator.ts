import type { SetterKPIs, TeamKPIs, FunnelData, Alert } from '@/types'

interface LeadData {
  id: string
  status: string
  setterId: string | null
  setter: { id: string; firstName: string; lastName: string } | null
  activities: {
    fromStatus: string | null
    toStatus: string
    timeFromPrev: number | null
    createdAt: Date
  }[]
  appointments: { attended: boolean | null }[]
  sales: { amount: number; closerId: string }[]
  createdAt: Date
  lastContactAt: Date | null
}

function safePct(num: number, den: number): number {
  if (!den) return 0
  return Math.round((num / den) * 1000) / 10
}

export function calculateSetterKPIs(
  leads: LeadData[],
  userId: string,
  userName: string
): SetterKPIs {
  const myLeads = leads.filter((l) => l.setterId === userId)

  const statusSets = (statuses: string[]) =>
    myLeads.filter((l) => statuses.includes(l.status)).length

  const leadsReceived = myLeads.length
  const leadsContacted = statusSets([
    'FIRST_CONTACT','RESPONDED','QUALIFIED','INTERESTED',
    'MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED',
    'NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const responded = statusSets([
    'RESPONDED','QUALIFIED','INTERESTED',
    'MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED',
    'NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const qualified = statusSets([
    'QUALIFIED','INTERESTED','MEETING_PROPOSED',
    'MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const interested = statusSets([
    'INTERESTED','MEETING_PROPOSED','MEETING_SCHEDULED',
    'ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const meetingsProposed = statusSets([
    'MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED',
    'NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const meetingsScheduled = statusSets([
    'MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const attended = statusSets(['ATTENDED','SALE_CLOSED','SALE_LOST'])
  const noShow = statusSets(['NO_SHOW'])
  const salesClosed = statusSets(['SALE_CLOSED'])

  // Avg first response time (minutes)
  const firstResponseTimes = myLeads
    .map((l) => {
      const firstContact = l.activities.find((a) => a.toStatus === 'FIRST_CONTACT')
      if (!firstContact) return null
      return firstContact.timeFromPrev
    })
    .filter((t): t is number => t !== null)

  const avgFirstResponseTime = firstResponseTimes.length
    ? Math.round(firstResponseTimes.reduce((a, b) => a + b, 0) / firstResponseTimes.length)
    : 0

  // Avg time to appointment (minutes from creation to scheduled)
  const apptTimes = myLeads
    .filter((l) =>
      ['MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST'].includes(l.status)
    )
    .map((l) => {
      const apptActivity = l.activities.find((a) => a.toStatus === 'MEETING_SCHEDULED')
      if (!apptActivity) return null
      return (new Date(apptActivity.createdAt).getTime() - new Date(l.createdAt).getTime()) / 60000
    })
    .filter((t): t is number => t !== null)

  const avgTimeToAppointment = apptTimes.length
    ? Math.round(apptTimes.reduce((a, b) => a + b, 0) / apptTimes.length)
    : 0

  const totalRevenue = myLeads
    .flatMap((l) => l.sales)
    .reduce((sum, s) => sum + s.amount, 0)

  return {
    userId,
    userName,
    leadsReceived,
    leadsContacted,
    responded,
    qualified,
    interested,
    meetingsProposed,
    meetingsScheduled,
    attended,
    noShow,
    salesClosed,
    contactRate: safePct(leadsContacted, leadsReceived),
    responseRate: safePct(responded, leadsContacted),
    qualificationRate: safePct(qualified, responded),
    appointmentRate: safePct(meetingsScheduled, leadsReceived),
    showRate: safePct(attended, meetingsScheduled),
    closeRate: safePct(salesClosed, attended),
    avgFirstResponseTime,
    avgTimeToAppointment,
    totalRevenue,
  }
}

export function calculateTeamKPIs(leads: LeadData[], users: { id: string; firstName: string; lastName: string }[]): TeamKPIs {
  const statusCount = (statuses: string[]) =>
    leads.filter((l) => statuses.includes(l.status)).length

  const totalLeads = leads.length
  const totalContacted = statusCount([
    'FIRST_CONTACT','RESPONDED','QUALIFIED','INTERESTED',
    'MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED',
    'NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const totalResponded = statusCount([
    'RESPONDED','QUALIFIED','INTERESTED',
    'MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED',
    'NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const totalQualified = statusCount([
    'QUALIFIED','INTERESTED','MEETING_PROPOSED',
    'MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const totalMeetings = statusCount([
    'MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST',
  ])
  const totalShows = statusCount(['ATTENDED','SALE_CLOSED','SALE_LOST'])
  const totalSales = statusCount(['SALE_CLOSED'])
  const totalRevenue = leads.flatMap((l) => l.sales).reduce((sum, s) => sum + s.amount, 0)

  const setterKPIs = users.map((u) =>
    calculateSetterKPIs(leads, u.id, `${u.firstName} ${u.lastName}`)
  )

  return {
    totalLeads,
    totalContacted,
    totalResponded,
    totalQualified,
    totalMeetings,
    totalShows,
    totalSales,
    totalRevenue,
    contactRate: safePct(totalContacted, totalLeads),
    responseRate: safePct(totalResponded, totalContacted),
    appointmentRate: safePct(totalMeetings, totalLeads),
    showRate: safePct(totalShows, totalMeetings),
    closeRate: safePct(totalSales, totalShows),
    setterKPIs,
  }
}

export function calculateFunnel(leads: LeadData[]): FunnelData[] {
  const stages = [
    { stage: 'leads', label: 'Leads Totales', statuses: null },
    { stage: 'contacted', label: 'Contactados', statuses: ['FIRST_CONTACT','RESPONDED','QUALIFIED','INTERESTED','MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST'] },
    { stage: 'responded', label: 'Respondieron', statuses: ['RESPONDED','QUALIFIED','INTERESTED','MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST'] },
    { stage: 'qualified', label: 'Calificados', statuses: ['QUALIFIED','INTERESTED','MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST'] },
    { stage: 'interested', label: 'Interesados', statuses: ['INTERESTED','MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST'] },
    { stage: 'scheduled', label: 'Agendados', statuses: ['MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST'] },
    { stage: 'attended', label: 'Asistieron', statuses: ['ATTENDED','SALE_CLOSED','SALE_LOST'] },
    { stage: 'sold', label: 'Vendidos', statuses: ['SALE_CLOSED'] },
  ]

  const counts = stages.map((s) =>
    s.statuses === null ? leads.length : leads.filter((l) => s.statuses!.includes(l.status)).length
  )

  return stages.map((s, i) => ({
    stage: s.stage,
    label: s.label,
    count: counts[i],
    conversionFromPrev: i === 0 ? 100 : safePct(counts[i], counts[i - 1]),
    conversionFromTop: safePct(counts[i], counts[0]),
  }))
}

export function detectAlerts(leads: LeadData[], setterKPIs: SetterKPIs[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()

  // Leads without follow-up for 48h
  leads.forEach((lead) => {
    if (['SALE_CLOSED', 'SALE_LOST', 'NO_SHOW'].includes(lead.status)) return
    const lastActivity = lead.lastContactAt ? new Date(lead.lastContactAt) : new Date(lead.createdAt)
    const hoursWithout = (now.getTime() - lastActivity.getTime()) / 3600000
    if (hoursWithout > 48) {
      alerts.push({
        type: 'danger',
        message: `Lead sin seguimiento por más de 48 horas`,
        leadId: lead.id,
        userId: lead.setterId || undefined,
      })
    }
  })

  // KPI alerts
  setterKPIs.forEach((kpi) => {
    if (kpi.leadsReceived < 5) return
    if (kpi.contactRate < 30) {
      alerts.push({ type: 'warning', message: `${kpi.userName}: Contact rate bajo (${kpi.contactRate}%)`, userId: kpi.userId })
    }
    if (kpi.showRate < 50 && kpi.meetingsScheduled > 2) {
      alerts.push({ type: 'warning', message: `${kpi.userName}: Show rate bajo (${kpi.showRate}%)`, userId: kpi.userId })
    }
    if (kpi.appointmentRate < 10 && kpi.leadsReceived > 10) {
      alerts.push({ type: 'warning', message: `${kpi.userName}: Appointment rate bajo (${kpi.appointmentRate}%)`, userId: kpi.userId })
    }
  })

  return alerts
}
