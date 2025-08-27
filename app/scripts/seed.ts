
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create test user required for authentication testing
  const testUserEmail = 'john@doe.com';
  const testUserPassword = 'johndoe123';

  const existingUser = await prisma.user.findUnique({
    where: { email: testUserEmail }
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(testUserPassword, 12);
    
    const testUser = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'John Doe',
        password: hashedPassword,
      }
    });

    console.log(`✅ Test user created: ${testUser.email}`);
  } else {
    console.log(`✅ Test user already exists: ${existingUser.email}`);
  }

  // Create admin user
  const adminEmail = 'admin@deepagent.ai';
  const adminPassword = 'deepagent123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'DeepAgent Admin',
        password: hashedAdminPassword,
      }
    });

    console.log(`✅ Admin user created: ${adminUser.email}`);
  } else {
    console.log(`✅ Admin user already exists: ${existingAdmin.email}`);
  }

  console.log('✅ Database seeding completed');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
