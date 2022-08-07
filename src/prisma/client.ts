import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    rejectOnNotFound: false,
});

export const DisconnectPrisma = async () => await prisma.$disconnect();
