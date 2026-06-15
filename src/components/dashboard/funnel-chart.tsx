'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { FunnelData } from '@/types'

interface FunnelChartProps {
  data: FunnelData[]
}

const STAGE_COLORS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-cyan-500',
  'bg-teal-500', 'bg-emerald-500', 'bg-lime-500', 'bg-green-500',
]

export function FunnelChart({ data }: FunnelChartProps) {
  const maxCount = data[0]?.count || 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embudo de Conversión</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((stage, i) => {
          const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
          return (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{stage.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {i > 0 ? `${stage.conversionFromPrev}%` : ''}
                  </span>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">{stage.count}</span>
                </div>
              </div>
              <div className="kpi-progress">
                <div
                  className={`kpi-progress-bar ${STAGE_COLORS[i % STAGE_COLORS.length]}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
