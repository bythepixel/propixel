const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

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
  })
