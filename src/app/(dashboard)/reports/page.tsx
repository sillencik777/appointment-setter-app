'use client'
import { useEffect, useState } from 'react'
import { apiFetch, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Download, FileText, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import type { TeamKPIs, FunnelData } from '@/types'

interface ReportData {
  teamKPIs: TeamKPIs
  funnel: FunnelData[]
  alerts: any[]
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const now = new Date()

  useEffect(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    apiFetch<ReportData>('/api/kpis', {
      params: { dateFrom: start.toISOString() }
    }).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  const generatePDF = async () => {
    if (!data) return
    setGenerating(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()
      const { teamKPIs, funnel } = data
      const monthName = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

      // Header
      doc.setFillColor(79, 70, 229)
      doc.rect(0, 0, 210, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Closer Metrics CRM', 14, 15)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Reporte Mensual · ${monthName}`, 14, 25)

      doc.setTextColor(0, 0, 0)
      let y = 50

      // Summary section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('RESUMEN GENERAL', 14, y)
      y += 8

      const summaryData = [
        ['Leads Nuevos', teamKPIs.totalLeads.toString()],
        ['Leads Contactados', teamKPIs.totalContacted.toString()],
        ['Reuniones Agendadas', teamKPIs.totalMeetings.toString()],
        ['Reuniones Realizadas', teamKPIs.totalShows.toString()],
        ['Ventas Cerradas', teamKPIs.totalSales.toString()],
        ['Revenue Total', formatCurrency(teamKPIs.totalRevenue)],
      ]

      autoTable(doc, {
        startY: y,
        head: [['Métrica', 'Valor']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 10 },
      })

      y = (doc as any).lastAutoTable.finalY + 15

      // KPIs section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('KPIs DEL EQUIPO', 14, y)
      y += 8

      const kpiData = [
        ['Contact Rate', `${teamKPIs.contactRate}%`, teamKPIs.contactRate >= 30 ? '✓' : '✗'],
        ['Response Rate', `${teamKPIs.responseRate}%`, teamKPIs.responseRate >= 40 ? '✓' : '✗'],
        ['Appointment Rate', `${teamKPIs.appointmentRate}%`, teamKPIs.appointmentRate >= 10 ? '✓' : '✗'],
        ['Show Rate', `${teamKPIs.showRate}%`, teamKPIs.showRate >= 50 ? '✓' : '✗'],
        ['Close Rate', `${teamKPIs.closeRate}%`, teamKPIs.closeRate >= 20 ? '✓' : '✗'],
      ]

      autoTable(doc, {
        startY: y,
        head: [['KPI', 'Valor', 'Objetivo']],
        body: kpiData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 10 },
      })

      y = (doc as any).lastAutoTable.finalY + 15

      // Setter performance
      if (teamKPIs.setterKPIs.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('RENDIMIENTO POR SETTER', 14, y)
        y += 8

        const setterData = teamKPIs.setterKPIs.map((s) => [
          s.userName,
          s.leadsReceived.toString(),
          `${s.contactRate}%`,
          `${s.appointmentRate}%`,
          `${s.showRate}%`,
          s.salesClosed.toString(),
          formatCurrency(s.totalRevenue),
        ])

        autoTable(doc, {
          startY: y,
          head: [['Setter', 'Leads', 'Contact%', 'Appt%', 'Show%', 'Ventas', 'Revenue']],
          body: setterData,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9 },
        })

        y = (doc as any).lastAutoTable.finalY + 15
      }

      // Alerts
      if (data.alerts.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('ALERTAS', 14, y)
        y += 8

        autoTable(doc, {
          startY: y,
          head: [['Tipo', 'Alerta']],
          body: data.alerts.map((a) => [a.type.toUpperCase(), a.message]),
          theme: 'striped',
          headStyles: { fillColor: [220, 38, 38] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9 },
        })
      }

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Generado el ${formatDate(new Date())} · Closer Metrics CRM · Página ${i}/${pageCount}`, 14, 290)
      }

      doc.save(`reporte-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.pdf`)
    } catch (err) {
      console.error('Error generating PDF:', err)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500">
            {now.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/api/exports?format=csv', '_blank')}>
            <Download size={14} />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open('/api/exports?format=xlsx', '_blank')}>
            <Download size={14} />
            Excel
          </Button>
          <Button size="sm" onClick={generatePDF} loading={generating}>
            <FileText size={14} />
            PDF
          </Button>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Leads Nuevos', value: data.teamKPIs.totalLeads, icon: <Users size={16} />, color: 'text-indigo-600 bg-indigo-50' },
              { label: 'Contactados', value: data.teamKPIs.totalContacted, icon: <TrendingUp size={16} />, color: 'text-blue-600 bg-blue-50' },
              { label: 'Reuniones', value: data.teamKPIs.totalMeetings, icon: <Calendar size={16} />, color: 'text-yellow-600 bg-yellow-50' },
              { label: 'Shows', value: data.teamKPIs.totalShows, icon: <Calendar size={16} />, color: 'text-green-600 bg-green-50' },
              { label: 'Ventas', value: data.teamKPIs.totalSales, icon: <Target size={16} />, color: 'text-purple-600 bg-purple-50' },
              { label: 'Revenue', value: formatCurrency(data.teamKPIs.totalRevenue), icon: <DollarSign size={16} />, color: 'text-emerald-600 bg-emerald-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className={`inline-flex p-2 rounded-lg mb-2 ${stat.color}`}>{stat.icon}</div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {data.teamKPIs.setterKPIs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Setter</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Leads</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact%</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Appt%</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Show%</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ventas</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.teamKPIs.setterKPIs.map((s) => (
                      <tr key={s.userId} className="border-b border-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{s.userName}</td>
                        <td className="px-4 py-3 text-right">{s.leadsReceived}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span className={s.contactRate >= 30 ? 'text-green-600' : 'text-red-500'}>{s.contactRate}%</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span className={s.appointmentRate >= 10 ? 'text-green-600' : 'text-red-500'}>{s.appointmentRate}%</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span className={s.showRate >= 50 ? 'text-green-600' : 'text-orange-500'}>{s.showRate}%</span>
                        </td>
                        <td className="px-4 py-3 text-right">{s.salesClosed}</td>
                        <td className="px-6 py-3 text-right font-bold text-gray-900">{formatCurrency(s.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function Target({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  )
}
