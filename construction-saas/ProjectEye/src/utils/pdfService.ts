import { Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { DashboardData } from '../api/endpoints/analytics.api';

export class PDFService {
  static async generateProjectReport(
    dashboardData: DashboardData,
    reportType: 'overview' | 'financial' | 'progress' | 'executive'
  ): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Generate HTML content
      // 2. Convert to PDF using libraries like react-native-html-to-pdf
      // 3. Save to device storage
      // 4. Share the PDF file

      const htmlContent = this.generateHTMLReport(dashboardData, reportType);
      
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create HTML file in app's document directory
      const fileName = `${dashboardData.project.name.replace(/[^a-zA-Z0-9]/g, '_')}-${reportType}-report.html`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Write HTML content to file
      await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: `${dashboardData.project.name} - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        });
      } else {
        Alert.alert(
          'Report Generated',
          `Report has been saved to: ${fileUri}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw new Error('Failed to generate and share report');
    }
  }

  private static generateHTMLReport(
    dashboardData: DashboardData,
    reportType: string
  ): string {
    const { project, metrics } = dashboardData;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${project.name} - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #007bff;
            font-size: 28px;
          }
          .header h2 {
            margin: 10px 0 0 0;
            color: #666;
            font-weight: normal;
            font-size: 18px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .metric-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #007bff;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 5px;
          }
          .metric-label {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin: 30px 0;
          }
          .section h3 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
          }
          .project-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
          }
          .info-label {
            font-weight: bold;
            color: #666;
          }
          .info-value {
            color: #333;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            background-color: #28a745;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${project.name}</h1>
            <h2>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h2>
            <p>Generated on ${new Date().toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>

          <div class="section">
            <h3>Project Overview</h3>
            <div class="project-info">
              <div class="info-row">
                <span class="info-label">Project Status:</span>
                <span class="info-value">
                  <span class="status-badge">${project.status}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Start Date:</span>
                <span class="info-value">${new Date(project.startDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Expected End Date:</span>
                <span class="info-value">${new Date(project.estimatedEndDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Key Metrics</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">₹${metrics.totalSpent.toLocaleString('en-IN')}</div>
                <div class="metric-label">Total Spent</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${metrics.budgetUtilization}%</div>
                <div class="metric-label">Budget Utilization</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${metrics.completedMilestones}/${metrics.totalMilestones}</div>
                <div class="metric-label">Milestones Completed</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${metrics.teamMembers}</div>
                <div class="metric-label">Team Members</div>
              </div>
            </div>
          </div>

          ${this.getReportTypeContent(reportType, dashboardData)}

          <div class="footer">
            <p>This report was generated by ProjectEye Construction Management System</p>
            <p>For more detailed analytics, visit the ProjectEye dashboard</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static getReportTypeContent(reportType: string, dashboardData: DashboardData): string {
    const { metrics } = dashboardData;

    switch (reportType) {
      case 'financial':
        return `
          <div class="section">
            <h3>Financial Analysis</h3>
            <div class="project-info">
              <div class="info-row">
                <span class="info-label">Budget Utilization:</span>
                <span class="info-value">${metrics.budgetUtilization}%</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Expenses:</span>
                <span class="info-value">₹${metrics.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Pending Approvals:</span>
                <span class="info-value">${metrics.pendingApprovals} transactions</span>
              </div>
            </div>
          </div>
        `;
      
      case 'progress':
        return `
          <div class="section">
            <h3>Progress Analysis</h3>
            <div class="project-info">
              <div class="info-row">
                <span class="info-label">Completed Milestones:</span>
                <span class="info-value">${metrics.completedMilestones} of ${metrics.totalMilestones}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Progress Updates:</span>
                <span class="info-value">${metrics.progressUpdates} total updates</span>
              </div>
              <div class="info-row">
                <span class="info-label">Completion Rate:</span>
                <span class="info-value">${Math.round((metrics.completedMilestones / metrics.totalMilestones) * 100)}%</span>
              </div>
            </div>
          </div>
        `;
      
      case 'executive':
        return `
          <div class="section">
            <h3>Executive Summary</h3>
            <div class="project-info">
              <p><strong>Project Performance:</strong> The project is currently ${dashboardData.project.status.toLowerCase()} with ${metrics.budgetUtilization}% budget utilization.</p>
              <p><strong>Milestone Progress:</strong> ${metrics.completedMilestones} out of ${metrics.totalMilestones} milestones have been completed.</p>
              <p><strong>Team Engagement:</strong> ${metrics.teamMembers} team members have contributed ${metrics.progressUpdates} progress updates.</p>
              <p><strong>Financial Health:</strong> ₹${metrics.totalSpent.toLocaleString('en-IN')} has been spent with ${metrics.pendingApprovals} transactions pending approval.</p>
            </div>
          </div>
        `;
      
      default:
        return `
          <div class="section">
            <h3>Project Summary</h3>
            <div class="project-info">
              <p>This comprehensive overview provides key insights into the project's current status, financial health, and progress tracking.</p>
            </div>
          </div>
        `;
    }
  }
}