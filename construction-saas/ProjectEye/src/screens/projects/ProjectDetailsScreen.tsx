// src/screens/projects/ProjectDetailsScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useProjectStore } from '../../store/project.store';
import { ProjectStackParamList } from '../../navigation/ProjectNavigator';

type RouteProps = RouteProp<ProjectStackParamList, 'ProjectDetails'>;

export const ProjectDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { projectId } = route.params;
  const { currentProject, currentProjectStats, isLoading, selectProject } = useProjectStore();

  useEffect(() => {
    selectProject(projectId);
  }, [projectId]);

  if (isLoading || !currentProject || !currentProjectStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    value: string | number,
    color: string = theme.colors.text
  ) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Project Header */}
      <View style={styles.header}>
        <Text style={styles.projectName}>{currentProject.name}</Text>
        <View style={styles.projectMeta}>
          <View style={styles.typeChip}>
            <Text style={styles.typeText}>{currentProject.type}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.statusText}>{currentProject.status}</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        {renderStatCard(
          'people',
          'Team Members',
          currentProjectStats.counts.members,
          theme.colors.info
        )}
        {renderStatCard(
          'flag',
          'Milestones',
          `${currentProjectStats.progress.completedMilestones}/${currentProjectStats.progress.totalMilestones}`,
          theme.colors.warning
        )}
        {renderStatCard(
          'camera',
          'Updates',
          currentProjectStats.counts.progressUpdates,
          theme.colors.success
        )}
        {renderStatCard(
          'wallet',
          'Budget Used',
          `${currentProjectStats.financial.budgetUtilization.toFixed(0)}%`,
          theme.colors.error
        )}
      </View>

      {/* Financial Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <View style={styles.financialCard}>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Total Budget</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(currentProjectStats.financial.totalBudget)}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Spent</Text>
            <Text style={[styles.financialValue, { color: theme.colors.error }]}>
              {formatCurrency(currentProjectStats.financial.totalExpenses)}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Remaining</Text>
            <Text style={[styles.financialValue, { color: theme.colors.success }]}>
              {formatCurrency(currentProjectStats.financial.remainingBudget)}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Time Progress</Text>
            <Text style={styles.progressValue}>
              {currentProjectStats.progress.timeProgress.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${currentProjectStats.progress.timeProgress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressDays}>
            {currentProjectStats.progress.daysElapsed} of {currentProjectStats.progress.totalDays} days
          </Text>
        </View>
      </View>

      {/* Project Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color={theme.colors.gray500} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>
                {currentProject.address.line1}
                {currentProject.address.line2 && `, ${currentProject.address.line2}`}
              </Text>
              <Text style={styles.detailText}>
                {currentProject.address.city}, {currentProject.address.state} - {currentProject.address.pincode}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color={theme.colors.gray500} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Timeline</Text>
              <Text style={styles.detailText}>
                Start: {new Date(currentProject.startDate).toLocaleDateString()}
              </Text>
              <Text style={styles.detailText}>
                End: {new Date(currentProject.estimatedEndDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  projectName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  projectMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.round,
  },
  typeText: {
    fontSize: 12,
    color: theme.colors.gray700,
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  financialCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
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
  progressCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.gray200,
    borderRadius: 4,
    marginVertical: theme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
  },
  progressDays: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  detailContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});