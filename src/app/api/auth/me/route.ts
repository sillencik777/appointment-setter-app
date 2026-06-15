import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, avatar: true, isActive: true },
    })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}
