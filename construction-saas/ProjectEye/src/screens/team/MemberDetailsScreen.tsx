import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTeamStore } from '../../store/team.store';
import { useAuthStore } from '../../store/auth.store';
import { TeamMember } from '../../api/endpoints/team.api';
import { formatUserName } from '../../utils/userUtils';

interface RouteParams {
  projectId: string;
  memberId: string;
  userId: string;
}

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
  headerBackButton: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    marginRight: 12,
  },
  memberName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberStats: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  permissionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionStatus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
});

export const MemberDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId, memberId, userId } = route.params as RouteParams;
  const { user } = useAuthStore();
  const { members, removeMember, updateMember } = useTeamStore();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [member, setMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    const foundMember = members.find(m => m.id === memberId || m.userId === userId);
    setMember(foundMember || null);
  }, [members, memberId, userId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!member) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color={theme.colors.gray300} />
          <Text style={styles.emptyText}>Member Not Found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCallMember = () => {
    if (member.user.phone) {
      Linking.openURL(`tel:${member.user.phone}`);
    } else {
      Alert.alert('No Phone Number', 'This member has no phone number on file');
    }
  };

  const handleEmailMember = () => {
    Linking.openURL(`mailto:${member.user.email}`);
  };

  const handleRemoveMember = () => {
    if (member.role === 'OWNER') {
      Alert.alert('Cannot Remove Owner', 'Project owner cannot be removed from the team');
      return;
    }

    Alert.alert(
      'Remove Team Member',
      `Are you sure you want to remove ${formatUserName(member.user.firstName, member.user.lastName)} from this project?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(projectId, member.userId);
              Alert.alert(
                'Success', 
                'Team member removed successfully',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to remove team member');
            }
          },
        },
      ]
    );
  };

  const canManageMember = user?.role === 'OWNER' && member.role !== 'OWNER';

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

  const renderMemberProfile = () => (
    renderSection('Member Profile', 'person-outline', (
      <View>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[
            styles.profileIcon,
            { backgroundColor: `${getRoleColor(member.role)}15` }
          ]}>
            <Ionicons 
              name={getRoleIcon(member.role)} 
              size={32} 
              color={getRoleColor(member.role)} 
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.memberName}>{formatUserName(member.user.firstName, member.user.lastName)}</Text>
            <Text style={styles.memberEmail}>{member.user.email}</Text>
            {member.user.phone && (
              <Text style={styles.memberPhone}>{member.user.phone}</Text>
            )}
          </View>
          <View style={[
            styles.roleBadge,
            { backgroundColor: `${getRoleColor(member.role)}20` }
          ]}>
            <Text style={[
              styles.roleText,
              { color: getRoleColor(member.role) }
            ]}>
              {getRoleLabel(member.role)}
            </Text>
          </View>
        </View>

        {/* Member Stats */}
        <View style={styles.memberStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Joined</Text>
            <Text style={styles.statValue}>
              {new Date(member.joinedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>User Role</Text>
            <Text style={styles.statValue}>{member.user.role}</Text>
          </View>
        </View>
      </View>
    ))
  );

  const renderPermissions = () => {
    const permissionItems = [
      { key: 'canViewFinancials', label: 'View Financials', icon: 'card-outline' },
      { key: 'canApproveExpenses', label: 'Approve Expenses', icon: 'checkmark-circle-outline' },
      { key: 'canEditProject', label: 'Edit Project', icon: 'create-outline' },
      { key: 'canAddMembers', label: 'Manage Team', icon: 'people-outline' },
      { key: 'canUploadDocuments', label: 'Upload Documents', icon: 'cloud-upload-outline' },
      { key: 'canCreateMilestones', label: 'Manage Milestones', icon: 'flag-outline' },
    ];

    return renderSection('Permissions', 'shield-checkmark-outline', (
      <View>
        <Text style={styles.sectionDescription}>
          Current permissions for this team member
        </Text>
        
        <View style={styles.permissionsGrid}>
          {permissionItems.map((item) => {
            const hasPermission = member.permissions[item.key as keyof typeof member.permissions];
            return (
              <View key={item.key} style={styles.permissionCard}>
                <View style={[
                  styles.permissionIcon,
                  { backgroundColor: hasPermission ? `${theme.colors.accent}15` : `${theme.colors.gray300}15` }
                ]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={hasPermission ? theme.colors.accent : theme.colors.gray400} 
                  />
                </View>
                <Text style={[
                  styles.permissionLabel,
                  { color: hasPermission ? theme.colors.text : theme.colors.gray400 }
                ]}>
                  {item.label}
                </Text>
                <View style={[
                  styles.permissionStatus,
                  { backgroundColor: hasPermission ? '#10B98115' : '#EF444415' }
                ]}>
                  <Ionicons 
                    name={hasPermission ? 'checkmark' : 'close'} 
                    size={14} 
                    color={hasPermission ? '#10B981' : '#EF4444'} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    ));
  };

  const renderActions = () => (
    renderSection('Actions', 'flash-outline', (
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={handleEmailMember}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#0066ff15' }]}>
            <Ionicons name="mail" size={24} color="#0066ff" />
          </View>
          <Text style={styles.actionLabel}>Send Email</Text>
        </TouchableOpacity>

        {member?.user.phone && (
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={handleCallMember}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="call" size={24} color="#10B981" />
            </View>
            <Text style={styles.actionLabel}>Call</Text>
          </TouchableOpacity>
        )}

        {canManageMember && (
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={handleRemoveMember}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EF444415' }]}>
              <Ionicons name="trash" size={24} color="#EF4444" />
            </View>
            <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    ))
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderMemberProfile()}
        {renderPermissions()}
        {renderActions()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};