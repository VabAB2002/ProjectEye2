import { PrismaClient } from '@prisma/client';
import { AppError } from '../../api/middlewares/error.middleware';

const prisma = new PrismaClient();

export class AnalyticsService {
  // Get project overview analytics
  static async getProjectOverview(projectId: string, organizationId: string) {
    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Get milestone statistics
    const milestones = await prisma.milestone.findMany({
      where: { projectId },
    });

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'COMPLETED').length;
    const pendingMilestones = milestones.filter(m => m.status === 'PENDING').length;
    const inProgressMilestones = milestones.filter(m => m.status === 'IN_PROGRESS').length;
    const delayedMilestones = milestones.filter(m => {
      const now = new Date();
      return m.status !== 'COMPLETED' && m.plannedEnd < now;
    }).length;

    // Calculate overall progress
    const overallProgress = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    // Get financial statistics
    const transactions = await prisma.transaction.findMany({
      where: { projectId },
    });

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPayments = transactions
      .filter(t => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalAdvances = transactions
      .filter(t => t.type === 'ADVANCE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const budgetUtilized = Number(project.totalBudget) > 0
      ? Math.round((totalExpenses / Number(project.totalBudget)) * 100)
      : 0;

    // Get team statistics
    const teamMembers = await prisma.projectMember.count({
      where: { projectId },
    });

    // Get progress updates count
    const progressUpdates = await prisma.progressUpdate.count({
      where: { projectId },
    });

    // Calculate days remaining
    const now = new Date();
    const estimatedEnd = new Date(project.estimatedEndDate);
    const daysRemaining = Math.ceil((estimatedEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      project: {
        name: project.name,
        type: project.type,
        status: project.status,
        startDate: project.startDate,
        estimatedEndDate: project.estimatedEndDate,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        isDelayed: daysRemaining < 0 && project.status !== 'COMPLETED',
      },
      progress: {
        overall: overallProgress,
        milestones: {
          total: totalMilestones,
          completed: completedMilestones,
          inProgress: inProgressMilestones,
          pending: pendingMilestones,
          delayed: delayedMilestones,
        },
        updates: progressUpdates,
      },
      financial: {
        budget: Number(project.totalBudget),
        expenses: totalExpenses,
        payments: totalPayments,
        advances: totalAdvances,
        remaining: Number(project.totalBudget) - totalExpenses,
        utilized: budgetUtilized,
      },
      team: {
        totalMembers: teamMembers,
      },
    };
  }

  // Get financial analytics with monthly breakdown
  static async getFinancialAnalytics(projectId: string, organizationId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const transactions = await prisma.transaction.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const monthlyData: { [key: string]: any } = {};
    
    transactions.forEach(transaction => {
      const monthKey = new Date(transaction.createdAt).toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          expenses: 0,
          payments: 0,
          advances: 0,
          total: 0,
        };
      }

      const amount = Number(transaction.amount);
      
      switch (transaction.type) {
        case 'EXPENSE':
          monthlyData[monthKey].expenses += amount;
          break;
        case 'PAYMENT':
          monthlyData[monthKey].payments += amount;
          break;
        case 'ADVANCE':
          monthlyData[monthKey].advances += amount;
          break;
      }
      
      monthlyData[monthKey].total += amount;
    });

    // Category breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(transaction => {
        const category = transaction.category || 'Uncategorized';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + Number(transaction.amount);
      });

    // Top vendors
    const vendorSpending: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.vendorName)
      .forEach(transaction => {
        const vendor = transaction.vendorName!;
        vendorSpending[vendor] = (vendorSpending[vendor] || 0) + Number(transaction.amount);
      });

    const topVendors = Object.entries(vendorSpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    return {
      monthly: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
      categories: Object.entries(categoryBreakdown).map(([name, amount]) => ({ name, amount })),
      topVendors,
      summary: {
        totalTransactions: transactions.length,
        approvedTransactions: transactions.filter(t => t.approvalStatus === 'APPROVED').length,
        pendingApprovals: transactions.filter(t => t.approvalStatus === 'PENDING').length,
      },
    };
  }

  // Get milestone analytics
  static async getMilestoneAnalytics(projectId: string, organizationId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      include: {
        progressUpdates: true,
      },
      orderBy: { order: 'asc' },
    });

    const now = new Date();

    const milestoneStats = milestones.map(milestone => {
      const plannedDuration = Math.ceil(
        (new Date(milestone.plannedEnd).getTime() - new Date(milestone.plannedStart).getTime()) / (1000 * 60 * 60 * 24)
      );

      let actualDuration = 0;
      if (milestone.actualStart) {
        const endDate = milestone.actualEnd || now;
        actualDuration = Math.ceil(
          (endDate.getTime() - new Date(milestone.actualStart).getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      const isDelayed = milestone.status !== 'COMPLETED' && new Date(milestone.plannedEnd) < now;

      return {
        id: milestone.id,
        name: milestone.name,
        status: milestone.status,
        progress: milestone.progressPercentage,
        plannedStart: milestone.plannedStart,
        plannedEnd: milestone.plannedEnd,
        actualStart: milestone.actualStart,
        actualEnd: milestone.actualEnd,
        plannedDuration,
        actualDuration,
        isDelayed,
        progressUpdateCount: milestone.progressUpdates.length,
      };
    });

    // Calculate completion rate by time periods
    const completionByMonth: { [key: string]: { completed: number; total: number } } = {};

    milestones.forEach(milestone => {
      const monthKey = new Date(milestone.plannedEnd).toISOString().slice(0, 7);
      
      if (!completionByMonth[monthKey]) {
        completionByMonth[monthKey] = { completed: 0, total: 0 };
      }
      
      completionByMonth[monthKey].total++;
      
      if (milestone.status === 'COMPLETED') {
        completionByMonth[monthKey].completed++;
      }
    });

    return {
      milestones: milestoneStats,
      summary: {
        averageProgress: Math.round(
          milestones.reduce((sum, m) => sum + m.progressPercentage, 0) / (milestones.length || 1)
        ),
        onTimeCompletion: milestones.filter(m => 
          m.status === 'COMPLETED' && m.actualEnd && m.actualEnd <= m.plannedEnd
        ).length,
        delayedCompletion: milestones.filter(m => 
          m.status === 'COMPLETED' && m.actualEnd && m.actualEnd > m.plannedEnd
        ).length,
      },
      completionTrend: Object.entries(completionByMonth)
        .map(([month, data]) => ({
          month,
          completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
          completed: data.completed,
          total: data.total,
        }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  // Get team productivity analytics
  static async getTeamAnalytics(projectId: string, organizationId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Get progress updates by member
    const progressUpdates = await prisma.progressUpdate.findMany({
      where: { projectId },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate member contributions
    const memberContributions = members.map(member => {
      const updates = progressUpdates.filter(u => u.reportedBy === member.userId);
      
      return {
        id: member.userId,
        name: `${member.user.firstName}${member.user.lastName ? ` ${member.user.lastName}` : ''}`,
        role: member.role,
        progressUpdates: updates.length,
        joinedAt: member.joinedAt,
        daysActive: Math.ceil(
          (new Date().getTime() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24)
        ),
      };
    });

    // Role distribution
    const roleDistribution: { [key: string]: number } = {};
    members.forEach(member => {
      roleDistribution[member.role] = (roleDistribution[member.role] || 0) + 1;
    });

    // Activity timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUpdates = progressUpdates.filter(u => u.createdAt > thirtyDaysAgo);
    
    const activityByDay: { [key: string]: number } = {};
    recentUpdates.forEach(update => {
      const dayKey = update.date.toISOString().slice(0, 10);
      activityByDay[dayKey] = (activityByDay[dayKey] || 0) + 1;
    });

    return {
      members: memberContributions,
      roleDistribution: Object.entries(roleDistribution).map(([role, count]) => ({ role, count })),
      activity: {
        last30Days: Object.entries(activityByDay)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        totalUpdates: progressUpdates.length,
        averagePerMember: Math.round(progressUpdates.length / (members.length || 1)),
      },
    };
  }

  // Get dashboard data (simplified overview)
  static async getDashboardData(projectId: string, organizationId: string) {
    const overview = await this.getProjectOverview(projectId, organizationId);
    return {
      project: overview.project,
      metrics: {
        totalSpent: overview.financial.expenses,
        budgetUtilization: overview.financial.utilized,
        progressUpdates: overview.progress.updates,
        completedMilestones: overview.progress.milestones.completed,
        totalMilestones: overview.progress.milestones.total,
        teamMembers: overview.team.totalMembers,
        pendingApprovals: 0, // Will be calculated from transactions
      },
    };
  }

  // Get progress trends for charts
  static async getProgressTrends(projectId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const progressUpdates = await prisma.progressUpdate.findMany({
      where: {
        projectId,
        date: { gte: startDate },
      },
      select: {
        date: true,
        workersCount: true,
        weatherConditions: true,
        issues: true,
      },
      orderBy: { date: 'asc' },
    });

    return progressUpdates.map(update => ({
      date: update.date.toISOString().split('T')[0],
      workerCount: update.workersCount || 0,
      weatherCondition: update.weatherConditions,
      hasIssues: update.issues?.toLowerCase().includes('issue') || update.issues?.toLowerCase().includes('delay') || false,
    }));
  }

  // Get budget burn rate
  static async getBudgetBurnRate(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { totalBudget: true, startDate: true, estimatedEndDate: true },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const expenses = await prisma.transaction.findMany({
      where: {
        projectId,
        type: 'EXPENSE',
        approvalStatus: 'APPROVED',
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    let cumulativeSpent = 0;
    const burnRate = expenses.map(expense => {
      cumulativeSpent += Number(expense.amount);
      return {
        date: expense.createdAt.toISOString().split('T')[0],
        cumulativeSpent,
        budgetRemaining: Number(project.totalBudget) - cumulativeSpent,
      };
    });

    const totalDays = project.estimatedEndDate && project.startDate 
      ? Math.ceil((project.estimatedEndDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const dailyBudgetTarget = Number(project.totalBudget) && totalDays 
      ? Number(project.totalBudget) / totalDays 
      : 0;

    return {
      burnRate,
      project: {
        budget: Number(project.totalBudget),
        dailyBudgetTarget: Math.round(dailyBudgetTarget * 100) / 100,
        totalDays,
      },
    };
  }

  // Get milestone timeline
  static async getMilestoneTimeline(projectId: string) {
    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        status: true,
        plannedStart: true,
        plannedEnd: true,
        actualStart: true,
        actualEnd: true,
        progressPercentage: true,
      },
      orderBy: { plannedStart: 'asc' },
    });

    const timeline = milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.name,
      status: milestone.status,
      startDate: milestone.plannedStart,
      endDate: milestone.plannedEnd,
      actualStart: milestone.actualStart,
      actualEnd: milestone.actualEnd,
      progress: milestone.progressPercentage || 0,
      isDelayed: milestone.plannedEnd && milestone.status !== 'COMPLETED' 
        ? new Date() > milestone.plannedEnd 
        : false,
    }));

    return timeline;
  }

  // Get organization-wide analytics
  static async getOrganizationAnalytics(organizationId: string) {
    const projects = await prisma.project.findMany({
      where: { organizationId },
      include: {
        milestones: true,
        transactions: true,
        members: true,
      },
    });

    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const onHoldProjects = projects.filter(p => p.status === 'ON_HOLD').length;

    // Calculate overall financial metrics
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.totalBudget), 0);
    const totalExpenses = projects.reduce((sum, p) => 
      sum + p.transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((s, t) => s + Number(t.amount), 0), 0
    );

    // Project type distribution
    const projectTypes: { [key: string]: number } = {};
    projects.forEach(p => {
      projectTypes[p.type] = (projectTypes[p.type] || 0) + 1;
    });

    return {
      overview: {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        onHoldProjects,
      },
      financial: {
        totalBudget,
        totalExpenses,
        budgetUtilization: totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0,
      },
      projectTypes: Object.entries(projectTypes).map(([type, count]) => ({ type, count })),
      recentActivity: projects
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          lastUpdate: p.updatedAt,
        })),
    };
  }
}