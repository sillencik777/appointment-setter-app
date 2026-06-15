import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import type { AuthToken } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'closer-metrics-secret-2024'

export function signToken(payload: AuthToken): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenFromRequest(req: NextRequest): AuthToken | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(authHeader.slice(7))
  }
  const cookieToken = req.cookies.get('token')?.value
  if (cookieToken) {
    return verifyToken(cookieToken)
  }
  return null
}

export function requireAuth(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export function requireRole(req: NextRequest, roles: string[]) {
  const user = requireAuth(req)
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  return user
}
