import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () => {
  const datasourceUrl = process.env.DATABASE_URL;
  const isAccelerateUrl = datasourceUrl?.startsWith("prisma+");

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  });

  if (isAccelerateUrl) {
    return client.$extends(withAccelerate()) as unknown as PrismaClient;
  }

  return client;
};

type PrismaClientInstance = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
};

export const db: PrismaClientInstance = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
