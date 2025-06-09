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
    
    return (
      <View style={[styles.statusCard, { borderLeftColor: color }]}>
        <View style={styles.statusCardHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <View style={styles.statusCardTitles}>
            <Text style={styles.statusCardTitle}>{title}</Text>
          </View>
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
        onPress={() => navigation.navigate('SimpleReports', { projectId })}
      >
        <Ionicons name="document-text" size={24} color="#3B82F6" />
        <Text style={styles.actionButtonText}>Detailed Report</Text>
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
});