;(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const { hashSync } = await import("bcryptjs");
  const prisma = new PrismaClient();
  try {
    const email = "admin@primepodloga.pl";
    const pass  = "AdminHaslo123!";
    const passwordHash = hashSync(pass, 10);

    await prisma.user.upsert({
      where:  { email },
      update: { role: "ADMIN", firstName: "Admin", isActive: true },
      create: { email, passwordHash, role: "ADMIN", firstName: "Admin", isActive: true },
    });

    console.log("ADMIN OK ->", email, "/", pass);
  } finally {
    await prisma.$disconnect();
  }
})();
