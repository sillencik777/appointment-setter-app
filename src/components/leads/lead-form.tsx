'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/input'
import { apiFetch } from '@/lib/utils'
import type { Lead, User } from '@/types'
import { SOURCE_LABELS } from '@/types'

interface LeadFormProps {
  lead?: Partial<Lead>
  setters: User[]
  closers: User[]
  onSuccess: (lead: Lead) => void
  onCancel: () => void
}

const SOURCE_OPTIONS = Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label }))

const COUNTRY_OPTIONS = [
  { value: 'AR', label: 'Argentina' },
  { value: 'MX', label: 'México' },
  { value: 'CO', label: 'Colombia' },
  { value: 'ES', label: 'España' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Perú' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'PA', label: 'Panamá' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'HN', label: 'Honduras' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'DO', label: 'Rep. Dominicana' },
  { value: 'OTHER', label: 'Otro' },
]

export function LeadForm({ lead, setters, closers, onSuccess, onCancel }: LeadFormProps) {
  const isEdit = !!lead?.id
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: lead?.firstName || '',
    lastName: lead?.lastName || '',
    company: lead?.company || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    country: lead?.country || '',
    source: lead?.source || 'OTHER',
    campaign: lead?.campaign || '',
    notes: lead?.notes || '',
    dealValue: lead?.dealValue?.toString() || '',
    setterId: lead?.setterId || '',
    closerId: lead?.closerId || '',
  })

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName) {
      setError('Nombre y apellido son requeridos')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await apiFetch<Lead>(
        isEdit ? `/api/leads/${lead!.id}` : '/api/leads',
        { method: isEdit ? 'PATCH' : 'POST', body: JSON.stringify(form) }
      )
      onSuccess(result)
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nombre *" placeholder="Juan" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
        <Input label="Apellido *" placeholder="García" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
      </div>

      <Input label="Empresa" placeholder="Nombre de la empresa" value={form.company} onChange={(e) => update('company', e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Teléfono" placeholder="+1 234 567 8900" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <Input label="Email" placeholder="juan@empresa.com" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="País" options={COUNTRY_OPTIONS} placeholder="Seleccionar país" value={form.country} onChange={(e) => update('country', e.target.value)} />
        <Select label="Fuente" options={SOURCE_OPTIONS} value={form.source} onChange={(e) => update('source', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Campaña" placeholder="FB - Ads Enero" value={form.campaign} onChange={(e) => update('campaign', e.target.value)} />
        <Input label="Valor del Deal (USD)" placeholder="5000" type="number" value={form.dealValue} onChange={(e) => update('dealValue', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Setter asignado"
          options={setters.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
          placeholder="Seleccionar setter"
          value={form.setterId}
          onChange={(e) => update('setterId', e.target.value)}
        />
        <Select
          label="Closer asignado"
          options={closers.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
          placeholder="Seleccionar closer"
          value={form.closerId}
          onChange={(e) => update('closerId', e.target.value)}
        />
      </div>

      <Textarea label="Notas" placeholder="Observaciones sobre el lead..." value={form.notes} onChange={(e) => update('notes', e.target.value)} />

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear lead'}
        </Button>
      </div>
    </form>
  )
}
