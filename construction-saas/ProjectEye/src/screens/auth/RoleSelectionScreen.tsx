// src/screens/auth/RoleSelectionScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { UserRole } from '../../api/types';

export const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const roles = [
    {
      key: 'VIEWER' as UserRole,
      title: 'Field Worker',
      subtitle: 'Construction Worker / Laborer',
      description: 'Perfect for daily workers who need to track their work progress and expenses',
      icon: 'hammer-outline',
      color: '#10B981',
      features: [
        'Daily work tracking',
        'Photo uploads',
        'Expense recording',
        'Simple interface'
      ]
    },
    {
      key: 'CONTRACTOR' as UserRole,
      title: 'Contractor',
      subtitle: 'Supervisor / Site Manager',
      description: 'Ideal for contractors managing multiple workers and coordinating with project owners',
      icon: 'construct-outline',
      color: '#3B82F6',
      features: [
        'Team coordination',
        'Progress reporting',
        'Financial tracking',
        'Document management'
      ]
    },
    {
      key: 'OWNER' as UserRole,
      title: 'Project Owner',
      subtitle: 'Manager / Developer',
      description: 'Complete project management for owners, developers, and project managers',
      icon: 'business-outline',
      color: '#EF4444',
      features: [
        'Full project control',
        'Team management',
        'Financial oversight',
        'Analytics & reports'
      ]
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // Navigate to role-based login screen
    navigation.navigate('RoleBasedLogin', { role: selectedRole });
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const renderRoleCard = (role: typeof roles[0], index: number) => (
    <Animated.View 
      key={role.key}
      style={[
        styles.roleCard,
        selectedRole === role.key && styles.roleCardActive,
        { 
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }
      ]}
    >
      <TouchableOpacity
        style={styles.roleCardTouchable}
        onPress={() => handleRoleSelect(role.key)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.roleCardHeader}>
          <View style={[
            styles.roleIconContainer,
            { backgroundColor: `${role.color}15` },
            selectedRole === role.key && { backgroundColor: `${role.color}25` }
          ]}>
            <Ionicons 
              name={role.icon as any} 
              size={32} 
              color={selectedRole === role.key ? role.color : '#6B7280'} 
            />
          </View>
          
          {selectedRole === role.key && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color={role.color} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.roleCardContent}>
          <Text style={[
            styles.roleTitle,
            selectedRole === role.key && { color: role.color }
          ]}>
            {role.title}
          </Text>
          <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
          <Text style={styles.roleDescription}>{role.description}</Text>
          
          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Key Features:</Text>
            {role.features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <View style={[
                  styles.featureDot,
                  { backgroundColor: selectedRole === role.key ? role.color : '#D1D5DB' }
                ]} />
                <Text style={[
                  styles.featureText,
                  selectedRole === role.key && { color: '#1F2937' }
                ]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="construct" size={28} color={theme.colors.accent} />
          </View>
          <Text style={styles.appTitle}>ProjectEye</Text>
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.welcomeTitle}>Choose Your Role</Text>
          <Text style={styles.welcomeSubtitle}>
            Select the option that best describes your work to get a personalized experience
          </Text>
        </View>
      </Animated.View>

      {/* Role Cards */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {roles.map((role, index) => renderRoleCard(role, index))}
      </ScrollView>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.continueButtonText,
            !selectedRole && styles.continueButtonTextDisabled
          ]}>
            Continue to Login
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={!selectedRole ? '#9CA3AF' : '#FFFFFF'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </Animated.View>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  roleCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  roleCardActive: {
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.2,
  },
  roleCardTouchable: {
    padding: 24,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCardContent: {
    
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  roleDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresContainer: {
    
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  continueButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.gray200,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
    marginRight: 8,
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});