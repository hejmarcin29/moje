const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = "admin@primepodloga.pl";
    const pass  = "AdminHaslo123!";
    const passwordHash = bcrypt.hashSync(pass, 10);

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
