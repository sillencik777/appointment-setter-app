'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { StatusUpdater } from '@/components/leads/status-updater'
import { PIPELINE_STAGES, STATUS_LABELS } from '@/types'
import type { Lead, LeadStatus } from '@/types'
import { formatDate } from '@/lib/utils'

type Pipeline = Partial<Record<LeadStatus, Lead[]>>

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<Pipeline>({})
  const [loading, setLoading] = useState(true)
  const [statusLead, setStatusLead] = useState<Lead | null>(null)

  const loadPipeline = async () => {
    setLoading(true)
    try {
      const data = await apiFetch<Pipeline>('/api/pipeline')
      setPipeline(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPipeline() }, [])

  const handleStatusSuccess = (lead: Lead) => {
    setStatusLead(null)
    loadPipeline()
  }

  const totalLeads = PIPELINE_STAGES.reduce((sum, s) => sum + (pipeline[s.status]?.length || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Pipeline de Ventas</h1>
        <p className="text-sm text-gray-500">{totalLeads} leads en el pipeline</p>
      </div>

      {/* Kanban-style horizontal scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3" style={{ minWidth: `${PIPELINE_STAGES.length * 240}px` }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = pipeline[stage.status] || []
            return (
              <div key={stage.status} className="flex-shrink-0 w-56">
                {/* Column header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{stage.icon}</span>
                    <span className="text-xs font-semibold text-gray-700">{stage.label}</span>
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all"
                      onClick={() => setStatusLead(lead)}
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {lead.firstName} {lead.lastName}
                      </p>
                      {lead.company && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{lead.company}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {lead.setter && (
                          <span className="text-xs text-gray-400">{lead.setter.firstName}</span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">{formatDate(lead.createdAt)}</span>
                      </div>
                      {lead.dealValue && (
                        <p className="text-xs font-semibold text-green-600 mt-1">
                          ${lead.dealValue.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-6 text-center">
                      <p className="text-xs text-gray-300">Sin leads</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={!!statusLead} onClose={() => setStatusLead(null)} title="Mover Lead" size="sm">
        {statusLead && (
          <StatusUpdater lead={statusLead} onSuccess={handleStatusSuccess} onCancel={() => setStatusLead(null)} />
        )}
      </Modal>
    </div>
  )
}
