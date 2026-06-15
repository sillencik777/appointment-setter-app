import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'monthly'
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const goals = await prisma.goal.findMany({
      where: {
        period,
        year,
        userId: auth.role === 'SETTER' ? auth.userId : undefined,
      },
    })
    return NextResponse.json(goals)
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const data = await req.json()

    const goal = await prisma.goal.upsert({
      where: {
        id: data.id || 'new',
      },
      update: {
        leadsTarget: data.leadsTarget || 0,
        contactsTarget: data.contactsTarget || 0,
        meetingsTarget: data.meetingsTarget || 0,
        salesTarget: data.salesTarget || 0,
        revenueTarget: data.revenueTarget || 0,
      },
      create: {
        userId: data.userId || auth.userId,
        period: data.period || 'monthly',
        year: data.year || new Date().getFullYear(),
        week: data.week,
        month: data.month || new Date().getMonth() + 1,
        leadsTarget: data.leadsTarget || 0,
        contactsTarget: data.contactsTarget || 0,
        meetingsTarget: data.meetingsTarget || 0,
        salesTarget: data.salesTarget || 0,
        revenueTarget: data.revenueTarget || 0,
      },
    })
    return NextResponse.json(goal)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
