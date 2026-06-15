'use client'
import { useEffect, useState } from 'react'
import { apiFetch, formatCurrency, formatMinutes } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { TeamKPIs, FunnelData } from '@/types'

interface KPIResponse {
  teamKPIs: TeamKPIs
  funnel: FunnelData[]
  alerts: any[]
}

export default function KPIsPage() {
  const [data, setData] = useState<KPIResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<KPIResponse>('/api/kpis')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const { teamKPIs, funnel } = data

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">KPIs Detallados</h1>

      {/* Team overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Contact Rate', value: `${teamKPIs.contactRate}%`, target: 30, higher: true },
          { label: 'Response Rate', value: `${teamKPIs.responseRate}%`, target: 40, higher: true },
          { label: 'Appointment Rate', value: `${teamKPIs.appointmentRate}%`, target: 10, higher: true },
          { label: 'Show Rate', value: `${teamKPIs.showRate}%`, target: 50, higher: true },
          { label: 'Close Rate', value: `${teamKPIs.closeRate}%`, target: 20, higher: true },
          { label: 'Total Leads', value: teamKPIs.totalLeads, target: null, higher: true },
          { label: 'Total Reuniones', value: teamKPIs.totalMeetings, target: null, higher: true },
          { label: 'Revenue Total', value: formatCurrency(teamKPIs.totalRevenue), target: null, higher: true },
        ].map((stat) => {
          const numVal = parseFloat(String(stat.value))
          const ok = stat.target !== null ? (stat.higher ? numVal >= stat.target : numVal <= stat.target) : true
          return (
            <Card key={stat.label} className="p-4">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.target ? (ok ? 'text-green-600' : 'text-red-500') : 'text-gray-900'}`}>
                {stat.value}
              </p>
              {stat.target && (
                <p className="text-xs text-gray-400 mt-1">Objetivo: {stat.target}{typeof stat.value === 'string' && stat.value.includes('%') ? '%' : ''}</p>
              )}
            </Card>
          )
        })}
      </div>

      {/* Per-setter breakdown */}
      {teamKPIs.setterKPIs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>KPIs por Setter</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {teamKPIs.setterKPIs.map((setter, i) => (
                <div key={setter.userId} className="border-b border-gray-50 last:border-0">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-700">
                          {setter.userName.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{setter.userName}</p>
                          <p className="text-xs text-gray-500">{setter.leadsReceived} leads recibidos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(setter.totalRevenue)}</p>
                        <p className="text-xs text-gray-500">{setter.salesClosed} ventas</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {[
                        { label: 'Contact', value: `${setter.contactRate}%`, ok: setter.contactRate >= 30 },
                        { label: 'Response', value: `${setter.responseRate}%`, ok: setter.responseRate >= 40 },
                        { label: 'Appt', value: `${setter.appointmentRate}%`, ok: setter.appointmentRate >= 10 },
                        { label: 'Show', value: `${setter.showRate}%`, ok: setter.showRate >= 50 },
                        { label: 'Close', value: `${setter.closeRate}%`, ok: setter.closeRate >= 20 },
                        { label: 'Resp. Time', value: formatMinutes(setter.avgFirstResponseTime), ok: setter.avgFirstResponseTime < 1440 },
                      ].map((kpi) => (
                        <div key={kpi.label} className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">{kpi.label}</p>
                          <p className={`text-sm font-bold ${kpi.ok ? 'text-green-600' : 'text-red-500'}`}>{kpi.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funnel detail */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle del Embudo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Etapa</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Cantidad</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Conv. Anterior</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Conv. Total</th>
              </tr>
            </thead>
            <tbody>
              {funnel.map((f, i) => (
                <tr key={f.stage} className="border-b border-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{f.label}</td>
                  <td className="px-4 py-3 text-right text-gray-700 font-semibold">{f.count}</td>
                  <td className="px-4 py-3 text-right">
                    {i > 0 && <span className={`font-semibold ${f.conversionFromPrev >= 50 ? 'text-green-600' : f.conversionFromPrev >= 25 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {f.conversionFromPrev}%
                    </span>}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-gray-600">{f.conversionFromTop}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
