// CommonJS seed script for Prisma
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const { withAccelerate } = require('@prisma/extension-accelerate');

const prisma = new PrismaClient().$extends(withAccelerate());

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create demo tenant
    const tenant = await prisma.tenant.upsert({
      where: { subdomain: "demo" },
      update: {},
      create: {
        name: "Demo Workspace",
        subdomain: "demo",
        plan: "free",
        status: "active",
      },
    });

    console.log(`✅ Tenant created: ${tenant.name}`);

    // Create demo user
    const hashedPassword = await hash("password123", 12);
    const user = await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        email: "demo@example.com",
        name: "Demo User",
        password: hashedPassword,
      },
    });

    console.log(`✅ User created: ${user.email}`);

    // Create membership (user is owner of tenant)
    await prisma.membership.upsert({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: tenant.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        tenantId: tenant.id,
        role: "owner",
      },
    });

    console.log(`✅ Membership created`);

    // Create usage counter
    await prisma.usageCounter.upsert({
      where: { tenantId: tenant.id },
      update: {},
      create: {
        tenantId: tenant.id,
        taskCount: 0,
      },
    });

    console.log(`✅ Usage counter created`);

    // Create some demo tasks
    await prisma.task.create({
      data: {
        tenantId: tenant.id,
        title: "Welcome to Todo SaaS",
        description: "This is your first task. You can create, edit, and complete tasks.",
        createdBy: user.id,
      },
    });

    await prisma.task.create({
      data: {
        tenantId: tenant.id,
        title: "Explore the dashboard",
        description: "Check out the features and settings available to you.",
        createdBy: user.id,
      },
    });

    console.log(`✅ Demo tasks created`);

    // Update usage counter
    await prisma.usageCounter.update({
      where: { tenantId: tenant.id },
      data: { taskCount: 2 },
    });

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
