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
  TextInput,
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
  const [inputErrors, setInputErrors] = useState<{[key: string]: string}>({});

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
    { 
      label: 'Residential', 
      value: 'RESIDENTIAL', 
      icon: 'home-outline',
      description: 'Houses, Apartments'
    },
    { 
      label: 'Commercial', 
      value: 'COMMERCIAL', 
      icon: 'business-outline',
      description: 'Offices, Shops'
    },
    { 
      label: 'Industrial', 
      value: 'INDUSTRIAL', 
      icon: 'construct-outline',
      description: 'Factories, Warehouses'
    },
  ];

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }
    if (!formData.address.line1.trim()) {
      errors.line1 = 'Address is required';
    }
    if (!formData.address.city.trim()) {
      errors.city = 'City is required';
    }
    if (!formData.address.state.trim()) {
      errors.state = 'State is required';
    }
    if (!formData.address.pincode.trim() || !/^[1-9][0-9]{5}$/.test(formData.address.pincode)) {
      errors.pincode = 'Enter valid 6-digit pincode';
    }
    if (!formData.totalBudget || parseFloat(formData.totalBudget) < 1000) {
      errors.totalBudget = 'Enter valid budget (minimum ₹1,000)';
    }
    if (formData.startDate >= formData.estimatedEndDate) {
      errors.endDate = 'End date must be after start date';
    }

    setInputErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      Alert.alert('Please fix the following', firstError);
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
        Alert.alert('Success!', 'Project created successfully', [
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

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    const number = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return '';
    return `₹${number.toLocaleString('en-IN')}`;
  };



  const renderProjectTypeSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>Project Type *</Text>
      <Text style={styles.sectionHelper}>Choose the type of construction project</Text>
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
                size={28}
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
            <Text
              style={[
                styles.typeDescription,
                formData.type === type.value && styles.typeDescriptionActive,
              ]}
            >
              {type.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateSelector = (
    label: string, 
    date: Date, 
    onPress: () => void, 
    isRequired: boolean = false,
    helper?: string,
    error?: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      {helper && <Text style={styles.inputHelper}>{helper}</Text>}
      <TouchableOpacity 
        style={[
          styles.dateSelector,
          error && styles.dateErrorBorder
        ]} 
        onPress={onPress}
      >
        <View style={styles.dateSelectorContent}>
          <View style={styles.dateIconContainer}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.accent} />
          </View>
          <Text style={styles.dateText}>{date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={14} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Project Type Section */}
          <View style={styles.formSection}>
            {renderProjectTypeSelector()}
          </View>

          {/* Basic Information Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.accent} />
              {' '}Basic Information
            </Text>
            
            <Input
              label="Project Name"
              placeholder="Enter your project name"
              value={formData.name}
              onChangeText={(text) => {
                setFormData({ ...formData, name: text });
                if (inputErrors.name) {
                  setInputErrors({ ...inputErrors, name: '' });
                }
              }}
              icon="briefcase-outline"
              variant="filled"
              error={inputErrors.name}
              autoCapitalize="words"
            />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Project Description</Text>
              <Text style={styles.inputHelper}>Brief overview of the project (optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your project, objectives, special requirements..."
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={theme.colors.gray500}
                autoCapitalize="sentences"
              />
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="location-outline" size={20} color={theme.colors.accent} />
              {' '}Project Location
            </Text>
            
            <Input
              label="Address Line 1"
              placeholder="Street address, building number"
              value={formData.address.line1}
              onChangeText={(text) => {
                setFormData({ ...formData, address: { ...formData.address, line1: text } });
                if (inputErrors.line1) {
                  setInputErrors({ ...inputErrors, line1: '' });
                }
              }}
              icon="home-outline"
              variant="filled"
              error={inputErrors.line1}
              autoCapitalize="words"
            />

            <Input
              label="Address Line 2"
              placeholder="Apartment, suite, floor (optional)"
              value={formData.address.line2}
              onChangeText={(text) =>
                setFormData({ ...formData, address: { ...formData.address, line2: text } })
              }
              variant="filled"
              autoCapitalize="words"
            />

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Input
                  label="City"
                  placeholder="Enter city"
                  value={formData.address.city}
                  onChangeText={(text) => {
                    setFormData({ ...formData, address: { ...formData.address, city: text } });
                    if (inputErrors.city) {
                      setInputErrors({ ...inputErrors, city: '' });
                    }
                  }}
                  variant="filled"
                  error={inputErrors.city}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="State"
                  placeholder="Enter state"
                  value={formData.address.state}
                  onChangeText={(text) => {
                    setFormData({ ...formData, address: { ...formData.address, state: text } });
                    if (inputErrors.state) {
                      setInputErrors({ ...inputErrors, state: '' });
                    }
                  }}
                  variant="filled"
                  error={inputErrors.state}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Input
                  label="Pincode"
                  placeholder="6-digit pincode"
                  value={formData.address.pincode}
                  onChangeText={(text) => {
                    setFormData({ ...formData, address: { ...formData.address, pincode: text } });
                    if (inputErrors.pincode) {
                      setInputErrors({ ...inputErrors, pincode: '' });
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                  variant="filled"
                  error={inputErrors.pincode}
                  autoCorrect={false}
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Landmark"
                  placeholder="Nearby landmark"
                  value={formData.address.landmark}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: { ...formData.address, landmark: text } })
                  }
                  variant="filled"
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Timeline & Budget Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="time-outline" size={20} color={theme.colors.accent} />
              {' '}Timeline & Budget
            </Text>
            
            {renderDateSelector(
              'Project Start Date',
              formData.startDate,
              () => setShowStartDate(true),
              true,
              'When will construction begin?'
            )}

            {renderDateSelector(
              'Estimated Completion Date',
              formData.estimatedEndDate,
              () => setShowEndDate(true),
              true,
              'Expected project completion date',
              inputErrors.endDate
            )}

            <Input
              label="Project Budget"
              placeholder="Enter total project budget"
              value={formData.totalBudget ? formatCurrency(formData.totalBudget) : ''}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                setFormData({ ...formData, totalBudget: numericValue });
                if (inputErrors.totalBudget) {
                  setInputErrors({ ...inputErrors, totalBudget: '' });
                }
              }}
              keyboardType="numeric"
              icon="cash-outline"
              variant="filled"
              helperText="Enter total budget in Indian Rupees (₹)"
              error={inputErrors.totalBudget}
              autoCorrect={false}
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
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
          value={formData.estimatedEndDate}
          mode="date"
          display="default"
          minimumDate={new Date(formData.startDate.getTime() + 24 * 60 * 60 * 1000)}
          onChange={(event, date) => {
            setShowEndDate(false);
            if (date) {
              setFormData({ ...formData, estimatedEndDate: date });
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

  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: theme.colors.background,
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
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  sectionContainer: {
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.2,
  },
  sectionHelper: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: theme.spacing.md,
    lineHeight: 16,
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
  typeDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  typeDescriptionActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    fontWeight: '500',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.2,
  },
  inputHelper: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },
  required: {
    color: theme.colors.error,
    fontWeight: '600',
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
  dateIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  dateErrorBorder: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  cancelButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
