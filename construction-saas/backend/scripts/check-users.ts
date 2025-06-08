import { prisma } from '../src/core/database/prisma';

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      include: { organization: true }
    });

    console.log('Found', users.length, 'users:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Phone: ${user.phone}, Role: ${user.role}`);
    });

    if (users.length === 0) {
      console.log('No users found. Creating test user...');
      
      // Create test organization
      const org = await prisma.organization.create({
        data: {
          name: 'Test Construction Co',
          type: 'COMPANY',
        },
      });

      // Create test user with different phone number
      const { PasswordService } = await import('../src/core/services/password.service');
      const passwordHash = await PasswordService.hash('Test@123');
      const user = await prisma.user.create({
        data: {
          email: 'test@projecteye.com',
          phone: '9876543211', // Different phone number
          passwordHash,
          firstName: 'Test',
          lastName: 'User',
          role: 'OWNER',
          organizationId: org.id,
          emailVerified: true,
          phoneVerified: true,
        },
      });

      console.log('✅ Test user created successfully!');
      console.log('Email: test@projecteye.com');
      console.log('Phone: 9876543211');
      console.log('Password: Test@123');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 