import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useProjectStore } from '../../store/project.store';
import { useAuthStore } from '../../store/auth.store';
import { Project } from '../../api/types';

interface ProjectItemProps {
  project: Project;
  onPress: (project: Project) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.colors.success;
      case 'PLANNING':
        return theme.colors.warning;
      case 'ON_HOLD':
        return theme.colors.error;
      case 'COMPLETED':
        return theme.colors.gray500;
      default:
        return theme.colors.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PLANNING':
        return 'Planning';
      case 'ON_HOLD':
        return 'On Hold';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.projectItem} onPress={() => onPress(project)}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectName} numberOfLines={2}>
          {project.name}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(project.status) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusText(project.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.projectDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {project.address.city}, {project.address.state}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            Started {new Date(project.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {project.description && (
          <Text style={styles.projectDescription} numberOfLines={2}>
            {project.description}
          </Text>
        )}
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.teamInfo}>
          <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.teamText}>
            {project.teamMembers?.length || 0} team members
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
      </View>
    </TouchableOpacity>
  );
};

export const WorkerProjectsScreen: React.FC = () => {
  const { projects, isLoading, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  const handleProjectPress = (project: Project) => {
    // For workers, just show basic project info
    // Could navigate to a simple project details screen
    console.log('Project selected:', project.name);
  };

  // Filter projects where the user is a team member
  const myProjects = projects.filter(project => 
    project.teamMembers?.some(member => member.userId === user?.id)
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="briefcase-outline" size={48} color={theme.colors.gray300} />
      </View>
      <Text style={styles.emptyTitle}>No Projects Assigned</Text>
      <Text style={styles.emptyText}>
        You haven't been assigned to any projects yet. Contact your supervisor for project assignments.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Projects</Text>
      <Text style={styles.headerSubtitle}>
        {myProjects.length} {myProjects.length === 1 ? 'project' : 'projects'} assigned to you
      </Text>
    </View>
  );

  if (isLoading && projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Loading your projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <FlatList
        data={myProjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectItem
            project={item}
            onPress={handleProjectPress}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
        contentContainerStyle={myProjects.length === 0 ? styles.emptyListContent : styles.listContent}
        showsVerticalScrollIndicator={false}
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
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  headerContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
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
  },
  projectItem: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  projectName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  projectDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  projectDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginTop: theme.spacing.sm,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});