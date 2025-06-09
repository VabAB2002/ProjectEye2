// src/screens/progress/CreateProgressScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useProgressStore } from '../../store/progress.store';

export const CreateProgressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { projectId } = route.params;
  const { createUpdate } = useProgressStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [formData, setFormData] = useState({
    date: new Date(),
    workDescription: '',
    workersCount: '',
    weatherConditions: 'sunny',
    issues: '',
  });

  const weatherOptions = [
    { label: 'Sunny', value: 'sunny', icon: 'sunny' },
    { label: 'Cloudy', value: 'cloudy', icon: 'cloudy' },
    { label: 'Rainy', value: 'rainy', icon: 'rainy' },
    { label: 'Stormy', value: 'stormy', icon: 'thunderstorm' },
    { label: 'Foggy', value: 'foggy', icon: 'partly-sunny' },
  ];

  const pickImage = async (fromCamera: boolean) => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: !fromCamera,
    };

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync({ ...options, selectionLimit: 10 - photos.length });

    if (!result.canceled) {
      setPhotos([...photos, ...result.assets]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.workDescription.trim()) {
      Alert.alert('Error', 'Please describe the work done today');
      return false;
    }
    if (photos.length === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return false;
    }
    if (formData.date > new Date()) {
      Alert.alert('Error', 'Cannot create update for future date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('date', formData.date.toISOString());
      data.append('workDescription', formData.workDescription);
      data.append('weatherConditions', formData.weatherConditions);
      
      if (formData.workersCount) {
        data.append('workersCount', formData.workersCount);
      }
      if (formData.issues) {
        data.append('issues', formData.issues);
      }

      // Add photos
      photos.forEach((photo, index) => {
        data.append('photos', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: `photo_${index}.jpg`,
        } as any);
      });

      await createUpdate(projectId, data);
      
      Alert.alert('Success', 'Progress update created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to create update'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPhotoSection = () => (
    <View style={styles.photoSection}>
      <Text style={styles.sectionTitle}>Progress Photos *</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => removePhoto(index)}
            >
              <Ionicons name="close-circle" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        
        {photos.length < 10 && (
          <View style={styles.addPhotoContainer}>
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => pickImage(true)}
            >
              <Ionicons name="camera" size={32} color={theme.colors.gray500} />
              <Text style={styles.addPhotoText}>Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => pickImage(false)}
            >
              <Ionicons name="images" size={32} color={theme.colors.gray500} />
              <Text style={styles.addPhotoText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      <Text style={styles.photoHint}>
        {photos.length}/10 photos • Minimum 1 required
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.dateContainer}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.gray500} />
            <Text style={styles.dateText}>
              {formData.date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Work Description - Using direct TextInput for multiline */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Work Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the work completed today..."
            value={formData.workDescription}
            onChangeText={(text) => setFormData({ ...formData, workDescription: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.gray500}
          />
        </View>

        <View style={styles.weatherContainer}>
          <Text style={styles.label}>Weather Conditions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weatherOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.weatherOption,
                  formData.weatherConditions === option.value && styles.weatherOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, weatherConditions: option.value })}
              >
                <Ionicons
                  name={option.icon as any}
                  size={28}
                  color={
                    formData.weatherConditions === option.value
                      ? '#ffffff'
                      : '#6b7280'
                  }
                />
                <Text
                  style={[
                    styles.weatherLabel,
                    formData.weatherConditions === option.value && styles.weatherLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Number of Workers - Using direct TextInput */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Number of Workers (Optional)</Text>
          <TextInput
            style={styles.singleLineInput}
            placeholder="Enter number of workers"
            value={formData.workersCount}
            onChangeText={(text) => setFormData({ ...formData, workersCount: text })}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.gray500}
          />
        </View>

        {/* Issues/Delays - Using direct TextInput for multiline */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Issues/Delays (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any issues or delays faced today..."
            value={formData.issues}
            onChangeText={(text) => setFormData({ ...formData, issues: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.gray500}
          />
        </View>

        {renderPhotoSection()}

        <Button
          title="Submit Progress Update"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        />
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setFormData({ ...formData, date });
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
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  dateContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  inputSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  singleLineInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 48,
  },
  weatherContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weatherOption: {
    alignItems: 'center',
    padding: 16,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    minWidth: 90,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  weatherOptionActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  weatherLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  weatherLabelActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  photoSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addPhotoContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    fontWeight: '500',
  },
  photoHint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});