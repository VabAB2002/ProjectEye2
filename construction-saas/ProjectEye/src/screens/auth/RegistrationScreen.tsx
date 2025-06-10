// src/screens/auth/RegistrationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/common/Button';
import { theme } from '../../theme';
import { UserRole, RegistrationInput } from '../../api/types';

interface RouteParams {
  role: UserRole;
}

export const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { role } = route.params as RouteParams;
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inputErrors, setInputErrors] = useState<{[key: string]: string}>({});

  // Base form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Role-specific fields
    companyName: '', // For CONTRACTOR and OWNER
    licenseNumber: '', // For CONTRACTOR (optional)
    projectBudgetRange: 'UNDER_10L' as 'UNDER_10L' | '10L_50L' | '50L_1CR' | 'ABOVE_1CR', // For OWNER
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (inputErrors[field]) {
      setInputErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Base validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[+]?[1-9][\d\s\-\(\)]{7,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if ((role === 'CONTRACTOR' || role === 'OWNER') && !formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }

    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      const firstError = Object.values(inputErrors)[0];
      Alert.alert('Please fix the following', firstError);
      return;
    }

    try {
      // Prepare registration data based on role
      let registrationData: RegistrationInput;

      switch (role) {
        case 'VIEWER':
          registrationData = {
            role: 'VIEWER',
            firstName: formData.firstName,
            lastName: formData.lastName || undefined,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          };
          break;
        
        case 'CONTRACTOR':
          registrationData = {
            role: 'CONTRACTOR',
            firstName: formData.firstName,
            lastName: formData.lastName || undefined,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            companyName: formData.companyName,
            licenseNumber: formData.licenseNumber || undefined,
          };
          break;
        
        case 'OWNER':
          registrationData = {
            role: 'OWNER',
            firstName: formData.firstName,
            lastName: formData.lastName || undefined,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            companyName: formData.companyName,
            projectBudgetRange: formData.projectBudgetRange,
          };
          break;
        
        default:
          throw new Error('Invalid role selected');
      }

      await register(registrationData);
      
      // Success - user will be automatically logged in and redirected
    } catch (err: any) {
      Alert.alert(
        'Registration Failed',
        err.response?.data?.error?.message || 'Failed to create account. Please try again.'
      );
    }
  };

  const getRoleInfo = () => {
    switch (role) {
      case 'VIEWER':
        return {
          title: 'Field Worker Registration',
          subtitle: 'Join as a construction worker',
          icon: 'hammer-outline',
          color: '#10B981'
        };
      case 'CONTRACTOR':
        return {
          title: 'Contractor Registration',
          subtitle: 'Join as a contractor or supervisor',
          icon: 'construct-outline',
          color: '#3B82F6'
        };
      case 'OWNER':
        return {
          title: 'Project Owner Registration',
          subtitle: 'Join as a project owner or manager',
          icon: 'business-outline',
          color: '#EF4444'
        };
      default:
        return {
          title: 'Registration',
          subtitle: 'Create your account',
          icon: 'person-outline',
          color: theme.colors.accent
        };
    }
  };

  const roleInfo = getRoleInfo();

  const renderInputField = (
    label: string,
    field: string,
    placeholder: string,
    options?: {
      keyboardType?: any;
      secureTextEntry?: boolean;
      showPasswordToggle?: boolean;
      required?: boolean;
      multiline?: boolean;
    }
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {options?.required !== false && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={[
        styles.textInputWrapper,
        inputErrors[field] && styles.textInputError
      ]}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={formData[field as keyof typeof formData]}
          onChangeText={(text) => handleInputChange(field, text)}
          keyboardType={options?.keyboardType || 'default'}
          secureTextEntry={options?.secureTextEntry}
          placeholderTextColor={theme.colors.gray500}
          autoCapitalize={field === 'email' ? 'none' : 'words'}
          autoCorrect={false}
          multiline={options?.multiline}
        />
        {options?.showPasswordToggle && (
          <TouchableOpacity
            onPress={() => {
              if (field === 'password') {
                setShowPassword(!showPassword);
              } else if (field === 'confirmPassword') {
                setShowConfirmPassword(!showConfirmPassword);
              }
            }}
            style={styles.passwordToggle}
          >
            <Ionicons 
              name={
                (field === 'password' && showPassword) || 
                (field === 'confirmPassword' && showConfirmPassword)
                  ? 'eye-off-outline' 
                  : 'eye-outline'
              } 
              size={20} 
              color={theme.colors.gray500} 
            />
          </TouchableOpacity>
        )}
      </View>
      {inputErrors[field] && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={14} color={theme.colors.error} />
          <Text style={styles.errorText}>{inputErrors[field]}</Text>
        </View>
      )}
    </View>
  );

  const renderBudgetRangeSelector = () => {
    if (role !== 'OWNER') return null;

    const budgetOptions = [
      { value: 'UNDER_10L', label: 'Under ₹10 Lakhs' },
      { value: '10L_50L', label: '₹10L - ₹50L' },
      { value: '50L_1CR', label: '₹50L - ₹1 Crore' },
      { value: 'ABOVE_1CR', label: 'Above ₹1 Crore' },
    ];

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Typical Project Budget Range <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.inputHelper}>This helps us customize your experience</Text>
        <View style={styles.budgetGrid}>
          {budgetOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.budgetOption,
                formData.projectBudgetRange === option.value && styles.budgetOptionActive
              ]}
              onPress={() => handleInputChange('projectBudgetRange', option.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.budgetOptionText,
                formData.projectBudgetRange === option.value && styles.budgetOptionTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={[styles.roleIconContainer, { backgroundColor: `${roleInfo.color}15` }]}>
            <Ionicons name={roleInfo.icon as any} size={24} color={roleInfo.color} />
          </View>
          <Text style={styles.headerTitle}>{roleInfo.title}</Text>
          <Text style={styles.headerSubtitle}>{roleInfo.subtitle}</Text>
        </View>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {renderInputField('First Name', 'firstName', 'Enter your first name')}
            {renderInputField('Last Name', 'lastName', 'Enter your last name', { required: false })}
            {renderInputField('Email Address', 'email', 'your.email@example.com', { keyboardType: 'email-address' })}
            {renderInputField('Phone Number', 'phone', '+1 (555) 123-4567', { keyboardType: 'phone-pad' })}
          </View>

          {/* Company Information (for Contractors and Owners) */}
          {(role === 'CONTRACTOR' || role === 'OWNER') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {role === 'CONTRACTOR' ? 'Contractor Information' : 'Company Information'}
              </Text>
              
              {renderInputField(
                role === 'CONTRACTOR' ? 'Company/Business Name' : 'Company Name',
                'companyName',
                'Enter your company name'
              )}
              
              {role === 'CONTRACTOR' && renderInputField(
                'License Number',
                'licenseNumber',
                'Enter license number (optional)',
                { required: false }
              )}
              
              {renderBudgetRangeSelector()}
            </View>
          )}

          {/* Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            
            {renderInputField(
              'Password',
              'password',
              'Create a strong password',
              { 
                secureTextEntry: !showPassword,
                showPasswordToggle: true
              }
            )}
            {renderInputField(
              'Confirm Password',
              'confirmPassword',
              'Confirm your password',
              { 
                secureTextEntry: !showConfirmPassword,
                showPasswordToggle: true
              }
            )}
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
            fullWidth
          />

          <View style={styles.loginSection}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
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
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  headerContent: {
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputHelper: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  required: {
    color: theme.colors.error,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  textInputError: {
    borderColor: theme.colors.error,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  budgetGrid: {
    gap: 12,
  },
  budgetOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    alignItems: 'center',
  },
  budgetOptionActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}08`,
  },
  budgetOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  budgetOptionTextActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginLeft: 6,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: 32,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  loginText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  loginLink: {
    fontSize: 15,
    color: theme.colors.accent,
    fontWeight: '600',
  },
});