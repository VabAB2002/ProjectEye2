import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useMilestoneStore } from '../../store/milestone.store';
import { useProjectStore } from '../../store/project.store';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/common/Button';

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

  useEffect(() => {
    if (selectedProjectId) {
      fetchMilestones(selectedProjectId, { status: filterStatus });
    }
  }, [selectedProjectId, filterStatus]);

  const handleRefresh = async () => {
    if (!selectedProjectId) return;
    setRefreshing(true);
    await fetchMilestones(selectedProjectId, { status: filterStatus });
    setRefreshing(false);
  };

  const handleCreateMilestone = () => {
    if (!selectedProjectId) {
      Alert.alert('Error', 'Please select a project first');
      return;
    }
    navigation.navigate('CreateMilestone', { projectId: selectedProjectId });
  };

  const handleMilestonePress = (milestoneId: string) => {
    if (!selectedProjectId) return;
    navigation.navigate('MilestoneDetails', { 
      projectId: selectedProjectId, 
      milestoneId 
    });
  };

  const handleCreateFromTemplate = () => {
    if (!selectedProjectId) {
      Alert.alert('Error', 'Please select a project first');
      return;
    }

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    if (!selectedProject) return;

    Alert.alert(
      'Create from Template',
      `This will create standard milestones for a ${selectedProject.type} project. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              await createFromTemplate(selectedProjectId, selectedProject.type);
              Alert.alert('Success', 'Milestones created successfully');
              handleRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to create milestones');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return theme.colors.success;
      case 'IN_PROGRESS': return theme.colors.info;
      case 'DELAYED': return theme.colors.error;
      case 'PENDING': return theme.colors.gray500;
      default: return theme.colors.gray500;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'COMPLETED': return 'checkmark-circle';
      case 'IN_PROGRESS': return 'time';
      case 'DELAYED': return 'alert-circle';
      case 'PENDING': return 'ellipse-outline';
      default: return 'ellipse-outline';
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderProjectSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.projectScrollContent}
      style={styles.projectSelector}
    >
      {projects.map((project) => (
        <TouchableOpacity
          key={project.id}
          style={[
            styles.projectChip,
            selectedProjectId === project.id && styles.projectChipActive,
          ]}
          onPress={() => setSelectedProjectId(project.id)}
        >
          <Text
            style={[
              styles.projectChipText,
              selectedProjectId === project.id && styles.projectChipTextActive,
            ]}
          >
            {project.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      <TouchableOpacity
        style={[styles.filterChip, !filterStatus && styles.filterChipActive]}
        onPress={() => setFilterStatus(null)}
      >
        <Text style={[styles.filterText, !filterStatus && styles.filterTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      
      {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'].map((status) => (
        <TouchableOpacity
          key={status}
          style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
          onPress={() => setFilterStatus(filterStatus === status ? null : status)}
        >
          <Text style={[styles.filterText, filterStatus === status && styles.filterTextActive]}>
            {status.replace('_', ' ')}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMilestoneCard = ({ item }: { item: any }) => {
    const startDate = new Date(item.plannedStart);
    const endDate = new Date(item.plannedEnd);
    const daysRemaining = calculateDaysRemaining(item.plannedEnd);
    const isOverdue = daysRemaining < 0 && item.status !== 'COMPLETED';

    return (
      <TouchableOpacity
        style={styles.milestoneCard}
        onPress={() => handleMilestonePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons
              name={getStatusIcon(item.status)}
              size={24}
              color={getStatusColor(item.status)}
              style={styles.statusIcon}
            />
            <View style={styles.titleInfo}>
              <Text style={styles.milestoneName}>{item.name}</Text>
              <Text style={styles.dateRange}>
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{item.progressPercentage}%</Text>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${item.progressPercentage}%`,
                    backgroundColor: getStatusColor(item.status)
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Ionicons name="camera" size={16} color={theme.colors.gray500} />
            <Text style={styles.metaText}>
              {item._count?.progressUpdates || 0} updates
            </Text>
          </View>

          {item._count?.subMilestones > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="git-branch" size={16} color={theme.colors.gray500} />
              <Text style={styles.metaText}>
                {item._count.subMilestones} sub-tasks
              </Text>
            </View>
          )}

          <View style={[styles.metaItem, styles.daysContainer]}>
            {isOverdue ? (
              <>
                <Ionicons name="alert" size={16} color={theme.colors.error} />
                <Text style={[styles.metaText, styles.overdueText]}>
                  {Math.abs(daysRemaining)} days overdue
                </Text>
              </>
            ) : item.status === 'COMPLETED' ? (
              <>
                <Ionicons name="checkmark" size={16} color={theme.colors.success} />
                <Text style={[styles.metaText, styles.completedText]}>
                  Completed
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="time" size={16} color={theme.colors.gray500} />
                <Text style={styles.metaText}>
                  {daysRemaining} days left
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="flag-outline" size={48} color={theme.colors.gray300} />
      </View>
      <Text style={styles.emptyTitle}>No Milestones</Text>
      <Text style={styles.emptyText}>
        Create milestones to track project progress
      </Text>
      
      {user?.role === 'OWNER' && (
        <View style={styles.emptyButtons}>
          <Button
            title="Create from Template"
            onPress={handleCreateFromTemplate}
            variant="secondary"
            icon="apps"
          />
          <Button
            title="Create Custom"
            onPress={handleCreateMilestone}
            icon="add-circle"
          />
        </View>
      )}
    </View>
  );

  if (!selectedProjectId && projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noProjectContainer}>
          <Ionicons name="folder-open-outline" size={48} color={theme.colors.gray300} />
          <Text style={styles.emptyTitle}>No Projects Available</Text>
          <Text style={styles.emptyText}>Create a project first to manage milestones</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Milestones</Text>
        <Text style={styles.headerSubtitle}>Track project phases and deadlines</Text>
      </View>

      {renderProjectSelector()}
      {renderFilters()}

      <FlatList
        data={milestones}
        keyExtractor={(item) => item.id}
        renderItem={renderMilestoneCard}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
        contentContainerStyle={milestones.length === 0 ? styles.emptyListContent : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {user?.role === 'OWNER' && milestones.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateMilestone}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={theme.colors.secondary} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  headerContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  projectSelector: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  projectScrollContent: {
    paddingHorizontal: theme.spacing.xl,
  },
  projectChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.gray100,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  projectChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  projectChipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  projectChipTextActive: {
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.xl,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.gray100,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  filterChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  milestoneCard: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  cardHeader: {
    marginBottom: theme.spacing.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusIcon: {
    marginRight: theme.spacing.md,
  },
  titleInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  dateRange: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  description: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  daysContainer: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  overdueText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  completedText: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  emptyButtons: {
    gap: theme.spacing.md,
  },
  noProjectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xxl,
    right: theme.spacing.xxl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
});