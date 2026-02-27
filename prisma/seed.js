const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'turner@bythepixel.com'
  const password = '123'
  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      firstName: 'Turner',
      lastName: 'Walters',
      isAdmin: true,
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Turner',
      lastName: 'Walters',
      isAdmin: true,
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
