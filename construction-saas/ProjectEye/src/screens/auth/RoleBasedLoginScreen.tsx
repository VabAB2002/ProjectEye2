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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/common/Button';
import { theme } from '../../theme';
import { UserRole } from '../../api/types';

interface RouteParams {
  role: UserRole;
}

interface LoginFormData {
  emailOrPhone: string;
  password: string;
  companyName?: string;
  licenseNumber?: string;
  budgetRange?: string;
}

export const RoleBasedLoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { role } = route.params as RouteParams;
  const { roleBasedLogin, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    emailOrPhone: '',
    password: '',
    companyName: '',
    licenseNumber: '',
    budgetRange: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const getRoleInfo = () => {
    switch (role) {
      case 'VIEWER':
        return {
          title: 'Field Worker Login',
          subtitle: 'Sign in to track your daily work and progress',
          icon: 'hammer-outline',
          color: '#10B981',
        };
      case 'CONTRACTOR':
        return {
          title: 'Contractor Login',
          subtitle: 'Access your projects and team management tools',
          icon: 'construct-outline',
          color: '#3B82F6',
        };
      case 'OWNER':
        return {
          title: 'Project Owner Login',
          subtitle: 'Manage your projects and monitor progress',
          icon: 'business-outline',
          color: '#8B5CF6',
        };
      default:
        return {
          title: 'Login',
          subtitle: 'Sign in to your account',
          icon: 'person-outline',
          color: theme.colors.accent,
        };
    }
  };

  const roleInfo = getRoleInfo();

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.emailOrPhone || !formData.password) {
      Alert.alert('Error', 'Please enter email/phone and password');
      return false;
    }

    if (role === 'CONTRACTOR' && !formData.companyName) {
      Alert.alert('Error', 'Company name is required for contractors');
      return false;
    }

    if (role === 'OWNER' && !formData.companyName) {
      Alert.alert('Error', 'Company name is required for project owners');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await roleBasedLogin({
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
        role,
        ...(role === 'CONTRACTOR' && {
          companyName: formData.companyName,
          licenseNumber: formData.licenseNumber,
        }),
        ...(role === 'OWNER' && {
          companyName: formData.companyName,
          budgetRange: formData.budgetRange,
        }),
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Login failed';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const renderFieldWorkerForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email or Phone</Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="person-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email or phone number"
            value={formData.emailOrPhone}
            onChangeText={(value) => handleInputChange('emailOrPhone', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={theme.colors.gray500}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            placeholderTextColor={theme.colors.gray500}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={theme.colors.gray500} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderContractorForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email or Phone</Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="person-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email or phone number"
            value={formData.emailOrPhone}
            onChangeText={(value) => handleInputChange('emailOrPhone', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={theme.colors.gray500}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            placeholderTextColor={theme.colors.gray500}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={theme.colors.gray500} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Company Name <Text style={styles.required}>*</Text></Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="business-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your company name"
            value={formData.companyName}
            onChangeText={(value) => handleInputChange('companyName', value)}
            placeholderTextColor={theme.colors.gray500}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>License Number</Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="document-text-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your license number (optional)"
            value={formData.licenseNumber}
            onChangeText={(value) => handleInputChange('licenseNumber', value)}
            placeholderTextColor={theme.colors.gray500}
          />
        </View>
      </View>
    </View>
  );

  const renderOwnerForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email or Phone</Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="person-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email or phone number"
            value={formData.emailOrPhone}
            onChangeText={(value) => handleInputChange('emailOrPhone', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={theme.colors.gray500}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            placeholderTextColor={theme.colors.gray500}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={theme.colors.gray500} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Company Name <Text style={styles.required}>*</Text></Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="business-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your company name"
            value={formData.companyName}
            onChangeText={(value) => handleInputChange('companyName', value)}
            placeholderTextColor={theme.colors.gray500}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Budget Range</Text>
        <View style={styles.textInputWrapper}>
          <Ionicons name="cash-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter project budget range (optional)"
            value={formData.budgetRange}
            onChangeText={(value) => handleInputChange('budgetRange', value)}
            placeholderTextColor={theme.colors.gray500}
          />
        </View>
      </View>
    </View>
  );

  const renderForm = () => {
    switch (role) {
      case 'VIEWER':
        return renderFieldWorkerForm();
      case 'CONTRACTOR':
        return renderContractorForm();
      case 'OWNER':
        return renderOwnerForm();
      default:
        return renderFieldWorkerForm();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.roleHeader}>
              <View style={[styles.roleIconContainer, { backgroundColor: `${roleInfo.color}15` }]}>
                <Ionicons name={roleInfo.icon as any} size={32} color={roleInfo.color} />
              </View>
              <Text style={styles.roleTitle}>{roleInfo.title}</Text>
              <Text style={styles.roleSubtitle}>{roleInfo.subtitle}</Text>
            </View>
          </View>

          {/* Form Section */}
          {renderForm()}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={[styles.loginButton, { backgroundColor: roleInfo.color }]}
            fullWidth
          />

          {/* Alternative Actions */}
          <View style={styles.alternativeSection}>
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
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
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  headerSection: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  roleHeader: {
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  roleTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  roleSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  formSection: {
    marginBottom: theme.spacing.xl,
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
  required: {
    color: '#EF4444',
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  rightIcon: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  loginButton: {
    marginBottom: theme.spacing.xl,
  },
  alternativeSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  forgotPasswordText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});