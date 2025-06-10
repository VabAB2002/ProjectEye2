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
import { Picker } from '@react-native-picker/picker';
import { theme } from '../../theme';
import { useProjectStore } from '../../store/project.store';
import { analyticsApi } from '../../api/endpoints/analytics.api';

interface ProjectAnalytics {
  project: {
    name: string;
    type: string;
    status: string;
    startDate: string;
    estimatedEndDate: string;
    daysRemaining: number;
    isDelayed: boolean;
  };
  progress: {
    overall: number;
    milestones: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
      delayed: number;
    };
    updates: number;
  };
  financial: {
    budget: number;
    expenses: number;
    payments: number;
    advances: number;
    remaining: number;
    utilized: number;
  };
  team: {
    totalMembers: number;
  };
}

type AnalyticsTab = 'overview' | 'financial' | 'milestones' | 'team';

export const ComprehensiveAnalyticsScreen: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (selectedProjectId) {
      loadAnalytics();
    }
  }, [selectedProjectId]);

  const loadAnalytics = async () => {
    if (!selectedProjectId) return;

    try {
      setIsLoading(true);
      const response = await analyticsApi.getProjectOverview(selectedProjectId);
      setAnalytics(response);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.colors.success;
      case 'COMPLETED':
        return theme.colors.accent;
      case 'ON_HOLD':
        return '#FFA500';
      default:
        return theme.colors.gray500;
    }
  };

  const renderTab = (tab: AnalyticsTab, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={activeTab === tab ? theme.colors.accent : theme.colors.gray500}
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderMetricCard = (title: string, value: string | number, icon: string, color: string, subtitle?: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricTitle}>{title}</Text>
          {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const renderOverviewTab = () => {
    if (!analytics) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Project Info */}
        <View style={styles.projectInfoCard}>
          <View style={styles.projectHeader}>
            <Text style={styles.projectName}>{analytics.project.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(analytics.project.status)}15` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(analytics.project.status) }]}>
                {analytics.project.status}
              </Text>
            </View>
          </View>
          <Text style={styles.projectType}>{analytics.project.type}</Text>
          <View style={styles.projectDates}>
            <Text style={styles.dateText}>
              Start: {new Date(analytics.project.startDate).toLocaleDateString()}
            </Text>
            <Text style={styles.dateText}>
              End: {new Date(analytics.project.estimatedEndDate).toLocaleDateString()}
            </Text>
          </View>
          {analytics.project.isDelayed && (
            <View style={styles.delayWarning}>
              <Ionicons name="warning-outline" size={16} color="#EF4444" />
              <Text style={styles.delayText}>Project is delayed</Text>
            </View>
          )}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Overall Progress',
            `${analytics.progress.overall}%`,
            'trending-up-outline',
            theme.colors.success
          )}
          {renderMetricCard(
            'Budget Utilized',
            `${analytics.financial.utilized}%`,
            'wallet-outline',
            analytics.financial.utilized > 80 ? '#EF4444' : theme.colors.warning
          )}
          {renderMetricCard(
            'Team Members',
            analytics.team.totalMembers,
            'people-outline',
            theme.colors.accent
          )}
          {renderMetricCard(
            'Days Remaining',
            analytics.project.daysRemaining,
            'time-outline',
            analytics.project.daysRemaining < 30 ? '#EF4444' : theme.colors.success
          )}
        </View>

        {/* Progress Overview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Progress Overview</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{analytics.progress.milestones.completed}</Text>
              <Text style={styles.progressLabel}>Completed</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{analytics.progress.milestones.inProgress}</Text>
              <Text style={styles.progressLabel}>In Progress</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{analytics.progress.milestones.pending}</Text>
              <Text style={styles.progressLabel}>Pending</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={[styles.progressNumber, { color: '#EF4444' }]}>{analytics.progress.milestones.delayed}</Text>
              <Text style={styles.progressLabel}>Delayed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderFinancialTab = () => {
    if (!analytics) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Total Budget</Text>
            <Text style={styles.financialValue}>{formatCurrency(analytics.financial.budget)}</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Total Expenses</Text>
            <Text style={[styles.financialValue, { color: '#EF4444' }]}>
              {formatCurrency(analytics.financial.expenses)}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Payments Made</Text>
            <Text style={[styles.financialValue, { color: theme.colors.accent }]}>
              {formatCurrency(analytics.financial.payments)}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Advances Given</Text>
            <Text style={[styles.financialValue, { color: '#F59E0B' }]}>
              {formatCurrency(analytics.financial.advances)}
            </Text>
          </View>
          <View style={[styles.financialItem, styles.financialTotal]}>
            <Text style={[styles.financialLabel, { fontWeight: '600' }]}>Remaining Budget</Text>
            <Text style={[styles.financialValue, { 
              color: analytics.financial.remaining > 0 ? theme.colors.success : '#EF4444',
              fontWeight: '700' 
            }]}>
              {formatCurrency(analytics.financial.remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.utilizationCard}>
          <Text style={styles.sectionTitle}>Budget Utilization</Text>
          <View style={styles.utilizationBar}>
            <View 
              style={[
                styles.utilizationFill, 
                { 
                  width: `${Math.min(analytics.financial.utilized, 100)}%`,
                  backgroundColor: analytics.financial.utilized > 80 ? '#EF4444' : theme.colors.success
                }
              ]} 
            />
          </View>
          <Text style={styles.utilizationText}>{analytics.financial.utilized}% of budget utilized</Text>
        </View>
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'financial':
        return renderFinancialTab();
      case 'milestones':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Milestone Analytics Coming Soon</Text>
          </View>
        );
      case 'team':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Team Analytics Coming Soon</Text>
          </View>
        );
      default:
        return renderOverviewTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Project insights and performance metrics</Text>
      </View>

      {/* Project Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Select Project:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedProjectId}
            onValueChange={setSelectedProjectId}
            style={styles.picker}
          >
            {projects.map((project) => (
              <Picker.Item key={project.id} label={project.name} value={project.id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTab('overview', 'Overview', 'analytics-outline')}
        {renderTab('financial', 'Financial', 'wallet-outline')}
        {renderTab('milestones', 'Milestones', 'flag-outline')}
        {renderTab('team', 'Team', 'people-outline')}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  selectorContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pickerWrapper: {
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  picker: {
    height: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: theme.spacing.xs,
  },
  activeTab: {
    borderBottomColor: theme.colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray500,
  },
  activeTabText: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: theme.spacing.lg,
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
  comingSoonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
  projectInfoCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '700',
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
  projectType: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  projectDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  delayWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  delayText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  metricTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  metricSubtitle: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  sectionCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  financialTotal: {
    borderBottomWidth: 0,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 2,
    borderTopColor: theme.colors.border,
  },
  financialLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  utilizationCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  utilizationBar: {
    height: 8,
    backgroundColor: theme.colors.gray200,
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 4,
  },
  utilizationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});