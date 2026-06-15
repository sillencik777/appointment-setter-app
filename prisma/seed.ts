import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin
  const adminPass = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@closermetrics.com' },
    update: {},
    create: {
      email: 'admin@closermetrics.com',
      password: adminPass,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'ADMIN',
    },
  })

  // Create manager
  const managerPass = await bcrypt.hash('Manager123!', 12)
  const manager = await prisma.user.upsert({
    where: { email: 'manager@closermetrics.com' },
    update: {},
    create: {
      email: 'manager@closermetrics.com',
      password: managerPass,
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      role: 'MANAGER',
    },
  })

  // Create setters
  const setterPass = await bcrypt.hash('Setter123!', 12)
  const setter1 = await prisma.user.upsert({
    where: { email: 'setter1@closermetrics.com' },
    update: {},
    create: {
      email: 'setter1@closermetrics.com',
      password: setterPass,
      firstName: 'Ana',
      lastName: 'González',
      role: 'SETTER',
    },
  })
  const setter2 = await prisma.user.upsert({
    where: { email: 'setter2@closermetrics.com' },
    update: {},
    create: {
      email: 'setter2@closermetrics.com',
      password: setterPass,
      firstName: 'Luis',
      lastName: 'Martínez',
      role: 'SETTER',
    },
  })

  // Create closer
  const closerPass = await bcrypt.hash('Closer123!', 12)
  const closer = await prisma.user.upsert({
    where: { email: 'closer@closermetrics.com' },
    update: {},
    create: {
      email: 'closer@closermetrics.com',
      password: closerPass,
      firstName: 'María',
      lastName: 'López',
      role: 'CLOSER',
    },
  })

  // Create sample leads
  const statuses = [
    'NEW','FIRST_CONTACT','RESPONDED','QUALIFIED','INTERESTED',
    'MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED','NO_SHOW',
    'SALE_CLOSED','SALE_LOST',
  ]
  const sources = ['FACEBOOK','INSTAGRAM','LINKEDIN','GOOGLE','REFERRAL','COLD_EMAIL']
  const countries = ['AR','MX','CO','ES','CL','PE','US']
  const companies = ['TechCorp','StartupXYZ','GlobalTrade','FintechPro','EduOnline','MedSolutions']
  const firstNames = ['Pedro','María','Juan','Ana','Carlos','Sofía','Miguel','Laura']
  const lastNames = ['García','Rodríguez','López','Martínez','González','Pérez','Sánchez','Torres']

  for (let i = 0; i < 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const setter = Math.random() > 0.5 ? setter1 : setter2
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000)

    const lead = await prisma.lead.create({
      data: {
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        company: Math.random() > 0.3 ? companies[Math.floor(Math.random() * companies.length)] : null,
        email: `lead${i}@example.com`,
        phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        country: countries[Math.floor(Math.random() * countries.length)],
        source: sources[Math.floor(Math.random() * sources.length)] as any,
        campaign: Math.random() > 0.5 ? `FB Ads ${Math.floor(Math.random() * 3) + 1}` : null,
        status: status as any,
        setterId: setter.id,
        closerId: closer.id,
        dealValue: Math.random() > 0.3 ? Math.floor(Math.random() * 9000 + 1000) : null,
        createdAt,
        lastContactAt: ['FIRST_CONTACT','RESPONDED','QUALIFIED','INTERESTED','MEETING_PROPOSED','MEETING_SCHEDULED','ATTENDED','NO_SHOW','SALE_CLOSED','SALE_LOST'].includes(status)
          ? new Date(createdAt.getTime() + Math.random() * 48 * 3600 * 1000)
          : null,
      },
    })

    // Log activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: setter.id,
        toStatus: status as any,
        notes: 'Estado inicial',
        createdAt,
      },
    })

    // Add sale if closed
    if (status === 'SALE_CLOSED') {
      await prisma.sale.create({
        data: {
          leadId: lead.id,
          closerId: closer.id,
          amount: lead.dealValue || Math.floor(Math.random() * 5000 + 2000),
          currency: 'USD',
          closedAt: new Date(createdAt.getTime() + Math.random() * 7 * 24 * 3600 * 1000),
        },
      })
    }
  }

  console.log('✅ Seed completed!')
  console.log('📧 Cuentas de acceso:')
  console.log('   Admin:   admin@closermetrics.com / Admin123!')
  console.log('   Manager: manager@closermetrics.com / Manager123!')
  console.log('   Setter1: setter1@closermetrics.com / Setter123!')
  console.log('   Setter2: setter2@closermetrics.com / Setter123!')
  console.log('   Closer:  closer@closermetrics.com / Closer123!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
