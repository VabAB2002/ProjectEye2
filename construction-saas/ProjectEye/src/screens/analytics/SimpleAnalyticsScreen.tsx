import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAnalyticsStore } from '../../store/analytics.store';

// Better PDF Generation - Install: expo install expo-print expo-sharing
// Conditional imports to handle missing dependencies gracefully
let Print: any = null;
let Sharing: any = null;

try {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
} catch (error) {
  console.warn('expo-print or expo-sharing not installed. PDF generation will show installation prompt.');
}

interface SimpleAnalyticsScreenProps {
  route: {
    params: {
      projectId: string;
    };
  };
  navigation: any;
}

export const SimpleAnalyticsScreen: React.FC<SimpleAnalyticsScreenProps> = ({
  route,
  navigation,
}) => {
  const { projectId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    dashboardData,
    fetchDashboardData,
    isLoading,
  } = useAnalyticsStore();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    await fetchDashboardData(projectId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Add trending indicators to your health cards
  const renderTrendingIndicator = (currentValue: number, previousValue: number) => {
    const trend = currentValue - previousValue;
    const isUp = trend > 0;
    
    return (
      <View style={styles.trendContainer}>
        <Ionicons 
          name={isUp ? "trending-up" : "trending-down"} 
          size={16} 
          color={isUp ? "#10B981" : "#EF4444"} 
        />
        <Text style={[styles.trendText, { color: isUp ? "#10B981" : "#EF4444" }]}>
          {Math.abs(trend).toFixed(1)}%
        </Text>
      </View>
    );
  };

  // Smart Alerts System - Add to your analytics store
  const getProjectAlerts = (dashboardData: any) => {
    const alerts = [];
    
    if (dashboardData.metrics.budgetUtilization > 85) {
      alerts.push({
        type: 'warning',
        title: 'Budget Alert',
        message: 'Budget usage is above 85%',
        action: 'Review expenses'
      });
    }
    
    // Calculate days remaining (simulated for demo - in real app this would come from project end date)
    const daysRemaining = Math.max(0, 120 - Math.floor(dashboardData.metrics.budgetUtilization * 1.5)); // Simplified calculation
    
    if (daysRemaining < 30 && dashboardData.metrics.completedMilestones < dashboardData.metrics.totalMilestones * 0.8) {
      alerts.push({
        type: 'critical',
        title: 'Timeline Risk',
        message: 'Project may miss deadline',
        action: 'Accelerate progress'
      });
    }

    // Additional smart alerts
    if (dashboardData.metrics.progressUpdates === 0) {
      alerts.push({
        type: 'info',
        title: 'No Recent Updates',
        message: 'No progress updates this month',
        action: 'Request team updates'
      });
    }

    if (dashboardData.metrics.budgetUtilization < 20 && dashboardData.metrics.completedMilestones > dashboardData.metrics.totalMilestones * 0.5) {
      alerts.push({
        type: 'success',
        title: 'Great Progress',
        message: 'Project ahead of schedule and under budget',
        action: 'Maintain current pace'
      });
    }
    
    return alerts;
  };

  const renderAlertsSection = () => {
    if (!dashboardData) return null;
    
    const alerts = getProjectAlerts(dashboardData);
    
    if (alerts.length === 0) {
      return (
        <View style={styles.alertsContainer}>
          <View style={styles.alertsHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.alertsTitle}>All Good!</Text>
          </View>
          <Text style={styles.noAlertsText}>No alerts for this project</Text>
        </View>
      );
    }

    return (
      <View style={styles.alertsContainer}>
        <View style={styles.alertsHeader}>
          <Ionicons name="notifications" size={20} color="#6B7280" />
          <Text style={styles.alertsTitle}>Smart Alerts ({alerts.length})</Text>
        </View>
        
        {alerts.map((alert, index) => (
          <View 
            key={index} 
            style={[
              styles.alertCard, 
              { borderLeftColor: getAlertColor(alert.type) }
            ]}
          >
            <View style={styles.alertHeader}>
              <View style={[
                styles.alertIcon,
                { backgroundColor: `${getAlertColor(alert.type)}15` }
              ]}>
                <Ionicons 
                  name={getAlertIcon(alert.type)} 
                  size={16} 
                  color={getAlertColor(alert.type)} 
                />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: getAlertColor(alert.type) }]}>
                  {alert.title}
                </Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertAction}>💡 {alert.action}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      case 'success': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getAlertIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'critical': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      case 'success': return 'checkmark-circle';
      default: return 'notifications';
    }
  };

  // Simulate previous data for trending calculations (in real implementation, this would come from historical data)
  const getPreviousData = (type: 'budget' | 'timeline' | 'health') => {
    if (!dashboardData) return { previous: 0, current: 0 };
    
    const currentBudgetPercentage = dashboardData.metrics.budgetUtilization;
    const currentWorkPercentage = Math.round((dashboardData.metrics.completedMilestones / dashboardData.metrics.totalMilestones) * 100);
    const currentTeamPercentage = dashboardData.metrics.progressUpdates > 0 ? 100 : 0;
    
    // Simulate previous week's data with some realistic variations
    switch (type) {
      case 'budget':
        return { 
          current: currentBudgetPercentage, 
          previous: Math.max(0, currentBudgetPercentage - Math.random() * 5 + 2) // Simulate 2-7% increase from last week
        };
      case 'timeline':
        return { 
          current: currentWorkPercentage, 
          previous: Math.max(0, currentWorkPercentage - Math.random() * 8 + 3) // Simulate 3-11% progress from last week
        };
      case 'health':
        return { 
          current: currentTeamPercentage, 
          previous: Math.max(0, currentTeamPercentage - Math.random() * 10 + 5) // Simulate team activity changes
        };
      default:
        return { current: 0, previous: 0 };
    }
  };

  // Calculate project health score (0-100)
  const getProjectHealthScore = () => {
    if (!dashboardData) return 0;
    
    const budgetScore = Math.max(0, 100 - dashboardData.metrics.budgetUtilization);
    const milestoneScore = dashboardData.metrics.totalMilestones > 0 
      ? (dashboardData.metrics.completedMilestones / dashboardData.metrics.totalMilestones) * 100 
      : 100;
    const progressScore = dashboardData.metrics.progressUpdates > 0 ? 100 : 50;
    
    return Math.round((budgetScore * 0.4 + milestoneScore * 0.4 + progressScore * 0.2));
  };

  const getStatusColor = (value: number, type: 'health' | 'budget' | 'timeline') => {
    if (type === 'health') {
      if (value >= 80) return '#10B981'; // Green
      if (value >= 60) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    }
    if (type === 'budget') {
      if (value <= 70) return '#10B981'; // Green
      if (value <= 85) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    }
    if (type === 'timeline') {
      if (value >= 80) return '#10B981'; // Green
      if (value >= 60) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    }
    return '#6B7280';
  };

  const renderMainCard = () => {
    if (!dashboardData) return null;
    
    const healthScore = getProjectHealthScore();
    const healthColor = getStatusColor(healthScore, 'health');
    
    return (
      <View style={[styles.mainCard, { borderLeftColor: healthColor }]}>
        <View style={styles.mainCardHeader}>
          <Text style={styles.projectName}>{dashboardData.project.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: healthColor }]}>
            <Text style={styles.statusText}>{dashboardData.project.status}</Text>
          </View>
        </View>
        
        <View style={styles.healthScoreContainer}>
          <View style={styles.healthScoreCircle}>
            <Text style={[styles.healthScoreText, { color: healthColor }]}>{healthScore}</Text>
            <Text style={styles.healthScoreLabel}>Health Score</Text>
          </View>
          
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>₹{(dashboardData.metrics.totalSpent / 100000).toFixed(1)}L</Text>
              <Text style={styles.quickStatLabel}>Spent</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{Math.round((dashboardData.metrics.completedMilestones / dashboardData.metrics.totalMilestones) * 100)}%</Text>
              <Text style={styles.quickStatLabel}>Complete</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStatusCard = (
    title: string,
    value: string,
    subtitle: string,
    percentage: number,
    type: 'budget' | 'timeline' | 'health',
    icon: keyof typeof Ionicons.glyphMap
  ) => {
    const color = getStatusColor(percentage, type);
    const trendData = getPreviousData(type);
    
    return (
      <View style={[styles.statusCard, { borderLeftColor: color }]}>
        <View style={styles.statusCardHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <View style={styles.statusCardTitles}>
            <Text style={styles.statusCardTitle}>{title}</Text>
          </View>
          {renderTrendingIndicator(trendData.current, trendData.previous)}
        </View>
        
        <Text style={[styles.statusCardValue, { color }]}>{value}</Text>
        <Text style={styles.statusCardSubtitle}>{subtitle}</Text>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }
              ]} 
            />
          </View>
          <Text style={[styles.progressBarText, { color }]}>{percentage}%</Text>
        </View>
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => generateWhatsAppReport()}
      >
        <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
        <Text style={styles.actionButtonText}>WhatsApp Report</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => {
          if (dashboardData) {
            generatePDFReport(dashboardData);
          }
        }}
      >
        <Ionicons name="document" size={24} color="#EF4444" />
        <Text style={styles.actionButtonText}>PDF Report</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('SimpleReports', { projectId })}
      >
        <Ionicons name="analytics" size={24} color="#3B82F6" />
        <Text style={styles.actionButtonText}>Detailed View</Text>
      </TouchableOpacity>
    </View>
  );

  const generateWhatsAppReport = async () => {
    if (!dashboardData) return;
    
    const healthScore = getProjectHealthScore();
    const budgetUsed = dashboardData.metrics.budgetUtilization;
    const workComplete = Math.round((dashboardData.metrics.completedMilestones / dashboardData.metrics.totalMilestones) * 100);
    
    const report = `🏗️ *${dashboardData.project.name}*

📊 *Project Health: ${healthScore}/100*
${healthScore >= 80 ? '🟢' : healthScore >= 60 ? '🟡' : '🔴'} ${healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}

💰 *Budget Status:*
• Spent: ₹${(dashboardData.metrics.totalSpent / 100000).toFixed(1)} Lakhs
• Used: ${budgetUsed}% of total budget
${budgetUsed <= 70 ? '🟢' : budgetUsed <= 85 ? '🟡' : '🔴'} ${budgetUsed <= 70 ? 'On Track' : budgetUsed <= 85 ? 'Monitor' : 'Over Budget'}

🎯 *Work Progress:*
• Completed: ${workComplete}%
• Milestones: ${dashboardData.metrics.completedMilestones}/${dashboardData.metrics.totalMilestones}
${workComplete >= 80 ? '🟢' : workComplete >= 60 ? '🟡' : '🔴'} ${workComplete >= 80 ? 'On Time' : workComplete >= 60 ? 'Slight Delay' : 'Delayed'}

👥 *Team: ${dashboardData.metrics.teamMembers} members*
📱 *Generated by ProjectEye*`;

    try {
      await Clipboard.setStringAsync(report);
      Alert.alert(
        'WhatsApp Report Ready! 📱',
        'Report copied to clipboard. Open WhatsApp and paste to share.',
        [
          { text: 'OK' },
          { 
            text: 'Open WhatsApp', 
            onPress: () => {
              Alert.alert('Tip', 'Open WhatsApp, go to your group, and paste the report!');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to copy report to clipboard');
    }
  };

  // Better PDF Generation - Install: expo install expo-print expo-sharing
  const generateHTMLReport = (dashboardData: any) => {
    const healthScore = Math.round(
      (Math.max(0, 100 - dashboardData.metrics.budgetUtilization) * 0.4) +
      ((dashboardData.metrics.completedMilestones / dashboardData.metrics.totalMilestones) * 100 * 0.4) +
      ((dashboardData.metrics.progressUpdates > 0 ? 100 : 50) * 0.2)
    );
    
    const workComplete = Math.round((dashboardData.metrics.completedMilestones / dashboardData.metrics.totalMilestones) * 100);
    const today = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Project Report - ${dashboardData.project.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
          }
          .project-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .report-date {
            font-size: 16px;
            opacity: 0.9;
          }
          .health-score {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .score-circle {
            display: inline-block;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: ${healthScore >= 80 ? '#10B981' : healthScore >= 60 ? '#F59E0B' : '#EF4444'};
            color: white;
            line-height: 120px;
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            border-left: 5px solid #667eea;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .metric-title {
            font-size: 14px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .metric-subtitle {
            font-size: 14px;
            color: #888;
          }
          .progress-bar {
            width: 100%;
            height: 8px;
            background-color: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 10px;
          }
          .progress-fill {
            height: 100%;
            background-color: #667eea;
            transition: width 0.3s ease;
          }
          .alerts-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .alert-item {
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid;
          }
          .alert-warning { border-left-color: #F59E0B; background-color: #FEF3C7; }
          .alert-critical { border-left-color: #EF4444; background-color: #FEE2E2; }
          .alert-info { border-left-color: #3B82F6; background-color: #DBEAFE; }
          .alert-success { border-left-color: #10B981; background-color: #D1FAE5; }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
          }
          @media print {
            body { background-color: white; }
            .header { background: #667eea !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="project-title">${dashboardData.project.name}</div>
          <div class="report-date">Project Report - ${today}</div>
        </div>

        <div class="health-score">
          <div class="score-circle">${healthScore}</div>
          <h3>Overall Project Health Score</h3>
          <p>${healthScore >= 80 ? 'Excellent Performance' : healthScore >= 60 ? 'Good Progress' : 'Needs Attention'}</p>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">Budget Status</div>
            <div class="metric-value">₹${(dashboardData.metrics.totalSpent / 100000).toFixed(1)}L</div>
            <div class="metric-subtitle">Used (${dashboardData.metrics.budgetUtilization}% of budget)</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${dashboardData.metrics.budgetUtilization}%"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-title">Work Progress</div>
            <div class="metric-value">${workComplete}%</div>
            <div class="metric-subtitle">${dashboardData.metrics.completedMilestones} of ${dashboardData.metrics.totalMilestones} milestones completed</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${workComplete}%"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-title">Team Activity</div>
            <div class="metric-value">${dashboardData.metrics.teamMembers}</div>
            <div class="metric-subtitle">Active members, ${dashboardData.metrics.progressUpdates} updates this month</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${dashboardData.metrics.progressUpdates > 0 ? 100 : 0}%"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-title">Budget Remaining</div>
            <div class="metric-value">₹${((dashboardData.project.budget - dashboardData.metrics.totalSpent) / 100000).toFixed(1)}L</div>
            <div class="metric-subtitle">Available for remaining work</div>
          </div>
        </div>

        <div class="alerts-section">
          <h3>🔔 Smart Alerts & Recommendations</h3>
          ${(() => {
            const alerts = [];
            
            if (dashboardData.metrics.budgetUtilization > 85) {
              alerts.push(`
                <div class="alert-item alert-warning">
                  <strong>⚠️ Budget Alert:</strong> Budget usage is above 85%. Review expenses and optimize spending.
                </div>
              `);
            }
            
            const daysRemaining = Math.max(0, 120 - Math.floor(dashboardData.metrics.budgetUtilization * 1.5));
            if (daysRemaining < 30 && dashboardData.metrics.completedMilestones < dashboardData.metrics.totalMilestones * 0.8) {
              alerts.push(`
                <div class="alert-item alert-critical">
                  <strong>🚨 Timeline Risk:</strong> Project may miss deadline. Accelerate progress and consider additional resources.
                </div>
              `);
            }
            
            if (dashboardData.metrics.progressUpdates === 0) {
              alerts.push(`
                <div class="alert-item alert-info">
                  <strong>ℹ️ No Recent Updates:</strong> No progress updates this month. Request team updates to maintain transparency.
                </div>
              `);
            }
            
            if (dashboardData.metrics.budgetUtilization < 20 && dashboardData.metrics.completedMilestones > dashboardData.metrics.totalMilestones * 0.5) {
              alerts.push(`
                <div class="alert-item alert-success">
                  <strong>✅ Great Progress:</strong> Project ahead of schedule and under budget. Maintain current pace.
                </div>
              `);
            }
            
            return alerts.length > 0 ? alerts.join('') : '<p>✅ No alerts - Project is running smoothly!</p>';
          })()}
        </div>

        <div class="footer">
          <p>Generated by ProjectEye Analytics | ${today}</p>
          <p>This report provides a comprehensive overview of your project's current status and performance metrics.</p>
        </div>
      </body>
      </html>
    `;
  };

  const generatePDFReport = async (dashboardData: any) => {
    // Check if required packages are installed
    if (!Print || !Sharing) {
      Alert.alert(
        'Missing Dependencies',
        'PDF generation requires expo-print and expo-sharing packages.\n\nPlease install them using:\nexpo install expo-print expo-sharing',
        [
          { text: 'OK' },
          {
            text: 'Copy Command',
            onPress: () => Clipboard.setStringAsync('expo install expo-print expo-sharing')
          }
        ]
      );
      return;
    }

    try {
      const html = generateHTMLReport(dashboardData);
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });
      
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Project Report'
      });
      
      Alert.alert('Success', 'PDF report generated and shared successfully!');
      return uri;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Failed to generate PDF report. Please try again.');
      throw error;
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Project Health...</Text>
      </View>
    );
  }

  if (!dashboardData) return null;

  const budgetPercentage = dashboardData.metrics.budgetUtilization;
  const workPercentage = Math.round((dashboardData.metrics.completedMilestones / dashboardData.metrics.totalMilestones) * 100);
  const teamPercentage = dashboardData.metrics.progressUpdates > 0 ? 100 : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderMainCard()}
      
      <View style={styles.statusCardsContainer}>
        {renderStatusCard(
          'Money Status',
          `₹${(dashboardData.metrics.totalSpent / 100000).toFixed(1)}L Used`,
          `of ₹${(dashboardData.project.budget / 100000).toFixed(1)}L budget`,
          budgetPercentage,
          'budget',
          'wallet'
        )}
        
        {renderStatusCard(
          'Work Progress',
          `${workPercentage}% Done`,
          `${dashboardData.metrics.completedMilestones} of ${dashboardData.metrics.totalMilestones} milestones`,
          workPercentage,
          'timeline',
          'construct'
        )}
        
        {renderStatusCard(
          'Team Activity',
          `${dashboardData.metrics.teamMembers} Members`,
          `${dashboardData.metrics.progressUpdates} updates this month`,
          teamPercentage,
          'health',
          'people'
        )}
      </View>
      
      {renderAlertsSection()}
      
      {renderActionButtons()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Main Card
  mainCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  projectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  healthScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScoreCircle: {
    alignItems: 'center',
    marginRight: 30,
  },
  healthScoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  healthScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 5,
  },
  quickStats: {
    flex: 1,
  },
  quickStat: {
    marginBottom: 15,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // Status Cards
  statusCardsContainer: {
    paddingHorizontal: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusCardTitles: {
    marginLeft: 12,
  },
  statusCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 12,
    minWidth: 40,
  },
  
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  alertsContainer: {
    padding: 16,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  noAlertsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    padding: 8,
    borderRadius: 8,
  },
  alertContent: {
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertAction: {
    fontSize: 14,
    color: '#3B82F6',
  },
});