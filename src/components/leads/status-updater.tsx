'use client'
import { useState } from 'react'
import { apiFetch } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Select, Textarea } from '@/components/ui/input'
import { PIPELINE_STAGES, STATUS_LABELS } from '@/types'
import type { Lead, LeadStatus } from '@/types'

interface StatusUpdaterProps {
  lead: Lead
  onSuccess: (lead: Lead) => void
  onCancel: () => void
}

export function StatusUpdater({ lead, onSuccess, onCancel }: StatusUpdaterProps) {
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const statusOptions = PIPELINE_STAGES.map((s) => ({
    value: s.status,
    label: `${s.icon} ${s.label}`,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === lead.status) { onCancel(); return }
    setLoading(true)
    setError('')
    try {
      const result = await apiFetch<Lead>(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, statusNote: note }),
      })
      onSuccess(result)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <span className="font-medium">Lead:</span> {lead.firstName} {lead.lastName}
        {lead.company && <span className="text-gray-400"> · {lead.company}</span>}
      </div>

      <Select
        label="Nuevo estado"
        options={statusOptions}
        value={status}
        onChange={(e) => setStatus(e.target.value as LeadStatus)}
      />

      <Textarea
        label="Nota (opcional)"
        placeholder="¿Qué sucedió en este cambio?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" loading={loading}>
          Actualizar estado
        </Button>
      </div>
    </form>
  )
}
