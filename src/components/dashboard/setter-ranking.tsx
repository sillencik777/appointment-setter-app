'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { SetterKPIs } from '@/types'

interface SetterRankingProps {
  setters: SetterKPIs[]
}

export function SetterRanking({ setters }: SetterRankingProps) {
  const sorted = [...setters].sort((a, b) => b.appointmentRate - a.appointmentRate)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Setters</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Setter</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Leads</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact %</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Appt %</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Show %</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ventas</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((setter, i) => (
                <tr key={setter.userId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                        {setter.userName.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <span className="font-medium text-gray-900">{setter.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{setter.leadsReceived}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${setter.contactRate >= 30 ? 'text-green-600' : 'text-red-500'}`}>
                      {setter.contactRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${setter.appointmentRate >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                      {setter.appointmentRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${setter.showRate >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
                      {setter.showRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{setter.salesClosed}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(setter.totalRevenue)}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
