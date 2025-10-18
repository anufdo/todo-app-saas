import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Required for Prisma Accelerate in edge runtime.");
  }

  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
};

const globalForPrisma = globalThis as unknown as {
  prismaEdge: ReturnType<typeof createPrismaClient> | undefined;
};

export const dbEdge = globalForPrisma.prismaEdge ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaEdge = dbEdge;
}

export default dbEdge;
