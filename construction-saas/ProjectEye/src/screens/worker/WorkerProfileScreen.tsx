import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/auth.store';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
  editable?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, onPress, editable = false }) => (
  <TouchableOpacity 
    style={styles.infoRow} 
    onPress={onPress}
    disabled={!editable}
  >
    <Ionicons name={icon as any} size={20} color={theme.colors.accent} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
    {editable && (
      <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
    )}
  </TouchableOpacity>
);

export const WorkerProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`.trim());
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleSaveChanges = () => {
    // In a real app, you would call an API to update user info
    Alert.alert('Success', 'Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(`${user?.firstName || ''} ${user?.lastName || ''}`.trim());
    setEditedPhone(user?.phone || '');
    setIsEditing(false);
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'VIEWER':
        return 'Field Worker';
      case 'CONTRACTOR':
        return 'Contractor';
      case 'OWNER':
        return 'Project Owner';
      default:
        return role;
    }
  };

  const getJoinDate = () => {
    // Since createdAt might not exist in the current User type, provide fallback
    return 'Recently joined';
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User information not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {`${user.firstName} ${user.lastName || ''}`.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{`${user.firstName} ${user.lastName || ''}`.trim()}</Text>
          <Text style={styles.userRole}>{formatRole(user.role)}</Text>
        </View>

        {/* Basic Information */}
        <ProfileSection title="Basic Information">
          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                label="Full Name"
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your full name"
              />
              <Input
                label="Phone Number"
                value={editedPhone}
                onChangeText={setEditedPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
              <View style={styles.editActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={handleCancelEdit}
                  style={styles.editButton}
                />
                <Button
                  title="Save"
                  onPress={handleSaveChanges}
                  style={styles.editButton}
                />
              </View>
            </View>
          ) : (
            <View>
              <InfoRow
                icon="person-outline"
                label="Full Name"
                value={`${user.firstName} ${user.lastName || ''}`.trim()}
                editable
                onPress={() => setIsEditing(true)}
              />
              <InfoRow
                icon="call-outline"
                label="Phone Number"
                value={user.phone}
                editable
                onPress={() => setIsEditing(true)}
              />
              <InfoRow
                icon="mail-outline"
                label="Email Address"
                value={user.email}
              />
              <InfoRow
                icon="shield-outline"
                label="Role"
                value={formatRole(user.role)}
              />
            </View>
          )}
        </ProfileSection>

        {/* Work Information */}
        <ProfileSection title="Work Information">
          <InfoRow
            icon="business-outline"
            label="Organization"
            value={user.organization?.name || 'Not assigned'}
          />
          <InfoRow
            icon="calendar-outline"
            label="Joined"
            value={getJoinDate()}
          />
        </ProfileSection>

        {/* Quick Actions */}
        <ProfileSection title="Quick Actions">
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="document-text-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.actionText}>View My Work History</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="receipt-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.actionText}>My Expense Reports</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="help-circle-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
        </ProfileSection>

        {/* Settings */}
        <ProfileSection title="Settings">
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.actionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.actionText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
        </ProfileSection>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
  },
  header: {
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userRole: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  section: {
    backgroundColor: theme.colors.background,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  editForm: {
    gap: theme.spacing.lg,
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  editButton: {
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  logoutContainer: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
  logoutButtonText: {
    color: theme.colors.error,
  },
});