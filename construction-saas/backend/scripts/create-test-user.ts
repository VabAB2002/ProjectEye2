import { prisma } from '../src/core/database/prisma';
import { PasswordService } from '../src/core/services/password.service';

async function createTestUser() {
  try {
    // Create test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Construction Co',
        type: 'COMPANY',
      },
    });

    // Create test user
    const passwordHash = await PasswordService.hash('Test@123');
    const user = await prisma.user.create({
      data: {
        email: 'test@projecteye.com',
        phone: '9876543210',
        passwordHash,
        firstName: 'Test',
        lastName: 'User',
        role: 'OWNER',
        organizationId: org.id,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    console.log('Test user created:');
    console.log('Email: test@projecteye.com');
    console.log('Phone: 9876543210');
    console.log('Password: Test@123');
    console.log('User ID:', user.id);
    console.log('Org ID:', org.id);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
