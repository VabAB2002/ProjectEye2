import { prisma } from '../src/core/database/prisma';

async function createTestProject() {
  try {
    // Find an existing OWNER user
    const user = await prisma.user.findFirst({
      where: { role: 'OWNER' },
      include: { organization: true }
    });

    if (!user) {
      console.error('Test user not found. Please run create-test-user.ts first');
      return;
    }

    // Create a test project
    const project = await prisma.project.create({
      data: {
        name: 'Green Valley Residency',
        type: 'RESIDENTIAL',
        description: 'Premium 2BHK and 3BHK apartments with modern amenities',
        address: {
          line1: 'Plot No. 45, Sector 21',
          line2: 'Near Central Mall',
          city: 'Gurgaon',
          state: 'Haryana',
          pincode: '122001',
          landmark: 'Opposite City Park'
        },
        startDate: new Date('2024-01-15'),
        estimatedEndDate: new Date('2025-12-31'),
        totalBudget: 50000000, // 5 Crore
        status: 'ACTIVE',
        organizationId: user.organizationId,
      }
    });

    // Add user as project owner
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: 'OWNER',
        permissions: {
          canViewFinancials: true,
          canApproveExpenses: true,
          canEditProject: true,
          canAddMembers: true,
          canUploadDocuments: true,
          canCreateMilestones: true,
        }
      }
    });

    // Create some milestones
    const milestones = [
      { name: 'Site Preparation', plannedStart: new Date('2024-01-15'), plannedEnd: new Date('2024-01-31'), order: 1 },
      { name: 'Foundation', plannedStart: new Date('2024-02-01'), plannedEnd: new Date('2024-03-15'), order: 2 },
      { name: 'Structure', plannedStart: new Date('2024-03-16'), plannedEnd: new Date('2024-06-30'), order: 3 },
      { name: 'Roofing', plannedStart: new Date('2024-07-01'), plannedEnd: new Date('2024-07-31'), order: 4 },
    ];

    for (const milestone of milestones) {
      await prisma.milestone.create({
        data: {
          projectId: project.id,
          ...milestone,
          status: milestone.order <= 2 ? 'COMPLETED' : milestone.order === 3 ? 'IN_PROGRESS' : 'PENDING',
          progressPercentage: milestone.order <= 2 ? 100 : milestone.order === 3 ? 45 : 0,
        }
      });
    }

    // Add some transactions
    await prisma.transaction.createMany({
      data: [
        {
          projectId: project.id,
          type: 'EXPENSE',
          category: 'MATERIAL',
          amount: 1500000,
          description: 'Cement and Steel purchase',
          vendorName: 'ABC Suppliers',
          paymentMode: 'BANK_TRANSFER',
          approvalStatus: 'APPROVED',
          approvedBy: user.id,
          approvedAt: new Date(),
        },
        {
          projectId: project.id,
          type: 'EXPENSE',
          category: 'LABOR',
          amount: 500000,
          description: 'Monthly labor payment',
          paymentMode: 'CASH',
          approvalStatus: 'APPROVED',
          approvedBy: user.id,
          approvedAt: new Date(),
        },
        {
          projectId: project.id,
          type: 'PAYMENT',
          category: 'MISCELLANEOUS',
          amount: 1000000,
          description: 'Client advance payment',
          paymentMode: 'BANK_TRANSFER',
          approvalStatus: 'APPROVED',
        }
      ]
    });

    console.log('\n✅ Test project created successfully!');
    console.log('Project Name:', project.name);
    console.log('Project ID:', project.id);
    console.log('Budget: ₹5 Crore');
    console.log('Status:', project.status);
    console.log('\nYou can now see this project in your mobile app!');

  } catch (error) {
    console.error('Error creating test project:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestProject();
