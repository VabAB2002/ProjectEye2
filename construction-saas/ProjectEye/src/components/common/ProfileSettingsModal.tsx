import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/auth.store';

interface ProfileSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'account' | 'about'>('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailAlerts: false,
    pushNotifications: true,
    darkMode: false,
    language: 'English',
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update API call
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    // TODO: Implement password change API call
    Alert.alert('Success', 'Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const renderSectionButton = (
    section: typeof activeSection,
    title: string,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <TouchableOpacity
      style={[
        styles.sectionButton,
        activeSection === section && styles.sectionButtonActive
      ]}
      onPress={() => setActiveSection(section)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeSection === section ? theme.colors.accent : theme.colors.gray500} 
      />
      <Text style={[
        styles.sectionButtonText,
        activeSection === section && styles.sectionButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profile Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>First Name</Text>
        <TextInput
          style={styles.textInput}
          value={profileForm.firstName}
          onChangeText={(value) => setProfileForm(prev => ({ ...prev, firstName: value }))}
          placeholder="Enter first name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Last Name</Text>
        <TextInput
          style={styles.textInput}
          value={profileForm.lastName}
          onChangeText={(value) => setProfileForm(prev => ({ ...prev, lastName: value }))}
          placeholder="Enter last name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.textInput}
          value={profileForm.email}
          onChangeText={(value) => setProfileForm(prev => ({ ...prev, email: value }))}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone</Text>
        <TextInput
          style={styles.textInput}
          value={profileForm.phone}
          onChangeText={(value) => setProfileForm(prev => ({ ...prev, phone: value }))}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreferencesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>App Preferences</Text>
      
      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceLabel}>Push Notifications</Text>
          <Text style={styles.preferenceDescription}>Receive notifications about project updates</Text>
        </View>
        <Switch
          value={preferences.pushNotifications}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, pushNotifications: value }))}
          trackColor={{ false: theme.colors.gray300, true: theme.colors.accent }}
        />
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceLabel}>Email Alerts</Text>
          <Text style={styles.preferenceDescription}>Get email notifications for important updates</Text>
        </View>
        <Switch
          value={preferences.emailAlerts}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, emailAlerts: value }))}
          trackColor={{ false: theme.colors.gray300, true: theme.colors.accent }}
        />
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceLabel}>Dark Mode</Text>
          <Text style={styles.preferenceDescription}>Use dark theme for the app</Text>
        </View>
        <Switch
          value={preferences.darkMode}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, darkMode: value }))}
          trackColor={{ false: theme.colors.gray300, true: theme.colors.accent }}
        />
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAccountSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Settings</Text>
      
      <Text style={styles.subsectionTitle}>Change Password</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Password</Text>
        <TextInput
          style={styles.textInput}
          value={passwordForm.currentPassword}
          onChangeText={(value) => setPasswordForm(prev => ({ ...prev, currentPassword: value }))}
          placeholder="Enter current password"
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>New Password</Text>
        <TextInput
          style={styles.textInput}
          value={passwordForm.newPassword}
          onChangeText={(value) => setPasswordForm(prev => ({ ...prev, newPassword: value }))}
          placeholder="Enter new password"
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <TextInput
          style={styles.textInput}
          value={passwordForm.confirmPassword}
          onChangeText={(value) => setPasswordForm(prev => ({ ...prev, confirmPassword: value }))}
          placeholder="Confirm new password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
        <Text style={styles.saveButtonText}>Change Password</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.dangerButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAboutSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About</Text>
      
      <View style={styles.aboutItem}>
        <Text style={styles.aboutLabel}>App Version</Text>
        <Text style={styles.aboutValue}>1.0.0</Text>
      </View>

      <View style={styles.aboutItem}>
        <Text style={styles.aboutLabel}>Organization</Text>
        <Text style={styles.aboutValue}>{user?.organization?.name || 'N/A'}</Text>
      </View>

      <View style={styles.aboutItem}>
        <Text style={styles.aboutLabel}>User Role</Text>
        <Text style={styles.aboutValue}>{user?.role || 'N/A'}</Text>
      </View>

      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.accent} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Privacy Policy</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.accent} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Terms of Service</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.accent} />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'account':
        return renderAccountSection();
      case 'about':
        return renderAboutSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            {renderSectionButton('profile', 'Profile', 'person-outline')}
            {renderSectionButton('preferences', 'Preferences', 'settings-outline')}
            {renderSectionButton('account', 'Account', 'key-outline')}
            {renderSectionButton('about', 'About', 'information-circle-outline')}
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderContent()}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 120,
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    paddingVertical: 20,
  },
  sectionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
  },
  sectionButtonActive: {
    backgroundColor: `${theme.colors.accent}10`,
  },
  sectionButtonText: {
    fontSize: 12,
    color: theme.colors.gray500,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionButtonTextActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
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
  saveButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 20,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  aboutLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  aboutValue: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  linkButtonText: {
    fontSize: 16,
    color: theme.colors.accent,
    fontWeight: '500',
  },
});