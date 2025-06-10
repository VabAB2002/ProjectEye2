import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useProgressStore } from '../../store/progress.store';
import { useProjectStore } from '../../store/project.store';
import { useAuthStore } from '../../store/auth.store';

export const DailyWorkScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { createUpdate, isLoading } = useProgressStore();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const myProjects = projects.filter(project => 
    project.teamMembers?.some(member => member.userId === user?.id)
  );

  const handleCheckIn = async () => {
    if (!selectedProject) {
      Alert.alert('Select Project', 'Please select a project to check in to.');
      return;
    }

    try {
      // Create a FormData object as expected by the API
      const formData = new FormData();
      formData.append('title', `Daily Work - ${new Date().toLocaleDateString()}`);
      formData.append('description', 'Checked in for daily work');
      formData.append('percentage', '0');
      
      await createUpdate(selectedProject, formData);
      Alert.alert('Success', 'Successfully checked in for today!');
    } catch (error) {
      Alert.alert('Error', 'Failed to check in. Please try again.');
    }
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{getTodayDate()}</Text>
            <Text style={styles.greetingText}>Ready to start your day?</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="hammer" size={24} color={theme.colors.accent} />
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Hours Today</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={theme.colors.success} />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Days This Week</Text>
          </View>
        </View>

        {/* Project Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Project</Text>
          {myProjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-outline" size={48} color={theme.colors.gray300} />
              <Text style={styles.emptyText}>No projects assigned</Text>
            </View>
          ) : (
            <View style={styles.projectList}>
              {myProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectCard,
                    selectedProject === project.id && styles.projectCardSelected
                  ]}
                  onPress={() => setSelectedProject(project.id)}
                >
                  <View style={styles.projectInfo}>
                    <Text style={[
                      styles.projectName,
                      selectedProject === project.id && styles.projectNameSelected
                    ]}>
                      {project.name}
                    </Text>
                    <Text style={styles.projectLocation}>
                      {project.address.city}, {project.address.state}
                    </Text>
                  </View>
                  {selectedProject === project.id && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[
              styles.checkInButton,
              (!selectedProject || isLoading) && styles.checkInButtonDisabled
            ]}
            onPress={handleCheckIn}
            disabled={!selectedProject || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.secondary} />
            ) : (
              <>
                <Ionicons name="play-circle" size={24} color={theme.colors.secondary} />
                <Text style={styles.checkInButtonText}>Start Work Day</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="camera" size={20} color={theme.colors.accent} />
              <Text style={styles.quickActionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="document-text" size={20} color={theme.colors.accent} />
              <Text style={styles.quickActionText}>Add Note</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark" size={16} color={theme.colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Checked in to Downtown Office</Text>
                <Text style={styles.activityTime}>Yesterday, 8:00 AM</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="camera" size={16} color={theme.colors.accent} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Progress photo uploaded</Text>
                <Text style={styles.activityTime}>Yesterday, 2:30 PM</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  greetingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  section: {
    backgroundColor: theme.colors.background,
    margin: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  projectList: {
    gap: theme.spacing.md,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.gray50,
  },
  projectCardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  projectNameSelected: {
    color: theme.colors.accent,
  },
  projectLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionsSection: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  checkInButtonDisabled: {
    backgroundColor: theme.colors.gray300,
  },
  checkInButtonText: {
    color: theme.colors.secondary,
    fontSize: 18,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionText: {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: '500',
  },
  activityList: {
    gap: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  activityTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});