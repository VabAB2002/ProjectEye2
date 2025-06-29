import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useMilestoneStore } from '../../store/milestone.store';
import { useProjectStore } from '../../store/project.store';
import { useAuthStore } from '../../store/auth.store';

export const MilestoneListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { projects, currentProject } = useProjectStore();
  const { milestones, isLoading, fetchMilestones, createFromTemplate } = useMilestoneStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    currentProject?.id || projects[0]?.id || null
  );
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (selectedProjectId) {
      loadMilestoneData();
    }
  }, [selectedProjectId, filterStatus]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadMilestoneData = async () => {
    if (!selectedProjectId) return;
    
    await fetchMilestones(selectedProjectId, {
      status: filterStatus,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMilestoneData();
    setRefreshing(false);
  };

  const handleCreateMilestone = () => {
    if (!selectedProjectId) {
      alert('Please select a project first');
      return;
    }
    navigation.navigate('CreateMilestone' as never, { projectId: selectedProjectId } as never);
  };

  const handleMilestonePress = (milestoneId: string) => {
    navigation.navigate('MilestoneDetails' as never, { milestoneId } as never);
  };

  const handleCreateFromTemplate = async (templateType: 'RESIDENTIAL' | 'COMMERCIAL') => {
    if (!selectedProjectId) return;
    
    try {
      await createFromTemplate(selectedProjectId, templateType);
      await loadMilestoneData();
    } catch (error) {
      console.error('Failed to create from template:', error);
    }
  };

  // Calculate milestone statistics
  const getMilestoneStats = () => {
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'COMPLETED').length;
    const inProgress = milestones.filter(m => m.status === 'IN_PROGRESS').length;
    const overdue = milestones.filter(m => {
      const endDate = new Date(m.plannedEnd);
      const today = new Date();
      return endDate < today && m.status !== 'COMPLETED';
    }).length;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, inProgress, overdue, completionPercentage };
  };

  const getMilestoneIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'COMPLETED': return 'checkmark-circle';
      case 'IN_PROGRESS': return 'play-circle';
      case 'DELAYED': return 'warning-outline';
      default: return 'radio-button-off';
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#10B981';
      case 'IN_PROGRESS': return '#F59E0B';
      case 'DELAYED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const renderSection = (title: string, icon: keyof typeof Ionicons.glyphMap, content: React.ReactNode) => (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIcon}>
            <Ionicons name={icon} size={20} color={theme.colors.accent} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {content}
      </View>
    </Animated.View>
  );

  const renderOverview = () => {
    const stats = getMilestoneStats();
    
    return renderSection('Overview', 'analytics-outline', (
      <View>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Project Completion</Text>
            <Text style={styles.progressPercentage}>{stats.completionPercentage.toFixed(1)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${Math.min(stats.completionPercentage, 100)}%`,
                  backgroundColor: getProgressColor(stats.completionPercentage)
                }
              ]} 
            />
          </View>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: getProgressColor(stats.completionPercentage) }]}>
              {stats.completed} of {stats.total} milestones completed
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsGrid}>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.quickStatLabel}>Completed</Text>
            <Text style={styles.quickStatValue}>{stats.completed}</Text>
          </View>
          
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: '#F59E0B15' }]}>
              <Ionicons name="play-circle" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.quickStatLabel}>In Progress</Text>
            <Text style={styles.quickStatValue}>{stats.inProgress}</Text>
          </View>
          
          {stats.overdue > 0 && (
            <TouchableOpacity 
              style={styles.quickStatCard}
              onPress={() => setFilterStatus('DELAYED')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickStatIcon, { backgroundColor: '#EF444415' }]}>
                <Ionicons name="warning-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.quickStatLabel}>Overdue</Text>
              <Text style={styles.quickStatValue}>{stats.overdue}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ));
  };

  const renderProjectSelector = () => (
    renderSection('Project', 'business-outline', (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.projectScrollContent}
      >
        {projects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={[
              styles.projectChip,
              selectedProjectId === project.id && styles.projectChipActive
            ]}
            onPress={() => setSelectedProjectId(project.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.projectChipText,
              selectedProjectId === project.id && styles.projectChipTextActive
            ]}>
              {project.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ))
  );

  const renderFilters = () => {
    const statusFilters = [
      { label: 'All Status', value: null },
      { label: 'Pending', value: 'PENDING' },
      { label: 'In Progress', value: 'IN_PROGRESS' },
      { label: 'Completed', value: 'COMPLETED' },
      { label: 'Delayed', value: 'DELAYED' },
    ];

    return renderSection('Filters', 'funnel-outline', (
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value || 'all'}
              style={[
                styles.filterChip,
                filterStatus === filter.value && styles.filterChipActive
              ]}
              onPress={() => setFilterStatus(filter.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterChipText,
                filterStatus === filter.value && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ));
  };

  const renderQuickActions = () => {
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    
    return renderSection('Quick Actions', 'flash-outline', (
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={handleCreateMilestone}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#0066ff15' }]}>
            <Ionicons name="add-circle" size={24} color={theme.colors.accent} />
          </View>
          <Text style={styles.quickActionLabel}>Create Milestone</Text>
          <Text style={styles.quickActionDescription}>Add a custom milestone</Text>
        </TouchableOpacity>

        {selectedProject && (
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => handleCreateFromTemplate(selectedProject.type as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="library" size={24} color="#10B981" />
            </View>
            <Text style={styles.quickActionLabel}>Use Template</Text>
            <Text style={styles.quickActionDescription}>{selectedProject.type} project</Text>
          </TouchableOpacity>
        )}
      </View>
    ));
  };

  const renderMilestoneCard = ({ item: milestone }: { item: any }) => {
    const isOverdue = new Date(milestone.plannedEnd) < new Date() && milestone.status !== 'COMPLETED';
    const status = isOverdue ? 'DELAYED' : milestone.status;
    const daysRemaining = Math.ceil((new Date(milestone.plannedEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <TouchableOpacity
        style={styles.milestoneCard}
        onPress={() => handleMilestonePress(milestone.id)}
        activeOpacity={0.7}
      >
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneIconContainer}>
            <View style={[
              styles.milestoneIcon,
              { backgroundColor: `${getMilestoneColor(status)}15` }
            ]}>
              <Ionicons 
                name={getMilestoneIcon(status)} 
                size={20} 
                color={getMilestoneColor(status)} 
              />
            </View>
          </View>
          
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneName} numberOfLines={1}>
              {milestone.name}
            </Text>
            <Text style={styles.milestoneDescription} numberOfLines={2}>
              {milestone.description || 'No description provided'}
            </Text>
          </View>
          
          <View style={styles.milestoneStatus}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getMilestoneColor(status)}20` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getMilestoneColor(status) }
              ]}>
                {status.replace('_', ' ')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.milestoneProgress}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{milestone.progressPercentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar,
                { 
                  width: `${milestone.progressPercentage}%`,
                  backgroundColor: getMilestoneColor(status)
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.milestoneFooter}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>
              {new Date(milestone.plannedEnd).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
              })}
            </Text>
          </View>
          
          <Text style={[
            styles.daysRemaining,
            { color: isOverdue ? '#EF4444' : theme.colors.textSecondary }
          ]}>
            {isOverdue 
              ? `${Math.abs(daysRemaining)} days overdue`
              : `${daysRemaining} days left`
            }
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMilestonesList = () => (
    renderSection('Milestones', 'flag-outline', (
      milestones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag-outline" size={48} color={theme.colors.gray300} />
          <Text style={styles.emptyText}>No milestones found</Text>
          <Text style={styles.emptyDescription}>
            Create milestones to track your project progress
          </Text>
          <TouchableOpacity 
            style={styles.emptyAction}
            onPress={handleCreateMilestone}
            activeOpacity={0.7}
          >
            <Text style={styles.emptyActionText}>Create First Milestone</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={milestones}
          renderItem={renderMilestoneCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )
    ))
  );

  if (!selectedProjectId && projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color={theme.colors.gray300} />
          <Text style={styles.emptyText}>No Projects Found</Text>
          <Text style={styles.emptyDescription}>
            Create a project first to manage milestones
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Milestones</Text>
        <TouchableOpacity 
          style={styles.headerAction}
          onPress={handleCreateMilestone}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
      >
        {projects.length > 1 && renderProjectSelector()}
        {selectedProjectId && renderOverview()}
        {selectedProjectId && milestones.length > 0 && renderFilters()}
        {selectedProjectId && renderQuickActions()}
        {selectedProjectId && renderMilestonesList()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.colors.background,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
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
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  projectScrollContent: {
    paddingRight: 20,
  },
  projectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.gray100,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  projectChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  projectChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  projectChipTextActive: {
    color: theme.colors.background,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.gray100,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  filterChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: theme.colors.background,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  milestoneCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  milestoneIconContainer: {
    marginRight: 12,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneInfo: {
    flex: 1,
    marginRight: 12,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  milestoneStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  milestoneProgress: {
    marginBottom: 12,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  daysRemaining: {
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAction: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.background,
  },
});