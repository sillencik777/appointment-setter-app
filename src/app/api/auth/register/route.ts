import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Only ADMIN can create users (except first user)
    const count = await prisma.user.count()
    if (count > 0) {
      try {
        requireRole(req, ['ADMIN'])
      } catch {
        return NextResponse.json({ error: 'Solo administradores pueden crear usuarios' }, { status: 403 })
      }
    }

    const { email, password, firstName, lastName, role, phone } = await req.json()
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (exists) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    }

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashed,
        firstName,
        lastName,
        role: count === 0 ? 'ADMIN' : (role || 'SETTER'),
        phone,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      firstName: user.firstName,
      lastName: user.lastName,
    })

    return NextResponse.json({ token, user })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
