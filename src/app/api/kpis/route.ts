import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { calculateTeamKPIs, calculateFunnel, detectAlerts } from '@/lib/kpi-calculator'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const { searchParams } = new URL(req.url)

    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const setterId = searchParams.get('setterId')

    const where: Record<string, unknown> = {}
    if (auth.role === 'SETTER') where.setterId = auth.userId
    else if (setterId) where.setterId = setterId
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as any).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as any).lte = new Date(dateTo)
    }

    const [leads, users] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          activities: { orderBy: { createdAt: 'asc' } },
          appointments: true,
          sales: true,
          setter: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.user.findMany({
        where: { isActive: true, role: { in: ['SETTER', 'CLOSER'] } },
        select: { id: true, firstName: true, lastName: true, role: true },
      }),
    ])

    const setters = users.filter((u) => u.role === 'SETTER')
    const teamKPIs = calculateTeamKPIs(leads as any, setters)
    const funnel = calculateFunnel(leads as any)
    const alerts = detectAlerts(leads as any, teamKPIs.setterKPIs)

    return NextResponse.json({ teamKPIs, funnel, alerts })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
