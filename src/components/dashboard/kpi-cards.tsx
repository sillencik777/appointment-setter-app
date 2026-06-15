'use client'
import { Users, Phone, Calendar, CheckCircle, TrendingUp, DollarSign, Target, Clock } from 'lucide-react'
import { StatCard } from '@/components/ui/card'
import { formatCurrency, formatMinutes } from '@/lib/utils'
import type { TeamKPIs } from '@/types'

interface KPICardsProps {
  kpis: TeamKPIs
}

export function KPICards({ kpis }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        title="Total Leads"
        value={kpis.totalLeads}
        icon={<Users size={18} />}
        color="indigo"
        subtitle="en el período"
      />
      <StatCard
        title="Contactados"
        value={kpis.totalContacted}
        icon={<Phone size={18} />}
        color="blue"
        subtitle={`${kpis.contactRate}% contact rate`}
      />
      <StatCard
        title="Reuniones"
        value={kpis.totalMeetings}
        icon={<Calendar size={18} />}
        color="yellow"
        subtitle={`${kpis.appointmentRate}% de leads`}
      />
      <StatCard
        title="Shows"
        value={kpis.totalShows}
        icon={<CheckCircle size={18} />}
        color="green"
        subtitle={`${kpis.showRate}% show rate`}
      />
      <StatCard
        title="Ventas Cerradas"
        value={kpis.totalSales}
        icon={<Target size={18} />}
        color="purple"
        subtitle={`${kpis.closeRate}% close rate`}
      />
      <StatCard
        title="Revenue Total"
        value={formatCurrency(kpis.totalRevenue)}
        icon={<DollarSign size={18} />}
        color="green"
        subtitle="acumulado"
      />
      <StatCard
        title="Contact Rate"
        value={`${kpis.contactRate}%`}
        icon={<TrendingUp size={18} />}
        color="cyan"
        subtitle={kpis.contactRate >= 30 ? 'Objetivo cumplido' : 'Bajo objetivo (30%)'}
        change={kpis.contactRate >= 30 ? 'Objetivo: 30%' : 'Objetivo: 30%'}
        changeType={kpis.contactRate >= 30 ? 'up' : 'down'}
      />
      <StatCard
        title="Show Rate"
        value={`${kpis.showRate}%`}
        icon={<Clock size={18} />}
        color={kpis.showRate >= 50 ? 'green' : 'red'}
        subtitle={kpis.showRate >= 50 ? 'Objetivo cumplido' : 'Bajo objetivo (50%)'}
        change="Objetivo: 50%"
        changeType={kpis.showRate >= 50 ? 'up' : 'down'}
      />
    </div>
  )
}
