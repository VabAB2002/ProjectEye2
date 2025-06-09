import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useMilestoneStore } from '../../store/milestone.store';
import { useProgressStore } from '../../store/progress.store';

interface MilestoneDetailsScreenParams {
  milestoneId: string;
}

export const MilestoneDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { milestoneId } = route.params as MilestoneDetailsScreenParams;
  
  const { 
    milestones, 
    updateMilestone, 
    isLoading: milestoneLoading 
  } = useMilestoneStore();
  const { updates, fetchUpdates } = useProgressStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [inputErrors, setInputErrors] = useState<{[key: string]: string}>({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const milestone = milestones.find(m => m.id === milestoneId);
  const relatedProgress = updates.filter((p: any) => 
    p.milestoneIds && p.milestoneIds.includes(milestoneId)
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'PENDING',
  });

  useEffect(() => {
    if (milestone) {
      setFormData({
        title: milestone.name,
        description: milestone.description || '',
        startDate: new Date(milestone.plannedStart),
        endDate: new Date(milestone.plannedEnd),
        status: milestone.status,
      });
      // Fetch related progress
      fetchUpdates(milestone.projectId);
    }
  }, [milestone]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (milestone) {
      await fetchUpdates(milestone.projectId);
    }
    setRefreshing(false);
  };

  if (milestoneLoading || !milestone) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#6B7280';
      case 'IN_PROGRESS': return '#F59E0B';
      case 'COMPLETED': return '#10B981';
      case 'DELAYED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return 'radio-button-off-outline';
      case 'IN_PROGRESS': return 'play-circle-outline';
      case 'COMPLETED': return 'checkmark-circle-outline';
      case 'DELAYED': return 'warning-outline';
      default: return 'radio-button-off-outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'DELAYED': return 'Delayed';
      default: return status;
    }
  };

  const calculateDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(milestone.plannedEnd);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      errors.title = 'Milestone title is required';
    }
    if (formData.startDate >= formData.endDate) {
      errors.endDate = 'End date must be after start date';
    }

    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      await updateMilestone(milestone.projectId, milestoneId, {
        name: formData.title,
        description: formData.description || undefined,
        plannedStart: formData.startDate.toISOString(),
        plannedEnd: formData.endDate.toISOString(),
        status: formData.status as any,
      });
      
      setIsEditing(false);
      Alert.alert('Success!', 'Milestone updated successfully');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to update milestone'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('Delete milestone:', milestoneId);
            navigation.goBack();
          },
        },
      ]
    );
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
    const daysRemaining = calculateDaysRemaining();
    const isOverdue = daysRemaining < 0;
    const status = isOverdue && milestone.status !== 'COMPLETED' ? 'DELAYED' : milestone.status;
    
    return renderSection('Overview', 'analytics-outline', (
      <View>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusIcon,
              { backgroundColor: `${getStatusColor(status)}15` }
            ]}>
              <Ionicons 
                name={getStatusIcon(status) as any} 
                size={24} 
                color={getStatusColor(status)} 
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(status) }]}>
                {getStatusLabel(status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercentage}>{milestone.progressPercentage}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    width: `${milestone.progressPercentage}%`,
                    backgroundColor: getStatusColor(status)
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Timeline Info */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Ionicons name="play-outline" size={16} color={theme.colors.accent} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Start Date</Text>
              <Text style={styles.timelineDate}>
                {new Date(milestone.plannedStart).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Ionicons name="flag-outline" size={16} color={theme.colors.accent} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>End Date</Text>
              <Text style={styles.timelineDate}>
                {new Date(milestone.plannedEnd).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.durationCard}>
            <Ionicons 
              name={isOverdue ? "warning-outline" : "time-outline"} 
              size={16} 
              color={isOverdue ? '#EF4444' : theme.colors.accent} 
            />
            <Text style={[
              styles.durationText,
              { color: isOverdue ? '#EF4444' : theme.colors.accent }
            ]}>
              {isOverdue 
                ? `${Math.abs(daysRemaining)} days overdue` 
                : `${daysRemaining} days remaining`
              }
            </Text>
          </View>
        </View>
      </View>
    ));
  };

  const renderEditForm = () => {
    if (!isEditing) return null;

    const statusOptions = [
      { value: 'PENDING', label: 'Pending', icon: 'radio-button-off-outline', color: '#6B7280' },
      { value: 'IN_PROGRESS', label: 'In Progress', icon: 'play-circle-outline', color: '#F59E0B' },
      { value: 'COMPLETED', label: 'Completed', icon: 'checkmark-circle-outline', color: '#10B981' },
      { value: 'DELAYED', label: 'Delayed', icon: 'warning-outline', color: '#EF4444' },
    ];

    return renderSection('Edit Milestone', 'create-outline', (
      <View>
        <Input
          label="Milestone Title"
          value={formData.title}
          onChangeText={(text) => {
            setFormData({ ...formData, title: text });
            if (inputErrors.title) {
              setInputErrors({ ...inputErrors, title: '' });
            }
          }}
          placeholder="Enter milestone title"
          error={inputErrors.title}
          icon="flag-outline"
          variant="filled"
        />

        <Input
          label="Description (Optional)"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Enter milestone description..."
          multiline
          numberOfLines={3}
          variant="filled"
        />

        {/* Status Selector */}
        <View style={styles.statusSelector}>
          <Text style={styles.inputLabel}>Status</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusScrollContent}
          >
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.statusChip,
                  formData.status === status.value && [
                    styles.statusChipActive,
                    { borderColor: status.color, backgroundColor: `${status.color}15` }
                  ],
                ]}
                onPress={() => setFormData({ ...formData, status: status.value })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={status.icon as any}
                  size={16}
                  color={formData.status === status.value ? status.color : theme.colors.gray500}
                />
                <Text
                  style={[
                    styles.statusChipText,
                    formData.status === status.value && { color: status.color },
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Date Selectors */}
        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity 
              style={styles.dateSelector} 
              onPress={() => setShowStartDate(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateSelectorContent}>
                <View style={styles.dateIconContainer}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.accent} />
                </View>
                <Text style={styles.dateText}>
                  {formData.startDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.gray500} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateColumn}>
            <Text style={styles.inputLabel}>End Date</Text>
            <TouchableOpacity 
              style={[
                styles.dateSelector,
                inputErrors.endDate && styles.dateErrorBorder
              ]} 
              onPress={() => setShowEndDate(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateSelectorContent}>
                <View style={styles.dateIconContainer}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.accent} />
                </View>
                <Text style={styles.dateText}>
                  {formData.endDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.gray500} />
            </TouchableOpacity>
          </View>
        </View>

        {inputErrors.endDate && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={14} color={theme.colors.error} />
            <Text style={styles.errorText}>{inputErrors.endDate}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.editActions}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isUpdating}
            icon="checkmark-circle-outline"
            fullWidth
          />
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              setIsEditing(false);
              // Reset form data
              setFormData({
                title: milestone.name,
                description: milestone.description || '',
                startDate: new Date(milestone.plannedStart),
                endDate: new Date(milestone.plannedEnd),
                status: milestone.status,
              });
              setInputErrors({});
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const renderProgressUpdates = () => {
    return renderSection('Progress Updates', 'trending-up-outline', (
      <View>
        <View style={styles.progressHeader}>
          <Text style={styles.progressCount}>
            {relatedProgress.length} update{relatedProgress.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {relatedProgress.length === 0 ? (
          <View style={styles.emptyProgressContainer}>
            <Ionicons name="clipboard-outline" size={48} color={theme.colors.gray300} />
            <Text style={styles.emptyProgressText}>No progress updates yet</Text>
            <Text style={styles.emptyProgressSubtext}>
              Progress updates linked to this milestone will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.progressList}>
            {relatedProgress.slice(0, 3).map((progress: any) => (
              <View key={progress.id} style={styles.progressItem}>
                <View style={styles.progressItemHeader}>
                  <View style={styles.progressItemIcon}>
                    <Ionicons name="trending-up-outline" size={16} color={theme.colors.accent} />
                  </View>
                  <View style={styles.progressItemInfo}>
                    <Text style={styles.progressItemTitle}>{progress.title}</Text>
                    <Text style={styles.progressItemDate}>
                      {new Date(progress.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <Text style={styles.progressItemPercentage}>{progress.percentage}%</Text>
                </View>
                {progress.description && (
                  <Text style={styles.progressItemDescription} numberOfLines={2}>
                    {progress.description}
                  </Text>
                )}
              </View>
            ))}
            
            {relatedProgress.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllProgress}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllProgressText}>
                  View all {relatedProgress.length} progress updates
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.accent} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{milestone.name}</Text>
        <View style={styles.headerActions}>
          {!isEditing && (
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color={theme.colors.accent} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.headerActionButton, { backgroundColor: '#EF444415' }]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
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
        {/* Overview Section */}
        {renderOverview()}

        {/* Edit Form (when editing) */}
        {renderEditForm()}

        {/* Description Section (when not editing) */}
        {!isEditing && milestone.description && renderSection('Description', 'document-text-outline', (
          <Text style={styles.description}>{milestone.description}</Text>
        ))}

        {/* Progress Updates Section */}
        {renderProgressUpdates()}
      </ScrollView>

      {/* Date Pickers */}
      {showStartDate && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowStartDate(false);
            if (date) {
              setFormData({ ...formData, startDate: date });
              if (inputErrors.endDate) {
                setInputErrors({ ...inputErrors, endDate: '' });
              }
            }
          }}
        />
      )}

      {showEndDate && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          minimumDate={new Date(formData.startDate.getTime() + 24 * 60 * 60 * 1000)}
          onChange={(event, date) => {
            setShowEndDate(false);
            if (date) {
              setFormData({ ...formData, endDate: date });
              if (inputErrors.endDate) {
                setInputErrors({ ...inputErrors, endDate: '' });
              }
            }
          }}
        />
      )}
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
    backgroundColor: theme.colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
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
    paddingBottom: 8,
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
  statusCard: {
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  timelineCard: {
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  statusSelector: {
    marginBottom: 20,
  },
  statusScrollContent: {
    paddingRight: 20,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.gray100,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  statusChipActive: {
    backgroundColor: theme.colors.background,
  },
  statusChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginLeft: 6,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dateColumn: {
    flex: 1,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  dateErrorBorder: {
    borderColor: theme.colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginLeft: 6,
    fontWeight: '500',
  },
  editActions: {
    marginTop: 8,
  },
  cancelButton: {
    padding: 16,
    backgroundColor: theme.colors.gray100,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyProgressContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyProgressSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressList: {
    gap: 12,
  },
  progressItem: {
    padding: 16,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  progressItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressItemInfo: {
    flex: 1,
  },
  progressItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  progressItemDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  progressItemPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  progressItemDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 40,
  },
  viewAllProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: theme.colors.gray50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  viewAllProgressText: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600',
    marginRight: 4,
  },
});