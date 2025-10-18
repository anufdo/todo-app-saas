import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type GlobalThisWithPrisma = typeof globalThis & { prisma: PrismaClient };

export const db = ((globalThis as GlobalThisWithPrisma).prisma ?? prismaClientSingleton());

if (process.env.NODE_ENV !== "production") (globalThis as GlobalThisWithPrisma).prisma = db;

export default db;
