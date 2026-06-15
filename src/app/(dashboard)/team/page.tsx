'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input, Select } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, UserCheck, Users } from 'lucide-react'
import type { User } from '@/types'

const ROLE_OPTIONS = [
  { value: 'SETTER', label: 'Appointment Setter' },
  { value: 'CLOSER', label: 'Closer' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Administrador' },
]

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SETTER: 'Setter',
  CLOSER: 'Closer',
}

const ROLE_COLORS: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  ADMIN: 'warning',
  MANAGER: 'info',
  SETTER: 'default',
  CLOSER: 'success',
}

export default function TeamPage() {
  const [team, setTeam] = useState<User[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'SETTER', phone: '',
  })

  const loadTeam = async () => {
    try {
      const users = await apiFetch<User[]>('/api/team')
      setTeam(users)
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTeam() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await apiFetch('/api/team', { method: 'POST', body: JSON.stringify(form) })
      setShowCreate(false)
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'SETTER', phone: '' })
      loadTeam()
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Equipo</h1>
          <p className="text-sm text-gray-500">{team.length} miembros</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          Nuevo miembro
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((user) => (
            <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center text-base font-bold text-indigo-700 flex-shrink-0">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                    <Badge variant={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                  {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo miembro del equipo" size="md">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre *" value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} required />
            <Input label="Apellido *" value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} required />
          </div>
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Contraseña" type="password" placeholder="ChangeMe123!" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
          <Input label="Teléfono" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Select label="Rol" options={ROLE_OPTIONS} value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={saving}>Crear miembro</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
