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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useProjectStore } from '../../store/project.store';
import { ProjectStackParamList } from '../../navigation/ProjectNavigator';

type RouteProps = RouteProp<ProjectStackParamList, 'ProjectDetails'>;

export const ProjectDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<ProjectStackParamList>>();
  const { projectId } = route.params;
  const { currentProject, currentProjectStats, isLoading, selectProject } = useProjectStore();

  useEffect(() => {
    selectProject(projectId);
  }, [projectId]);

  if (isLoading || !currentProject || !currentProjectStats) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'on-hold': return '#F59E0B';
      case 'delayed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    value: string | number,
    color: string = '#6B7280'
  ) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderInfoSection = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    children: React.ReactNode
  ) => (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name={icon} size={18} color={theme.colors.accent} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderActionButton = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    subtitle: string,
    onPress: () => void,
    color: string = theme.colors.accent
  ) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.projectName}>{currentProject.name}</Text>
            <View style={styles.projectMeta}>
              <View style={styles.typeChip}>
                <Text style={styles.typeText}>{currentProject.type.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: getStatusColor(currentProject.status) }]}>
                <Text style={styles.statusText}>{currentProject.status.toUpperCase()}</Text>
              </View>
            </View>
            {currentProject.description && (
              <Text style={styles.projectDescription}>{currentProject.description}</Text>
            )}
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'people-outline',
              'Team Members',
              currentProjectStats.counts.members,
              '#3B82F6'
            )}
            {renderStatCard(
              'flag-outline',
              'Milestones',
              `${currentProjectStats.progress.completedMilestones}/${currentProjectStats.progress.totalMilestones}`,
              '#F59E0B'
            )}
            {renderStatCard(
              'camera-outline',
              'Updates',
              currentProjectStats.counts.progressUpdates,
              '#10B981'
            )}
            {renderStatCard(
              'wallet-outline',
              'Budget Used',
              `${currentProjectStats.financial.budgetUtilization.toFixed(0)}%`,
              '#EF4444'
            )}
          </View>
        </View>

        {/* Analytics Actions */}
        <View style={styles.actionsContainer}>
          {renderActionButton(
            'heart',
            'Project Health',
            'Simple view of your project status',
            () => navigation.navigate('SimpleAnalytics', { projectId }),
            '#10B981'
          )}
          {renderActionButton(
            'chatbubbles',
            'Share Reports',
            'WhatsApp & SMS ready reports',
            () => navigation.navigate('SimpleReports', { projectId }),
            '#3B82F6'
          )}
        </View>

        {/* Financial Overview */}
        {renderInfoSection('Financial Overview', 'card-outline', (
          <View style={styles.financialGrid}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Total Budget</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(currentProjectStats.financial.totalBudget)}
              </Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Spent</Text>
              <Text style={[styles.financialValue, { color: '#EF4444' }]}>
                {formatCurrency(currentProjectStats.financial.totalExpenses)}
              </Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Remaining</Text>
              <Text style={[styles.financialValue, { color: '#10B981' }]}>
                {formatCurrency(currentProjectStats.financial.remainingBudget)}
              </Text>
            </View>
          </View>
        ))}

        {/* Progress Overview */}
        {renderInfoSection('Progress Overview', 'analytics-outline', (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Time Progress</Text>
              <Text style={styles.progressPercentage}>
                {currentProjectStats.progress.timeProgress.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${currentProjectStats.progress.timeProgress}%` },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.progressSubtext}>
              {currentProjectStats.progress.daysElapsed} of {currentProjectStats.progress.totalDays} days completed
            </Text>
          </View>
        ))}

        {/* Project Information */}
        {renderInfoSection('Project Information', 'information-circle-outline', (
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.infoLabel}>Location</Text>
              </View>
              <Text style={styles.infoText}>
                {currentProject.address.line1}
                {currentProject.address.line2 && `, ${currentProject.address.line2}`}
              </Text>
              <Text style={styles.infoSubtext}>
                {currentProject.address.city}, {currentProject.address.state} {currentProject.address.pincode}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.infoLabel}>Timeline</Text>
              </View>
              <Text style={styles.infoText}>
                Started: {new Date(currentProject.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
              <Text style={styles.infoSubtext}>
                Expected completion: {new Date(currentProject.estimatedEndDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    padding: 24,
  },
  projectName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  projectMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  typeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  projectDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    fontWeight: '400',
  },

  // Stats Styles
  statsContainer: {
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Actions Styles
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },

  // Section Styles
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Financial Styles
  financialGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  financialLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Progress Styles
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 3,
  },
  progressSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Info Styles
  infoGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  infoItem: {
    
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
});