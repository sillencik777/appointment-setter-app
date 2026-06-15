import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'csv'

    const where: Record<string, unknown> = {}
    if (auth.role === 'SETTER') where.setterId = auth.userId

    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as any).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as any).lte = new Date(dateTo)
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        setter: { select: { firstName: true, lastName: true } },
        closer: { select: { firstName: true, lastName: true } },
        sales: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const rows = leads.map((l) => ({
      'Nombre': l.firstName,
      'Apellido': l.lastName,
      'Empresa': l.company || '',
      'Teléfono': l.phone || '',
      'Email': l.email || '',
      'País': l.country || '',
      'Fuente': l.source,
      'Campaña': l.campaign || '',
      'Estado': l.status,
      'Setter': l.setter ? `${l.setter.firstName} ${l.setter.lastName}` : '',
      'Closer': l.closer ? `${l.closer.firstName} ${l.closer.lastName}` : '',
      'Valor Deal': l.dealValue || '',
      'Ventas': l.sales.reduce((s, x) => s + x.amount, 0),
      'Fecha Ingreso': l.createdAt.toISOString().split('T')[0],
      'Último Contacto': l.lastContactAt ? l.lastContactAt.toISOString().split('T')[0] : '',
    }))

    if (format === 'csv') {
      const headers = Object.keys(rows[0] || {})
      const csv = [
        headers.join(','),
        ...rows.map((r) => headers.map((h) => `"${(r as any)[h]}"`).join(',')),
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=leads.csv',
        },
      })
    }

    // Excel
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=leads.xlsx',
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
