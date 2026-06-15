import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        setter: { select: { id: true, firstName: true, lastName: true, email: true } },
        closer: { select: { id: true, firstName: true, lastName: true, email: true } },
        activities: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
        appointments: {
          include: { closer: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { scheduledAt: 'desc' },
        },
        sales: {
          include: { closer: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    })
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    return NextResponse.json(lead)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req)
    const data = await req.json()

    const existing = await prisma.lead.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['firstName','lastName','company','phone','email','country','source','campaign','notes','dealValue','setterId','closerId']
    allowedFields.forEach((f) => { if (data[f] !== undefined) updateData[f] = data[f] })

    // Handle status change
    if (data.status && data.status !== existing.status) {
      updateData.status = data.status

      if (data.status === 'FIRST_CONTACT') {
        updateData.lastContactAt = new Date()
      }
      if (data.status === 'QUALIFIED') {
        updateData.qualifiedAt = new Date()
      }

      // Calculate time from previous status
      const lastActivity = await prisma.leadActivity.findFirst({
        where: { leadId: params.id },
        orderBy: { createdAt: 'desc' },
      })
      const timeFromPrev = lastActivity
        ? Math.round((Date.now() - new Date(lastActivity.createdAt).getTime()) / 60000)
        : null

      await prisma.leadActivity.create({
        data: {
          leadId: params.id,
          userId: auth.userId,
          fromStatus: existing.status as any,
          toStatus: data.status as any,
          notes: data.statusNote,
          timeFromPrev,
        },
      })
    }

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
      include: {
        setter: { select: { id: true, firstName: true, lastName: true } },
        closer: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(lead)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN', 'MANAGER'])
    await prisma.lead.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.message === 'Forbidden' || err.message === 'Unauthorized') {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

function requireRole(req: NextRequest, roles: string[]) {
  const { requireRole: rr } = require('@/lib/auth')
  return rr(req, roles)
}
