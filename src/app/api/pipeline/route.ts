import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const where: Record<string, unknown> = {}
    if (auth.role === 'SETTER') where.setterId = auth.userId

    const leads = await prisma.lead.findMany({
      where,
      include: {
        setter: { select: { id: true, firstName: true, lastName: true } },
        closer: { select: { id: true, firstName: true, lastName: true } },
        appointments: { orderBy: { scheduledAt: 'desc' }, take: 1 },
        sales: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Group by status
    const pipeline = leads.reduce((acc, lead) => {
      const status = lead.status
      if (!acc[status]) acc[status] = []
      acc[status].push(lead)
      return acc
    }, {} as Record<string, typeof leads>)

    return NextResponse.json(pipeline)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
