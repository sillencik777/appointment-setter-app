import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req)
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, createdAt: true },
      orderBy: { firstName: 'asc' },
    })
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN'])
    const { hashPassword } = await import('@/lib/auth')
    const data = await req.json()

    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (exists) return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: await hashPassword(data.password || 'ChangeMe123!'),
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'SETTER',
        phone: data.phone,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (err: any) {
    if (err.message === 'Forbidden' || err.message === 'Unauthorized') {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
