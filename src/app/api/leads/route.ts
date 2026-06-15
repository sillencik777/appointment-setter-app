import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const { searchParams } = new URL(req.url)

    const where: Record<string, unknown> = {}

    // Setters can only see their own leads
    if (auth.role === 'SETTER') {
      where.setterId = auth.userId
    }

    const setterId = searchParams.get('setterId')
    const closerId = searchParams.get('closerId')
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const country = searchParams.get('country')
    const campaign = searchParams.get('campaign')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')

    if (setterId && auth.role !== 'SETTER') where.setterId = setterId
    if (closerId) where.closerId = closerId
    if (status) where.status = status
    if (source) where.source = source
    if (country) where.country = country
    if (campaign) where.campaign = campaign
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as any).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as any).lte = new Date(dateTo)
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          setter: { select: { id: true, firstName: true, lastName: true } },
          closer: { select: { id: true, firstName: true, lastName: true } },
          activities: { orderBy: { createdAt: 'desc' }, take: 1 },
          appointments: { orderBy: { scheduledAt: 'desc' }, take: 1 },
          sales: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json({ leads, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const data = await req.json()

    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        phone: data.phone,
        email: data.email,
        country: data.country,
        source: data.source || 'OTHER',
        campaign: data.campaign,
        notes: data.notes,
        dealValue: data.dealValue ? parseFloat(data.dealValue) : null,
        setterId: data.setterId || (auth.role === 'SETTER' ? auth.userId : null),
        closerId: data.closerId,
        status: 'NEW',
      },
      include: {
        setter: { select: { id: true, firstName: true, lastName: true } },
        closer: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    // Log initial activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: auth.userId,
        toStatus: 'NEW',
        notes: 'Lead creado',
      },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
