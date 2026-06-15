'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/utils'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { SetterRanking } from '@/components/dashboard/setter-ranking'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { useAuth } from '@/components/providers/auth-provider'
import { RefreshCw, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TeamKPIs, FunnelData, Alert } from '@/types'

interface KPIResponse {
  teamKPIs: TeamKPIs
  funnel: FunnelData[]
  alerts: Alert[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<KPIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  const loadData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      let dateFrom = ''
      if (period === 'week') {
        const start = new Date(now)
        start.setDate(now.getDate() - 7)
        dateFrom = start.toISOString()
      } else if (period === 'month') {
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      } else if (period === 'quarter') {
        const q = Math.floor(now.getMonth() / 3)
        dateFrom = new Date(now.getFullYear(), q * 3, 1).toISOString()
      }

      const params: Record<string, string> = {}
      if (dateFrom) params.dateFrom = dateFrom

      const res = await apiFetch<KPIResponse>('/api/kpis', { params })
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [period])

  const handleExport = (format: 'csv' | 'xlsx') => {
    const token = localStorage.getItem('token')
    window.open(`/api/exports?format=${format}`, '_blank')
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Hola, {user?.firstName} · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {[
              { key: 'week', label: '7D' },
              { key: 'month', label: '30D' },
              { key: 'quarter', label: '90D' },
              { key: 'all', label: 'Todo' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  period === p.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
            <Download size={14} />
            Exportar
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Calculando métricas...</p>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Alerts */}
          {data.alerts.length > 0 && <AlertsPanel alerts={data.alerts} />}

          {/* KPI Cards */}
          <KPICards kpis={data.teamKPIs} />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelChart data={data.funnel} />
            <div className="space-y-4">
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Response Rate', value: `${data.teamKPIs.responseRate}%`, ok: data.teamKPIs.responseRate >= 40 },
                  { label: 'Appointment Rate', value: `${data.teamKPIs.appointmentRate}%`, ok: data.teamKPIs.appointmentRate >= 10 },
                  { label: 'Show Rate', value: `${data.teamKPIs.showRate}%`, ok: data.teamKPIs.showRate >= 50 },
                  { label: 'Close Rate', value: `${data.teamKPIs.closeRate}%`, ok: data.teamKPIs.closeRate >= 20 },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.ok ? 'text-green-600' : 'text-red-500'}`}>
                      {stat.value}
                    </p>
                    <div className="mt-2 kpi-progress">
                      <div
                        className={`kpi-progress-bar ${stat.ok ? 'bg-green-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(parseFloat(stat.value), 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Setter ranking */}
          {data.teamKPIs.setterKPIs.length > 0 && (
            <SetterRanking setters={data.teamKPIs.setterKPIs} />
          )}
        </div>
      ) : null}
    </div>
  )
}
