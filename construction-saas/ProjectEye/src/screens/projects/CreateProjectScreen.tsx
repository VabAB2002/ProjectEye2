import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { projectApi } from '../../api/endpoints/project.api';
import { useProjectStore } from '../../store/project.store';

export const CreateProjectScreen: React.FC = () => {
  const navigation = useNavigation();
  const { fetchProjects } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'RESIDENTIAL' as 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL',
    description: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
    },
    startDate: new Date(),
    estimatedEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    totalBudget: '',
  });

  const projectTypes = [
    { label: 'Residential', value: 'RESIDENTIAL', icon: 'home-outline' },
    { label: 'Commercial', value: 'COMMERCIAL', icon: 'business-outline' },
    { label: 'Industrial', value: 'INDUSTRIAL', icon: 'construct-outline' },
  ];

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter project name');
      return false;
    }
    if (!formData.address.line1.trim()) {
      Alert.alert('Error', 'Please enter address');
      return false;
    }
    if (!formData.address.city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }
    if (!formData.address.state.trim()) {
      Alert.alert('Error', 'Please enter state');
      return false;
    }
    if (!formData.address.pincode.trim() || !/^[1-9][0-9]{5}$/.test(formData.address.pincode)) {
      Alert.alert('Error', 'Please enter valid 6-digit pincode');
      return false;
    }
    if (!formData.totalBudget || parseFloat(formData.totalBudget) < 1000) {
      Alert.alert('Error', 'Please enter valid budget (minimum ₹1000)');
      return false;
    }
    if (formData.startDate >= formData.estimatedEndDate) {
      Alert.alert('Error', 'End date must be after start date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await projectApi.create({
        ...formData,
        totalBudget: parseFloat(formData.totalBudget),
      });

      if (response.success) {
        Alert.alert('Success', 'Project created successfully', [
          {
            text: 'OK',
            onPress: () => {
              fetchProjects();
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to create project'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>Create Project</Text>
        <Text style={styles.headerSubtitle}>Add a new construction project</Text>
      </View>
    </View>
  );

  const renderProjectTypeSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>Project Type</Text>
      <View style={styles.typeGrid}>
        {projectTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeCard,
              formData.type === type.value && styles.typeCardActive,
            ]}
            onPress={() => setFormData({ ...formData, type: type.value as any })}
            activeOpacity={0.7}
          >
            <View style={[
              styles.typeIconContainer,
              formData.type === type.value && styles.typeIconContainerActive,
            ]}>
              <Ionicons
                name={type.icon as any}
                size={24}
                color={formData.type === type.value ? theme.colors.accent : theme.colors.gray500}
              />
            </View>
            <Text
              style={[
                styles.typeLabel,
                formData.type === type.value && styles.typeLabelActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateSelector = (label: string, date: Date, onPress: () => void) => (
    <View style={styles.dateContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.dateSelector} onPress={onPress}>
        <View style={styles.dateSelectorContent}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.accent} />
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {renderHeader()}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Project Name"
              placeholder="Enter project name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              icon="briefcase-outline"
              variant="filled"
            />

            {renderProjectTypeSelector()}

            <Input
              label="Description"
              placeholder="Enter project description (optional)"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              icon="document-text-outline"
              multiline
              numberOfLines={3}
              style={styles.textArea}
              variant="filled"
            />
          </View>

          {/* Location Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            
            <Input
              label="Address Line 1"
              placeholder="Street address"
              value={formData.address.line1}
              onChangeText={(text) =>
                setFormData({ ...formData, address: { ...formData.address, line1: text } })
              }
              icon="location-outline"
              variant="filled"
            />

            <Input
              label="Address Line 2"
              placeholder="Apartment, suite, etc. (optional)"
              value={formData.address.line2}
              onChangeText={(text) =>
                setFormData({ ...formData, address: { ...formData.address, line2: text } })
              }
              variant="filled"
            />

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Input
                  label="City"
                  placeholder="City"
                  value={formData.address.city}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: { ...formData.address, city: text } })
                  }
                  variant="filled"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="State"
                  placeholder="State"
                  value={formData.address.state}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: { ...formData.address, state: text } })
                  }
                  variant="filled"
                />
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Input
                  label="Pincode"
                  placeholder="6-digit pincode"
                  value={formData.address.pincode}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: { ...formData.address, pincode: text } })
                  }
                  keyboardType="numeric"
                  maxLength={6}
                  variant="filled"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Landmark"
                  placeholder="Nearby landmark (optional)"
                  value={formData.address.landmark}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: { ...formData.address, landmark: text } })
                  }
                  variant="filled"
                />
              </View>
            </View>
          </View>

          {/* Timeline & Budget Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Timeline & Budget</Text>
            
            {renderDateSelector(
              'Start Date',
              formData.startDate,
              () => setShowStartDate(true)
            )}

            {renderDateSelector(
              'Estimated End Date',
              formData.estimatedEndDate,
              () => setShowEndDate(true)
            )}

            <Input
              label="Total Budget"
              placeholder="Enter project budget"
              value={formData.totalBudget}
              onChangeText={(text) => setFormData({ ...formData, totalBudget: text })}
              keyboardType="numeric"
              icon="cash-outline"
              variant="filled"
              helperText="Enter amount in Indian Rupees (₹)"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Create Project"
              onPress={handleSubmit}
              loading={isLoading}
              icon="checkmark-circle-outline"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showStartDate && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartDate(false);
            if (date) {
              setFormData({ ...formData, startDate: date });
            }
          }}
        />
      )}

      {showEndDate && (
        <DateTimePicker
          value={formData.estimatedEndDate}
          mode="date"
          display="default"
          minimumDate={formData.startDate}
          onChange={(event, date) => {
            setShowEndDate(false);
            if (date) {
              setFormData({ ...formData, estimatedEndDate: date });
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  formSection: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  sectionContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.2,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  typeCard: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.gray200,
  },
  typeCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}08`,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  typeIconContainerActive: {
    backgroundColor: `${theme.colors.accent}15`,
  },
  typeLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  typeLabelActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  dateContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.2,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
});
