// src/screens/progress/ProgressDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Share,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useProgressStore } from '../../store/progress.store';
import { useProjectStore } from '../../store/project.store';

interface RouteParams {
  projectId: string;
  updateId: string;
}

export const ProgressDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { projectId, updateId } = route.params as RouteParams;
  const { updates, isLoading } = useProgressStore();
  const { projects } = useProjectStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Find the specific update from the store
  const progressUpdate = updates.find(update => update.id === updateId);
  
  // Find the project name
  const currentProject = projects.find(project => project.id === projectId);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!progressUpdate) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Update Not Found</Text>
          <Text style={styles.emptyText}>
            The progress update you're looking for could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      const date = new Date(progressUpdate.date).toLocaleDateString();
      const message = `Progress Update - ${date}\n\n${progressUpdate.workDescription}`;
      
      await Share.share({
        message,
        title: 'Construction Progress Update',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dayNumber: date.getDate(),
      monthYear: date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),
      fullDate: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  const getWeatherIcon = (weather: string): keyof typeof Ionicons.glyphMap => {
    switch (weather?.toLowerCase()) {
      case 'sunny': return 'sunny';
      case 'cloudy': return 'cloudy';
      case 'rainy': return 'rainy';
      case 'stormy': return 'thunderstorm';
      default: return 'partly-sunny';
    }
  };

  const getWeatherColor = (weather: string) => {
    switch (weather?.toLowerCase()) {
      case 'sunny': return '#F59E0B';
      case 'cloudy': return '#6B7280';
      case 'rainy': return '#3B82F6';
      case 'stormy': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const renderSection = (title: string, icon: keyof typeof Ionicons.glyphMap, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name={icon} size={18} color={theme.colors.accent} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderProgressOverview = () => {
    const dateInfo = formatDate(progressUpdate.date);
    
    return renderSection('Progress Overview', 'calendar-outline', (
      <View style={styles.progressOverview}>
        {/* Date Display */}
        <View style={styles.dateDisplayContainer}>
          <Text style={styles.dateLabel}>Progress Date</Text>
          <Text style={styles.dateValue}>{dateInfo.fullDate}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsGrid}>
          {/* Weather Card */}
          {progressUpdate.weatherConditions && (
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: `${getWeatherColor(progressUpdate.weatherConditions)}15` }]}>
                <Ionicons 
                  name={getWeatherIcon(progressUpdate.weatherConditions)} 
                  size={20} 
                  color={getWeatherColor(progressUpdate.weatherConditions)} 
                />
              </View>
              <Text style={styles.quickStatLabel}>Weather</Text>
              <Text style={styles.quickStatValue}>{progressUpdate.weatherConditions}</Text>
            </View>
          )}

          {/* Workers Card */}
          {progressUpdate.workersCount && (
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: '#10B98115' }]}>
                <Ionicons name="people" size={20} color="#10B981" />
              </View>
              <Text style={styles.quickStatLabel}>Workers</Text>
              <Text style={styles.quickStatValue}>{progressUpdate.workersCount}</Text>
            </View>
          )}

          {/* Photos Card */}
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: '#EF444415' }]}>
              <Ionicons name="camera" size={20} color="#EF4444" />
            </View>
            <Text style={styles.quickStatLabel}>Photos</Text>
            <Text style={styles.quickStatValue}>{progressUpdate.photos?.length || 0}</Text>
          </View>
        </View>
      </View>
    ));
  };

  const renderWorkDescription = () => {
    return renderSection('Work Description', 'document-text-outline', (
      <View style={styles.workDescriptionContainer}>
        <Text style={styles.workDescription}>
          {progressUpdate.workDescription}
        </Text>
      </View>
    ));
  };

  const renderPhotoGallery = () => {
    if (!progressUpdate.photos || progressUpdate.photos.length === 0) {
      return (
        <View style={styles.noPhotosContainer}>
          <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          <Text style={styles.noPhotosText}>No photos available</Text>
        </View>
      );
    }

    return (
      <View style={styles.photoGallery}>
        {progressUpdate.photos.map((photo: any, index: number) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoContainer}
            onPress={() => setSelectedImageIndex(index)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: photo.thumbnailUrl || photo.fileUrl }}
              style={styles.photoThumbnail}
              resizeMode="cover"
            />
            <View style={styles.photoOverlay}>
              <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAdditionalDetails = () => {
    if (!progressUpdate.materialsUsed && !progressUpdate.equipmentUsed && !progressUpdate.issues) {
      return null;
    }

    return renderSection('Additional Details', 'information-circle-outline', (
      <View style={styles.additionalDetails}>
        {progressUpdate.materialsUsed && (
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="cube-outline" size={16} color="#6B7280" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Materials Used</Text>
              <Text style={styles.detailValue}>{progressUpdate.materialsUsed}</Text>
            </View>
          </View>
        )}

        {progressUpdate.equipmentUsed && (
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="build-outline" size={16} color="#6B7280" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Equipment Used</Text>
              <Text style={styles.detailValue}>{progressUpdate.equipmentUsed}</Text>
            </View>
          </View>
        )}

        {progressUpdate.issues && (
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="warning-outline" size={16} color="#EF4444" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Issues/Challenges</Text>
              <Text style={styles.detailValue}>{progressUpdate.issues}</Text>
            </View>
          </View>
        )}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {currentProject?.name || 'Progress Details'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Daily construction progress tracking
            </Text>
          </View>

          {/* Progress Overview */}
          {renderProgressOverview()}

          {/* Work Description */}
          {renderWorkDescription()}

          {/* Progress Photos */}
          {renderSection('Progress Photos', 'camera-outline', renderPhotoGallery())}

          {/* Additional Details */}
          {renderAdditionalDetails()}

          {/* Update Information */}
          {renderSection('Update Information', 'time-outline', (
            <View style={styles.updateInfoContainer}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Created</Text>
                  <Text style={styles.infoValue}>
                    {new Date(progressUpdate.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Updated</Text>
                  <Text style={styles.infoValue}>
                    {new Date(progressUpdate.updatedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Full Screen Image Modal */}
      {selectedImageIndex !== null && progressUpdate.photos && (
        <View style={styles.imageModal}>
          <TouchableOpacity 
            style={styles.imageModalOverlay}
            onPress={() => setSelectedImageIndex(null)}
            activeOpacity={1}
          >
            <Image
              source={{ 
                uri: progressUpdate.photos[selectedImageIndex]?.fileUrl || 
                     progressUpdate.photos[selectedImageIndex]?.thumbnailUrl 
              }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedImageIndex(null)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - 48 - 8) / 2; // Account for padding and gap

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header Styles (matching Financial Management)
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },

  // Section Styles (matching Financial Management)
  section: {
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
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Progress Overview Styles
  progressOverview: {
    
  },
  dateDisplayContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Work Description
  workDescriptionContainer: {
    
  },
  workDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '400',
  },

  // Photo Gallery
  photoGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotosContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noPhotosText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },

  // Additional Details
  additionalDetails: {
    
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Update Information
  updateInfoContainer: {
    
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Full Screen Image Modal
  imageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imageModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty States
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});