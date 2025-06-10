// src/screens/auth/LoginScreen.tsx - Updated with registration navigation
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
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/common/Button';
import { theme } from '../../theme';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert('Error', 'Please enter email/phone and password');
      return;
    }

    try {
      await login({ emailOrPhone, password });
    } catch (err: any) {
      Alert.alert(
        'Login Failed',
        err.response?.data?.error?.message || 'Invalid credentials'
      );
    }
  };

  const handleSignUp = () => {
    navigation.navigate('RoleSelection');
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
            <View style={styles.logoContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="construct" size={32} color={theme.colors.accent} />
              </View>
              <Text style={styles.appTitle}>ProjectEye</Text>
              <Text style={styles.appSubtitle}>Construction Management</Text>
            </View>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to access your construction projects
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email or Phone</Text>
              <View style={styles.textInputWrapper}>
                <Ionicons name="person-outline" size={20} color={theme.colors.gray500} style={styles.leftIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email or phone number"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
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
                  value={password}
                  onChangeText={setPassword}
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

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
              fullWidth
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerTextContainer}>
                <Text style={styles.dividerText}>OR</Text>
              </View>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Role-Based Login"
              variant="outline"
              icon="people-outline"
              onPress={() => navigation.navigate('RoleSelection')}
              style={styles.roleLoginButton}
              fullWidth
            />

            <Button
              title="Sign In with Google"
              variant="outline"
              icon="logo-google"
              style={styles.googleButton}
              fullWidth
            />

            <View style={styles.signUpSection}>
              <Text style={styles.signUpText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
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
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${theme.colors.accent}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  welcomeSection: {
    marginBottom: theme.spacing.xxl,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xs,
  },
  forgotPasswordText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: theme.spacing.xl,
  },
  roleLoginButton: {
    marginBottom: theme.spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray200,
  },
  dividerTextContainer: {
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  dividerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  googleButton: {
    marginBottom: theme.spacing.xl,
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  signUpText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  signUpLink: {
    fontSize: 15,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  footerSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
});