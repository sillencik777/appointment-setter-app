'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Target, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import type { Goal } from '@/types'

export default function SettingsPage() {
  const [goals, setGoals] = useState<Partial<Goal>>({
    leadsTarget: 0,
    contactsTarget: 0,
    meetingsTarget: 0,
    salesTarget: 0,
    revenueTarget: 0,
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const now = new Date()
    apiFetch<Goal[]>('/api/goals', {
      params: { period: 'monthly', year: now.getFullYear().toString() }
    }).then((g) => {
      if (g.length > 0) setGoals(g[0])
    }).catch(console.error)
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const now = new Date()
      await apiFetch('/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          ...goals,
          period: 'monthly',
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const update = (field: keyof Goal, value: string) =>
    setGoals((g) => ({ ...g, [field]: parseFloat(value) || 0 }))

  return (
    <div className="p-4 lg:p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={18} className="text-indigo-600" />
            Objetivos Mensuales del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Meta de Leads"
              type="number"
              min={0}
              value={goals.leadsTarget || 0}
              onChange={(e) => update('leadsTarget', e.target.value)}
              icon={<TrendingUp size={14} />}
            />
            <Input
              label="Meta de Contactos"
              type="number"
              min={0}
              value={goals.contactsTarget || 0}
              onChange={(e) => update('contactsTarget', e.target.value)}
              icon={<TrendingUp size={14} />}
            />
            <Input
              label="Meta de Reuniones"
              type="number"
              min={0}
              value={goals.meetingsTarget || 0}
              onChange={(e) => update('meetingsTarget', e.target.value)}
              icon={<Calendar size={14} />}
            />
            <Input
              label="Meta de Ventas"
              type="number"
              min={0}
              value={goals.salesTarget || 0}
              onChange={(e) => update('salesTarget', e.target.value)}
              icon={<Target size={14} />}
            />
          </div>
          <Input
            label="Meta de Facturación (USD)"
            type="number"
            min={0}
            value={goals.revenueTarget || 0}
            onChange={(e) => update('revenueTarget', e.target.value)}
            icon={<DollarSign size={14} />}
          />

          <Button onClick={handleSave} loading={loading} className="w-full">
            {saved ? '¡Guardado!' : 'Guardar objetivos'}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-700 font-medium mb-1">Umbrales de alertas automáticas</p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Contact rate menor al 30% → alerta de rendimiento</li>
          <li>• Show rate menor al 50% → alerta de rendimiento</li>
          <li>• Appointment rate menor al 10% → alerta de rendimiento</li>
          <li>• Lead sin seguimiento +48 horas → alerta urgente</li>
        </ul>
      </div>
    </div>
  )
}
