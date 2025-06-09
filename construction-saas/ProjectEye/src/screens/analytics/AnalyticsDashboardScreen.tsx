import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Card } from '@rneui/themed';
import { useAnalyticsStore } from '../../store/analytics.store';
import { theme } from '../../theme';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsDashboardScreenProps {
  route: {
    params: {
      projectId: string;
    };
  };
}

export const AnalyticsDashboardScreen: React.FC<AnalyticsDashboardScreenProps> = ({
  route,
}) => {
  const { projectId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  
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
    loadAnalyticsData();
  }, [projectId]);

  const loadAnalyticsData = async () => {
    await Promise.all([
      fetchDashboardData(projectId),
      fetchProgressTrends(projectId),
      fetchBudgetBurnRate(projectId),
      fetchMilestoneTimeline(projectId),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(51, 102, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  const renderMetricCard = (title: string, value: string | number, subtitle?: string, color?: string) => (
    <Card containerStyle={[styles.metricCard, color && { borderLeftColor: color }]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, color && { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </Card>
  );

  const renderProgressChart = () => {
    if (!progressTrends || progressTrends.length === 0) return null;

    const data = {
      labels: progressTrends.slice(-7).map(trend => {
        const date = new Date(trend.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: progressTrends.slice(-7).map(trend => trend.workerCount),
          color: (opacity = 1) => `rgba(51, 102, 255, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <Card containerStyle={styles.chartCard}>
        <Text style={styles.chartTitle}>Worker Count Trend (Last 7 Days)</Text>
        <LineChart
          data={data}
          width={screenWidth - 60}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>
    );
  };

  const renderBudgetChart = () => {
    if (!budgetBurnRate || budgetBurnRate.burnRate.length === 0) return null;

    const data = {
      labels: budgetBurnRate.burnRate.slice(-6).map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: budgetBurnRate.burnRate.slice(-6).map(item => item.cumulativeSpent),
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <Card containerStyle={styles.chartCard}>
        <Text style={styles.chartTitle}>Budget Burn Rate</Text>
        <LineChart
          data={data}
          width={screenWidth - 60}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          }}
          style={styles.chart}
        />
      </Card>
    );
  };

  const renderMilestoneChart = () => {
    if (!milestoneTimeline || milestoneTimeline.length === 0) return null;

    const completedCount = milestoneTimeline.filter(m => m.status === 'COMPLETED').length;
    const inProgressCount = milestoneTimeline.filter(m => m.status === 'IN_PROGRESS').length;
    const pendingCount = milestoneTimeline.filter(m => m.status === 'PENDING').length;

    const data = [
      {
        name: 'Completed',
        count: completedCount,
        color: '#4CAF50',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'In Progress',
        count: inProgressCount,
        color: '#FF9800',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'Pending',
        count: pendingCount,
        color: '#F44336',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
    ];

    return (
      <Card containerStyle={styles.chartCard}>
        <Text style={styles.chartTitle}>Milestone Status Distribution</Text>
        <PieChart
          data={data}
          width={screenWidth - 60}
          height={200}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 10]}
          absolute
        />
      </Card>
    );
  };

  if (isLoading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {dashboardData && (
        <>
          <View style={styles.header}>
            <Text style={styles.projectName}>{dashboardData.project.name}</Text>
            <Text style={styles.projectStatus}>Status: {dashboardData.project.status}</Text>
          </View>

          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Budget Utilization',
              `${dashboardData.metrics.budgetUtilization}%`,
              `₹${dashboardData.metrics.totalSpent.toLocaleString()} spent`,
              dashboardData.metrics.budgetUtilization > 80 ? '#F44336' : '#4CAF50'
            )}
            
            {renderMetricCard(
              'Milestones',
              `${dashboardData.metrics.completedMilestones}/${dashboardData.metrics.totalMilestones}`,
              'Completed',
              '#FF9800'
            )}
            
            {renderMetricCard(
              'Team Members',
              dashboardData.metrics.teamMembers,
              'Active members',
              '#2196F3'
            )}
            
            {renderMetricCard(
              'Progress Updates',
              dashboardData.metrics.progressUpdates,
              'Total updates',
              '#9C27B0'
            )}
          </View>

          {renderProgressChart()}
          {renderBudgetChart()}
          {renderMilestoneChart()}
        </>
      )}
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
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  projectStatus: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  metricCard: {
    width: '48%',
    margin: '1%',
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  chartCard: {
    margin: 10,
    borderRadius: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});