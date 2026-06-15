'use client'
import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/badge'
import { LeadForm } from '@/components/leads/lead-form'
import { StatusUpdater } from '@/components/leads/status-updater'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Filter, Download, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Lead, User } from '@/types'
import { SOURCE_LABELS, PIPELINE_STAGES } from '@/types'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<User[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [statusLead, setStatusLead] = useState<Lead | null>(null)

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    setterId: '',
    closerId: '',
  })

  const loadTeam = async () => {
    try {
      const users = await apiFetch<User[]>('/api/team')
      setTeam(users)
    } catch {}
  }

  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: page.toString(), limit: '20' }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.source) params.source = filters.source
      if (filters.setterId) params.setterId = filters.setterId
      if (filters.closerId) params.closerId = filters.closerId

      const res = await apiFetch<{ leads: Lead[]; total: number; pages: number }>('/api/leads', { params })
      setLeads(res.leads)
      setTotal(res.total)
      setPages(res.pages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { loadTeam() }, [])
  useEffect(() => { loadLeads() }, [loadLeads])

  const setters = team.filter((u) => u.role === 'SETTER')
  const closers = team.filter((u) => u.role === 'CLOSER' || u.role === 'MANAGER')

  const handleLeadSuccess = (lead: Lead) => {
    setShowCreate(false)
    setEditLead(null)
    loadLeads()
  }

  const handleStatusSuccess = (lead: Lead) => {
    setStatusLead(null)
    setLeads((prev) => prev.map((l) => l.id === lead.id ? lead : l))
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">{total} leads en total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/api/exports?format=xlsx', '_blank')}>
            <Download size={14} />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            placeholder="Buscar por nombre, email, empresa..."
            value={filters.search}
            onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1) }}
          />
        </div>
        <select
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1) }}
        >
          <option value="">Todos los estados</option>
          {PIPELINE_STAGES.map((s) => <option key={s.status} value={s.status}>{s.label}</option>)}
        </select>
        <select
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          value={filters.setterId}
          onChange={(e) => { setFilters((f) => ({ ...f, setterId: e.target.value })); setPage(1) }}
        >
          <option value="">Todos los setters</option>
          {setters.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Lead</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Empresa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Fuente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Setter</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Fecha</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">
                  <div className="inline-block w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                  No hay leads que coincidan con los filtros
                </td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                      {lead.phone && <p className="text-xs text-gray-500">{lead.phone}</p>}
                      {lead.email && <p className="text-xs text-gray-500">{lead.email}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{lead.company || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell text-xs">
                    {SOURCE_LABELS[lead.source]}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell text-xs">
                    {lead.setter ? `${lead.setter.firstName} ${lead.setter.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell text-xs">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setStatusLead(lead)}
                        className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Actualizar estado"
                      >
                        <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => setEditLead(lead)}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Página {page} de {pages} · {total} leads</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Lead" size="lg">
        <LeadForm setters={setters} closers={closers} onSuccess={handleLeadSuccess} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal open={!!editLead} onClose={() => setEditLead(null)} title="Editar Lead" size="lg">
        {editLead && (
          <LeadForm lead={editLead} setters={setters} closers={closers} onSuccess={handleLeadSuccess} onCancel={() => setEditLead(null)} />
        )}
      </Modal>

      <Modal open={!!statusLead} onClose={() => setStatusLead(null)} title="Actualizar Estado" size="sm">
        {statusLead && (
          <StatusUpdater lead={statusLead} onSuccess={handleStatusSuccess} onCancel={() => setStatusLead(null)} />
        )}
      </Modal>
    </div>
  )
}
