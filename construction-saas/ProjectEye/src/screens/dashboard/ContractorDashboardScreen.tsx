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
import { useProgressStore } from '../../store/progress.store';
import { useMilestoneStore } from '../../store/milestone.store';
import { useTeamStore } from '../../store/team.store';
import { ProfileButton } from '../../components/common/ProfileButton';
import { ProfileSettingsModal } from '../../components/common/ProfileSettingsModal';

interface ProjectStatus {
  id: string;
  name: string;
  status: string;
  progress: number;
  deadlineStatus: 'on-time' | 'approaching' | 'overdue';
  teamMembers: number;
  lastUpdate: string;
}

export const ContractorDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { projects, fetchProjects } = useProjectStore();
  const { updates: progressReports, fetchUpdates: fetchProgressReports } = useProgressStore();
  const { milestones, fetchMilestones } = useMilestoneStore();
  const { members: teamMembers, fetchMembers: fetchTeamMembers } = useTeamStore();
  
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);
  const [todayStats, setTodayStats] = useState({
    progressReports: 0,
    completedTasks: 0,
    pendingIssues: 0,
    activeWorkers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load projects first
      await fetchProjects();
      
      // Calculate project statuses from available projects
      const statuses: ProjectStatus[] = projects.map((project: any) => {
        // Basic calculations for dashboard overview
        const progress = 0; // Will be calculated when milestones are loaded
        
        // Calculate deadline status
        const endDate = new Date(project.estimatedEndDate);
        const now = new Date();
        const daysToDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let deadlineStatus: 'on-time' | 'approaching' | 'overdue' = 'on-time';
        if (daysToDeadline < 0) {
          deadlineStatus = 'overdue';
        } else if (daysToDeadline <= 7) {
          deadlineStatus = 'approaching';
        }

        return {
          id: project.id,
          name: project.name,
          status: project.status,
          progress,
          deadlineStatus,
          teamMembers: 0, // Will be updated when team data is loaded
          lastUpdate: project.updatedAt,
        };
      });

      setProjectStatuses(statuses);

      // Set basic stats for now
      setTodayStats({
        progressReports: 0,
        completedTasks: 0,
        pendingIssues: 0,
        activeWorkers: 0,
      });

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
      default:
        return theme.colors.gray500;
    }
  };

  const getDeadlineColor = (deadlineStatus: string) => {
    switch (deadlineStatus) {
      case 'overdue':
        return '#EF4444';
      case 'approaching':
        return '#F59E0B';
      default:
        return theme.colors.success;
    }
  };

  const renderMetricCard = (title: string, value: string | number, icon: string, color: string, onPress?: () => void) => (
    <TouchableOpacity 
      style={[styles.metricCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProjectCard = (project: ProjectStatus) => (
    <TouchableOpacity 
      key={project.id} 
      style={styles.projectCard}
      onPress={() => navigation.navigate('Projects')}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
        <View style={styles.projectBadges}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(project.status)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
              {project.status}
            </Text>
          </View>
          <View style={[styles.deadlineBadge, { backgroundColor: `${getDeadlineColor(project.deadlineStatus)}15` }]}>
            <Ionicons 
              name="time-outline" 
              size={12} 
              color={getDeadlineColor(project.deadlineStatus)} 
            />
          </View>
        </View>
      </View>
      
      <View style={styles.projectProgress}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{project.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${project.progress}%`,
                backgroundColor: project.progress < 50 ? '#EF4444' : project.progress < 80 ? '#F59E0B' : theme.colors.success
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="people-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.footerText}>{project.teamMembers} members</Text>
        </View>
        <Text style={styles.lastUpdate}>
          Updated {new Date(project.lastUpdate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderQuickAction = (title: string, icon: string, onPress: () => void, color: string = theme.colors.accent) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
      <Ionicons name="chevron-forward" size={14} color={theme.colors.gray400} />
    </TouchableOpacity>
  );

  if (isLoading) {
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
            <Text style={styles.welcomeText}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
            </Text>
            <Text style={styles.headerTitle}>Contractor Dashboard</Text>
          </View>
          <ProfileButton onPress={() => setShowProfileModal(true)} />
        </View>

        {/* Today's Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Progress Reports',
              todayStats.progressReports,
              'camera-outline',
              theme.colors.accent,
              () => navigation.navigate('Progress')
            )}
            {renderMetricCard(
              'Completed Tasks',
              todayStats.completedTasks,
              'checkmark-circle-outline',
              theme.colors.success
            )}
            {renderMetricCard(
              'Pending Issues',
              todayStats.pendingIssues,
              'alert-circle-outline',
              todayStats.pendingIssues > 0 ? '#EF4444' : theme.colors.success
            )}
            {renderMetricCard(
              'Active Workers',
              todayStats.activeWorkers,
              'people-outline',
              theme.colors.warning
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {renderQuickAction(
            'Add Progress Report',
            'camera-outline',
            () => navigation.navigate('Progress'),
            theme.colors.accent
          )}
          {renderQuickAction(
            'View Projects',
            'business-outline',
            () => navigation.navigate('Projects'),
            theme.colors.success
          )}
          {renderQuickAction(
            'Financial Overview',
            'wallet-outline',
            () => navigation.navigate('Financial'),
            '#F59E0B'
          )}
          {renderQuickAction(
            'View Analytics',
            'analytics-outline',
            () => navigation.navigate('Analytics'),
            '#3B82F6'
          )}
        </View>

        {/* Active Projects */}
        <View style={styles.projectsContainer}>
          <View style={styles.projectsHeader}>
            <Text style={styles.sectionTitle}>Active Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {projectStatuses.length > 0 ? (
            projectStatuses.slice(0, 3).map(renderProjectCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color={theme.colors.gray400} />
              <Text style={styles.emptyText}>No active projects</Text>
            </View>
          )}
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  quickActionText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  projectsContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  projectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  projectCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  projectBadges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deadlineBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  projectProgress: {
    marginBottom: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  lastUpdate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});