import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTeamStore } from '../../store/team.store';
import { AddTeamMemberInput } from '../../api/endpoints/team.api';
import { authApi } from '../../api/endpoints/auth.api';

interface RouteParams {
  projectId: string;
}

export const AddMemberScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params as RouteParams;
  const { addMember, isLoading } = useTeamStore();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'VIEWER' as AddTeamMemberInput['role'],
  });
  const [permissions, setPermissions] = useState({
    canViewFinancials: false,
    canApproveExpenses: false,
    canEditProject: false,
    canAddMembers: false,
    canUploadDocuments: false,
    canCreateMilestones: false,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auto-set permissions based on role
  useEffect(() => {
    switch (formData.role) {
      case 'PROJECT_MANAGER':
        setPermissions({
          canViewFinancials: true,
          canApproveExpenses: true,
          canEditProject: true,
          canAddMembers: true,
          canUploadDocuments: true,
          canCreateMilestones: true,
        });
        break;
      case 'CONTRACTOR':
        setPermissions({
          canViewFinancials: false,
          canApproveExpenses: false,
          canEditProject: false,
          canAddMembers: false,
          canUploadDocuments: true,
          canCreateMilestones: false,
        });
        break;
      case 'SUPERVISOR':
        setPermissions({
          canViewFinancials: true,
          canApproveExpenses: false,
          canEditProject: false,
          canAddMembers: false,
          canUploadDocuments: true,
          canCreateMilestones: true,
        });
        break;
      case 'VIEWER':
        setPermissions({
          canViewFinancials: false,
          canApproveExpenses: false,
          canEditProject: false,
          canAddMembers: false,
          canUploadDocuments: false,
          canCreateMilestones: false,
        });
        break;
    }
  }, [formData.role]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({ ...prev, [permission]: !prev[permission] }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Validation Error', 'First name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      Alert.alert('Validation Error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      // First, create/invite the user
      const inviteData = {
        email: formData.email,
        phone: formData.phone || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        password: formData.password,
        role: formData.role,
      };

      console.log('Creating user with data:', inviteData);
      const userResponse = await authApi.invite(inviteData);
      
      if (!userResponse.success || !userResponse.data?.user) {
        throw new Error('Failed to create user');
      }

      const createdUser = userResponse.data.user;
      console.log('User created successfully:', createdUser.id);

      // Then add the user to the project
      const memberData: AddTeamMemberInput = {
        userId: createdUser.id,
        role: formData.role,
        permissions,
      };

      console.log('Adding member to project with data:', memberData);
      await addMember(projectId, memberData);
      
      Alert.alert(
        'Success', 
        'Team member invited successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error inviting team member:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.message || 
                          'Failed to invite team member. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return '#EF4444';
      case 'PROJECT_MANAGER': return '#0066ff';
      case 'CONTRACTOR': return '#10B981';
      case 'SUPERVISOR': return '#F59E0B';
      case 'VIEWER': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getRoleIcon = (role: string): keyof typeof Ionicons.glyphMap => {
    switch (role) {
      case 'OWNER': return 'star-outline';
      case 'PROJECT_MANAGER': return 'briefcase-outline';
      case 'CONTRACTOR': return 'hammer-outline';
      case 'SUPERVISOR': return 'eye-outline';
      case 'VIEWER': return 'people-outline';
      default: return 'person-outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return 'Owner';
      case 'PROJECT_MANAGER': return 'Project Manager';
      case 'CONTRACTOR': return 'Contractor';
      case 'SUPERVISOR': return 'Supervisor';
      case 'VIEWER': return 'Viewer';
      default: return role;
    }
  };

  const roles = [
    { value: 'VIEWER', label: 'Viewer', description: 'Read-only access to project information' },
    { value: 'CONTRACTOR', label: 'Contractor', description: 'Can upload documents and track progress' },
    { value: 'SUPERVISOR', label: 'Supervisor', description: 'Can manage milestones and view financials' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Full access except ownership transfer' },
  ];

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

  const renderMemberInfo = () => (
    renderSection('Member Information', 'person-outline', (
      <View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>First Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            placeholder="Enter first name"
            placeholderTextColor={theme.colors.gray400}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            placeholder="Enter last name"
            placeholderTextColor={theme.colors.gray400}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="member@example.com"
            placeholderTextColor={theme.colors.gray400}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            placeholder="+91xxxxxxxxxx"
            placeholderTextColor={theme.colors.gray400}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Enter secure password"
            placeholderTextColor={theme.colors.gray400}
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.passwordHint}>
            Must be 8+ characters with uppercase, lowercase, and number
          </Text>
        </View>
      </View>
    ))
  );

  const renderRoleSelection = () => (
    renderSection('Role Assignment', 'briefcase-outline', (
      <View>
        <Text style={styles.sectionDescription}>
          Select the role that best matches their responsibilities
        </Text>
        
        {roles.map((role) => (
          <TouchableOpacity
            key={role.value}
            style={[
              styles.roleCard,
              formData.role === role.value && styles.roleCardActive,
            ]}
            onPress={() => handleInputChange('role', role.value)}
            activeOpacity={0.7}
          >
            <View style={styles.roleHeader}>
              <View style={[
                styles.roleIconContainer,
                formData.role === role.value && { backgroundColor: `${getRoleColor(role.value)}15` },
              ]}>
                <Ionicons 
                  name={getRoleIcon(role.value)} 
                  size={20} 
                  color={formData.role === role.value ? getRoleColor(role.value) : theme.colors.gray500} 
                />
              </View>
              <View style={styles.roleInfo}>
                <Text style={[
                  styles.roleLabel,
                  formData.role === role.value && { color: getRoleColor(role.value) },
                ]}>
                  {role.label}
                </Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
              {formData.role === role.value && (
                <Ionicons name="checkmark-circle" size={24} color={getRoleColor(role.value)} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    ))
  );

  const renderPermissions = () => {
    const permissionItems = [
      { key: 'canViewFinancials', label: 'View Financials', description: 'Access financial reports and budgets' },
      { key: 'canApproveExpenses', label: 'Approve Expenses', description: 'Approve expense claims and purchases' },
      { key: 'canEditProject', label: 'Edit Project', description: 'Modify project settings and details' },
      { key: 'canAddMembers', label: 'Manage Team', description: 'Add and remove team members' },
      { key: 'canUploadDocuments', label: 'Upload Documents', description: 'Upload files and progress photos' },
      { key: 'canCreateMilestones', label: 'Manage Milestones', description: 'Create and update project milestones' },
    ];

    return renderSection('Permissions', 'shield-checkmark-outline', (
      <View>
        <Text style={styles.sectionDescription}>
          Fine-tune what this member can do (automatically set based on role)
        </Text>
        
        {permissionItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.permissionItem}
            onPress={() => handlePermissionToggle(item.key as keyof typeof permissions)}
            activeOpacity={0.7}
          >
            <View style={styles.permissionContent}>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionLabel}>{item.label}</Text>
                <Text style={styles.permissionDescription}>{item.description}</Text>
              </View>
              <View style={[
                styles.permissionToggle,
                permissions[item.key as keyof typeof permissions] && styles.permissionToggleActive
              ]}>
                {permissions[item.key as keyof typeof permissions] && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.background} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Team Member</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderMemberInfo()}
          {renderRoleSelection()}
          {renderPermissions()}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Inviting...' : 'Send Invitation'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  passwordHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  roleCard: {
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  roleCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}05`,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  permissionItem: {
    marginBottom: 16,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionInfo: {
    flex: 1,
    marginRight: 12,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  permissionToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionToggleActive: {
    backgroundColor: theme.colors.accent,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.gray100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    height: 48,
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
});