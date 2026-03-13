const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding Style Palettes...');

    const defaultPalette = await prisma.stylePalette.upsert({
        where: { name: 'ProPixel Default' },
        update: {},
        create: {
            name: 'ProPixel Default',
            primaryColor: '#3B82F6',
            secondaryColor: '#1E293B',
            accentColor: '#F59E0B',
            backgroundColor: '#FFFFFF',
            textColor: '#111827',
            headingColor: '#000000',
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Outfit, sans-serif',
            isDefault: true,
        },
    });

    console.log(`Seeded default palette: ${defaultPalette.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
