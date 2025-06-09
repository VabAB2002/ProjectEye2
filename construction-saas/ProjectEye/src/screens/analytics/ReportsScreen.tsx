import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Card, Button } from '@rneui/themed';
import { useAnalyticsStore } from '../../store/analytics.store';
import { PDFService } from '../../utils/pdfService';
import { theme } from '../../theme';

interface ReportsScreenProps {
  route: {
    params: {
      projectId: string;
    };
  };
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ route }) => {
  const { projectId } = route.params;
  const [generating, setGenerating] = useState<string | null>(null);
  
  const {
    dashboardData,
    progressTrends,
    budgetBurnRate,
    milestoneTimeline,
    isLoading,
    error,
    fetchDashboardData,
    fetchProgressTrends,
    fetchBudgetBurnRate,
    fetchMilestoneTimeline,
  } = useAnalyticsStore();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    await Promise.all([
      fetchDashboardData(projectId),
      fetchProgressTrends(projectId),
      fetchBudgetBurnRate(projectId),
      fetchMilestoneTimeline(projectId),
    ]);
  };

  const generateReport = async (reportType: string) => {
    if (!dashboardData) {
      Alert.alert('Error', 'Dashboard data not available. Please refresh and try again.');
      return;
    }

    setGenerating(reportType);
    
    try {
      await PDFService.generateProjectReport(
        dashboardData,
        reportType as 'overview' | 'financial' | 'progress' | 'executive'
      );
      
      Alert.alert(
        'Report Generated',
        `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been generated and shared successfully.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate report. Please try again.');
    } finally {
      setGenerating(null);
    }
  };

  const renderReportCard = (
    title: string,
    description: string,
    reportType: string,
    icon: string
  ) => (
    <Card containerStyle={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportIconContainer}>
          <Text style={styles.reportIcon}>{icon}</Text>
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{title}</Text>
          <Text style={styles.reportDescription}>{description}</Text>
        </View>
      </View>
      
      <Button
        title={generating === reportType ? 'Generating...' : 'Generate PDF'}
        onPress={() => generateReport(reportType)}
        disabled={generating !== null}
        loading={generating === reportType}
        buttonStyle={styles.generateButton}
        titleStyle={styles.generateButtonText}
      />
    </Card>
  );

  const renderSummaryStats = () => {
    if (!dashboardData) return null;

    return (
      <Card containerStyle={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Project Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Budget Utilization</Text>
            <Text style={styles.summaryValue}>
              {dashboardData.metrics.budgetUtilization}%
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Milestones Progress</Text>
            <Text style={styles.summaryValue}>
              {dashboardData.metrics.completedMilestones}/{dashboardData.metrics.totalMilestones}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>
              ₹{dashboardData.metrics.totalSpent.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Team Size</Text>
            <Text style={styles.summaryValue}>
              {dashboardData.metrics.teamMembers}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading report data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Retry"
          onPress={loadData}
          buttonStyle={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Project Reports</Text>
        <Text style={styles.headerSubtitle}>
          Generate detailed reports for project analysis
        </Text>
      </View>

      {renderSummaryStats()}

      <View style={styles.reportsSection}>
        {renderReportCard(
          'Project Overview Report',
          'Comprehensive project status, budget utilization, and milestone progress',
          'overview',
          '📊'
        )}

        {renderReportCard(
          'Financial Report',
          'Detailed budget analysis, expense breakdown, and burn rate trends',
          'financial',
          '💰'
        )}

        {renderReportCard(
          'Progress Report',
          'Timeline analysis, milestone tracking, and team productivity metrics',
          'progress',
          '📈'
        )}

        {renderReportCard(
          'Executive Summary',
          'High-level overview for stakeholders and project sponsors',
          'executive',
          '📋'
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  summaryCard: {
    margin: 10,
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  reportsSection: {
    padding: 10,
  },
  reportCard: {
    marginBottom: 15,
    borderRadius: 10,
  },
  reportHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  reportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  reportIcon: {
    fontSize: 24,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    lineHeight: 20,
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});