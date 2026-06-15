'use client'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Alert } from '@/types'

interface AlertsPanelProps {
  alerts: Alert[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) return null

  const icons = {
    warning: <AlertTriangle size={16} className="text-yellow-500" />,
    danger: <AlertCircle size={16} className="text-red-500" />,
    info: <Info size={16} className="text-blue-500" />,
  }

  const styles = {
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return (
    <Card className="border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-yellow-700">
          <AlertTriangle size={18} />
          Alertas ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 5).map((alert, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${styles[alert.type]}`}>
            {icons[alert.type]}
            <p className="text-sm text-gray-700">{alert.message}</p>
          </div>
        ))}
        {alerts.length > 5 && (
          <p className="text-xs text-gray-500 text-center pt-1">+{alerts.length - 5} alertas más</p>
        )}
      </CardContent>
    </Card>
  )
}
