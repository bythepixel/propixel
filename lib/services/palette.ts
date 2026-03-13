import { prisma } from '../prisma';

export const paletteService = {
    async getAllPalettes() {
        return prisma.stylePalette.findMany({
            orderBy: { name: 'asc' },
        });
    },

    async getPaletteById(id: number) {
        return prisma.stylePalette.findUnique({
            where: { id },
        });
    },

    async createPalette(data: {
        name: string;
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
        backgroundColor?: string;
        textColor?: string;
        headingColor?: string;
        fontFamily?: string;
        headingFont?: string;
        isDefault?: boolean;
    }) {
        if (data.isDefault) {
            // Unset other defaults
            await prisma.stylePalette.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        return prisma.stylePalette.create({
            data,
        });
    },

    async updatePalette(id: number, data: any) {
        if (data.isDefault) {
            await prisma.stylePalette.updateMany({
                where: { isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        return prisma.stylePalette.update({
            where: { id },
            data,
        });
    },

    async deletePalette(id: number) {
        return prisma.stylePalette.delete({
            where: { id },
        });
    },

    async getDefaultPalette() {
        return prisma.stylePalette.findFirst({
            where: { isDefault: true },
        }) || prisma.stylePalette.findFirst(); // Fallback to first available
    }
};
