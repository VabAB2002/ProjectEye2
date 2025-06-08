// src/screens/progress/ProgressListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useProgressStore } from '../../store/progress.store';
import { useProjectStore } from '../../store/project.store';
import { Button } from '../../components/common/Button';

export const ProgressListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { projects, currentProject } = useProjectStore();
  const { updates, isLoading, fetchUpdates } = useProgressStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    route.params?.projectId || currentProject?.id || null
  );

  useEffect(() => {
    if (selectedProjectId) {
      fetchUpdates(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleRefresh = async () => {
    if (!selectedProjectId) return;
    setRefreshing(true);
    await fetchUpdates(selectedProjectId);
    setRefreshing(false);
  };

  const handleCreateProgress = () => {
    if (!selectedProjectId) {
      alert('Please select a project first');
      return;
    }
    navigation.navigate('CreateProgress', { projectId: selectedProjectId });
  };

  const handleUpdatePress = (updateId: string) => {
    if (!selectedProjectId) return;
    navigation.navigate('ProgressDetails', { 
      projectId: selectedProjectId, 
      updateId 
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Progress Updates</Text>
      <Text style={styles.headerSubtitle}>
        Track daily construction progress
      </Text>
    </View>
  );

  const renderProjectSelector = () => (
    <View style={styles.projectSelectorContainer}>
      <Text style={styles.selectorLabel}>Select Project</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.projectScrollContent}
      >
        {projects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={[
              styles.projectCard,
              selectedProjectId === project.id && styles.projectCardActive,
            ]}
            onPress={() => setSelectedProjectId(project.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.projectIconContainer,
              selectedProjectId === project.id && styles.projectIconContainerActive,
            ]}>
              <Ionicons 
                name="folder-outline" 
                size={20} 
                color={selectedProjectId === project.id ? theme.colors.accent : theme.colors.gray500} 
              />
            </View>
            <Text
              style={[
                styles.projectCardText,
                selectedProjectId === project.id && styles.projectCardTextActive,
              ]}
              numberOfLines={2}
            >
              {project.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderUpdateCard = ({ item }: { item: any }) => {
    const date = new Date(item.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const monthYear = date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });

    return (
      <TouchableOpacity 
        style={styles.updateCard}
        onPress={() => handleUpdatePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.dateIndicator}>
            <Text style={styles.dayName}>{dayName}</Text>
            <Text style={styles.dayNumber}>{dayNumber}</Text>
            <Text style={styles.monthYear}>{monthYear}</Text>
          </View>

          <View style={styles.updateContent}>
            <Text style={styles.workDescription} numberOfLines={3}>
              {item.workDescription}
            </Text>

            <View style={styles.metaContainer}>
              {item.weatherConditions && (
                <View style={styles.metaChip}>
                  <Ionicons 
                    name={getWeatherIcon(item.weatherConditions)} 
                    size={14} 
                    color={theme.colors.gray500} 
                  />
                  <Text style={styles.metaText}>{item.weatherConditions}</Text>
                </View>
              )}
              {item.workersCount && (
                <View style={styles.metaChip}>
                  <Ionicons name="people-outline" size={14} color={theme.colors.gray500} />
                  <Text style={styles.metaText}>{item.workersCount}</Text>
                </View>
              )}
              <View style={styles.metaChip}>
                <Ionicons name="camera-outline" size={14} color={theme.colors.gray500} />
                <Text style={styles.metaText}>{item._count.photos}</Text>
              </View>
            </View>

            {item.photos.length > 0 && (
              <View style={styles.photoPreviewContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoPreview}
                >
                  {item.photos.slice(0, 4).map((photo: any, index: number) => (
                    <Image
                      key={photo.id}
                      source={{ uri: photo.thumbnailUrl || photo.fileUrl }}
                      style={styles.previewImage}
                    />
                  ))}
                  {item.photos.length > 4 && (
                    <View style={styles.morePhotosIndicator}>
                      <Text style={styles.morePhotosText}>
                        +{item.photos.length - 4}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getWeatherIcon = (weather: string): keyof typeof Ionicons.glyphMap => {
    switch (weather.toLowerCase()) {
      case 'sunny': return 'sunny-outline';
      case 'cloudy': return 'cloudy-outline';
      case 'rainy': return 'rainy-outline';
      case 'stormy': return 'thunderstorm-outline';
      default: return 'partly-sunny-outline';
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="calendar-outline" size={48} color={theme.colors.gray300} />
      </View>
      <Text style={styles.emptyTitle}>No Progress Updates</Text>
      <Text style={styles.emptyText}>
        Start documenting daily construction progress with photos and notes
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateProgress}>
        <Text style={styles.createButtonText}>Create First Update</Text>
      </TouchableOpacity>
    </View>
  );

  if (!selectedProjectId && projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.noProjectContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="folder-open-outline" size={48} color={theme.colors.gray300} />
          </View>
          <Text style={styles.emptyTitle}>No Projects Available</Text>
          <Text style={styles.emptyText}>Create a project first to track progress</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {renderHeader()}
      {renderProjectSelector()}
      
      <FlatList
        data={updates}
        keyExtractor={(item) => item.id}
        renderItem={renderUpdateCard}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
        contentContainerStyle={updates.length === 0 ? styles.emptyListContent : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {selectedProjectId && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateProgress}
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
  projectSelectorContainer: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    marginBottom: theme.spacing.md,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.xl,
    letterSpacing: 0.2,
  },
  projectScrollContent: {
    paddingHorizontal: theme.spacing.xl,
  },
  projectCard: {
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    minWidth: 120,
    alignItems: 'center',
  },
  projectCardActive: {
    backgroundColor: `${theme.colors.accent}08`,
    borderColor: theme.colors.accent,
  },
  projectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  projectIconContainerActive: {
    backgroundColor: `${theme.colors.accent}15`,
  },
  projectCardText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  projectCardTextActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  updateCard: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  cardContent: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
  },
  dateIndicator: {
    width: 60,
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  dayName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.accent,
    marginVertical: theme.spacing.xs,
  },
  monthYear: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  updateContent: {
    flex: 1,
  },
  workDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  photoPreviewContainer: {
    marginTop: theme.spacing.sm,
  },
  photoPreview: {
    flexDirection: 'row',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.gray100,
  },
  morePhotosIndicator: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingBottom: 100, // Space for FAB
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
    marginBottom: theme.spacing.xxl,
  },
  createButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  createButtonText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  noProjectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
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