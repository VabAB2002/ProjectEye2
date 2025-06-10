import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { theme } from '../../theme';
import { useProjectStore } from '../../store/project.store';
import { analyticsApi } from '../../api/endpoints/analytics.api';
import { ProfileButton } from '../../components/common/ProfileButton';
import { ProfileSettingsModal } from '../../components/common/ProfileSettingsModal';

interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  totalExpenses: number;
  budgetUtilization: number;
  projectTypes: { type: string; count: number }[];
  recentActivity: {
    id: string;
    name: string;
    status: string;
    lastUpdate: string;
  }[];
}

export const OwnerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { projects, fetchProjects } = useProjectStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load projects first
      await fetchProjects();
      
      // Load organization analytics
      const response = await analyticsApi.getOrganizationAnalytics();
      if (response) {
        setMetrics({
          totalProjects: response.overview.totalProjects,
          activeProjects: response.overview.activeProjects,
          completedProjects: response.overview.completedProjects,
          onHoldProjects: response.overview.onHoldProjects,
          totalBudget: response.financial.totalBudget,
          totalExpenses: response.financial.totalExpenses,
          budgetUtilization: response.financial.budgetUtilization,
          projectTypes: response.projectTypes,
          recentActivity: response.recentActivity,
        });
      }
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.colors.success;
      case 'COMPLETED':
        return theme.colors.accent;
      case 'ON_HOLD':
        return '#FFA500';
      case 'PLANNING':
        return theme.colors.warning;
      default:
        return theme.colors.gray500;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderMetricCard = (title: string, value: string | number, icon: string, color: string, subtitle?: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricTitle}>{title}</Text>
          {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const renderQuickAction = (title: string, icon: string, onPress: () => void, color: string = theme.colors.accent) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.gray400} />
    </TouchableOpacity>
  );

  const renderProjectTypeChart = () => {
    if (!metrics?.projectTypes?.length) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Project Types</Text>
        {metrics.projectTypes.map((type, index) => (
          <View key={type.type} style={styles.chartItem}>
            <View style={styles.chartItemHeader}>
              <View style={[styles.chartItemDot, { backgroundColor: theme.colors.accent }]} />
              <Text style={styles.chartItemLabel}>{type.type}</Text>
            </View>
            <Text style={styles.chartItemValue}>{type.count}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderRecentActivity = () => {
    if (!metrics?.recentActivity?.length) return null;

    return (
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {metrics.recentActivity.map((activity) => (
          <TouchableOpacity key={activity.id} style={styles.activityItem}>
            <View style={styles.activityContent}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{activity.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(activity.status)}15` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(activity.status) }]}>
                    {activity.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.activityTime}>
                Updated {new Date(activity.lastUpdate).toLocaleDateString()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.gray400} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading && !metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}</Text>
            <Text style={styles.headerTitle}>Project Dashboard</Text>
          </View>
          <ProfileButton onPress={() => setShowProfileModal(true)} />
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'Total Projects',
              metrics?.totalProjects || 0,
              'business-outline',
              theme.colors.accent
            )}
            {renderMetricCard(
              'Active Projects',
              metrics?.activeProjects || 0,
              'play-circle-outline',
              theme.colors.success
            )}
          </View>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'Completed',
              metrics?.completedProjects || 0,
              'checkmark-circle-outline',
              '#10B981'
            )}
            {renderMetricCard(
              'Budget Utilization',
              `${metrics?.budgetUtilization || 0}%`,
              'trending-up-outline',
              metrics && metrics.budgetUtilization > 80 ? '#EF4444' : theme.colors.warning
            )}
          </View>
        </View>

        {/* Financial Overview */}
        <View style={styles.financialContainer}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Total Budget</Text>
              <Text style={styles.financialValue}>{formatCurrency(metrics?.totalBudget || 0)}</Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Total Spent</Text>
              <Text style={[styles.financialValue, { color: theme.colors.error }]}>
                {formatCurrency(metrics?.totalExpenses || 0)}
              </Text>
            </View>
          </View>
          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Remaining</Text>
              <Text style={[styles.financialValue, { color: theme.colors.success }]}>
                {formatCurrency((metrics?.totalBudget || 0) - (metrics?.totalExpenses || 0))}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {renderQuickAction(
            'Create New Project',
            'add-circle-outline',
            () => navigation.navigate('Projects'),
            theme.colors.accent
          )}
          {renderQuickAction(
            'View Analytics',
            'analytics-outline',
            () => navigation.navigate('Analytics'),
            '#3B82F6'
          )}
          {renderQuickAction(
            'Team Management',
            'people-outline',
            () => navigation.navigate('Management'),
            theme.colors.success
          )}
          {renderQuickAction(
            'Financial Reports',
            'wallet-outline',
            () => navigation.navigate('Financial'),
            '#F59E0B'
          )}
        </View>

        {/* Project Types Chart */}
        {renderProjectTypeChart()}

        {/* Recent Activity */}
        {renderRecentActivity()}
      </ScrollView>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal 
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  welcomeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  metricsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  metricTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  metricSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  financialContainer: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  financialItem: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  quickActionsContainer: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  chartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  chartItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  chartItemLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  chartItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  activityContainer: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});