import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StatusBar,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTeamStore } from '../../store/team.store';
import { useProjectStore } from '../../store/project.store';
import { useAuthStore } from '../../store/auth.store';
import { TeamMember } from '../../api/endpoints/team.api';
import { formatUserName } from '../../utils/userUtils';

export const TeamScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { projects, currentProject } = useProjectStore();
  const { members, isLoading, fetchMembers, removeMember } = useTeamStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    currentProject?.id || projects[0]?.id || null
  );
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (selectedProjectId) {
      loadTeamData();
    }
  }, [selectedProjectId, filterRole]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadTeamData = async () => {
    if (!selectedProjectId) return;
    await fetchMembers(selectedProjectId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeamData();
    setRefreshing(false);
  };

  const handleAddMember = () => {
    if (!selectedProjectId) {
      Alert.alert('Error', 'Please select a project first');
      return;
    }
    navigation.navigate('AddMember' as never, { projectId: selectedProjectId } as never);
  };

  const handleMemberPress = (member: TeamMember) => {
    navigation.navigate('MemberDetails' as never, { 
      projectId: selectedProjectId,
      memberId: member.id,
      userId: member.userId 
    } as never);
  };

  const handleCallMember = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No Phone Number', 'This member has no phone number on file');
    }
  };

  const handleRemoveMember = (member: TeamMember) => {
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
              await removeMember(selectedProjectId!, member.userId);
              Alert.alert('Success', 'Team member removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove team member');
            }
          },
        },
      ]
    );
  };

  // Calculate team statistics
  const getTeamStats = () => {
    const total = members.length;
    const owners = members.filter(m => m.role === 'OWNER').length;
    const managers = members.filter(m => m.role === 'PROJECT_MANAGER').length;
    const contractors = members.filter(m => m.role === 'CONTRACTOR').length;
    const supervisors = members.filter(m => m.role === 'SUPERVISOR').length;
    const viewers = members.filter(m => m.role === 'VIEWER').length;

    return { total, owners, managers, contractors, supervisors, viewers };
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
      case 'PROJECT_MANAGER': return 'Manager';
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

  const renderOverview = () => {
    const stats = getTeamStats();
    
    return renderSection('Team Overview', 'analytics-outline', (
      <View>
        {/* Team Size */}
        <View style={styles.teamSizeContainer}>
          <View style={styles.teamSizeHeader}>
            <Text style={styles.teamSizeTitle}>Team Size</Text>
            <Text style={styles.teamSizeValue}>{stats.total} member{stats.total !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Role Distribution */}
        <View style={styles.quickStatsGrid}>
          {stats.owners > 0 && (
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: '#EF444415' }]}>
                <Ionicons name="star-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.quickStatLabel}>Owner</Text>
              <Text style={styles.quickStatValue}>{stats.owners}</Text>
            </View>
          )}
          
          {stats.managers > 0 && (
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: '#0066ff15' }]}>
                <Ionicons name="briefcase-outline" size={20} color="#0066ff" />
              </View>
              <Text style={styles.quickStatLabel}>Managers</Text>
              <Text style={styles.quickStatValue}>{stats.managers}</Text>
            </View>
          )}
          
          {stats.contractors > 0 && (
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: '#10B98115' }]}>
                <Ionicons name="hammer-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.quickStatLabel}>Contractors</Text>
              <Text style={styles.quickStatValue}>{stats.contractors}</Text>
            </View>
          )}
        </View>
      </View>
    ));
  };

  const renderProjectSelector = () => (
    renderSection('Project', 'business-outline', (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.projectScrollContent}
      >
        {projects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={[
              styles.projectChip,
              selectedProjectId === project.id && styles.projectChipActive
            ]}
            onPress={() => setSelectedProjectId(project.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.projectChipText,
              selectedProjectId === project.id && styles.projectChipTextActive
            ]}>
              {project.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ))
  );

  const renderFilters = () => {
    const roleFilters = [
      { label: 'All Roles', value: null },
      { label: 'Owners', value: 'OWNER' },
      { label: 'Managers', value: 'PROJECT_MANAGER' },
      { label: 'Contractors', value: 'CONTRACTOR' },
      { label: 'Supervisors', value: 'SUPERVISOR' },
      { label: 'Viewers', value: 'VIEWER' },
    ];

    return renderSection('Filters', 'funnel-outline', (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        {roleFilters.map((filter) => (
          <TouchableOpacity
            key={filter.value || 'all'}
            style={[
              styles.filterChip,
              filterRole === filter.value && styles.filterChipActive
            ]}
            onPress={() => setFilterRole(filter.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterChipText,
              filterRole === filter.value && styles.filterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ));
  };

  const renderQuickActions = () => (
    renderSection('Quick Actions', 'flash-outline', (
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={handleAddMember}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#0066ff15' }]}>
            <Ionicons name="person-add" size={24} color={theme.colors.accent} />
          </View>
          <Text style={styles.quickActionLabel}>Add Member</Text>
          <Text style={styles.quickActionDescription}>Invite a team member</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => {/* Navigate to permissions screen */}}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          </View>
          <Text style={styles.quickActionLabel}>Manage Roles</Text>
          <Text style={styles.quickActionDescription}>Set permissions</Text>
        </TouchableOpacity>
      </View>
    ))
  );

  const renderMemberCard = ({ item: member }: { item: TeamMember }) => {
    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => handleMemberPress(member)}
        activeOpacity={0.7}
      >
        <View style={styles.memberHeader}>
          <View style={styles.memberIconContainer}>
            <View style={[
              styles.memberIcon,
              { backgroundColor: `${getRoleColor(member.role)}15` }
            ]}>
              <Ionicons 
                name={getRoleIcon(member.role)} 
                size={20} 
                color={getRoleColor(member.role)} 
              />
            </View>
          </View>
          
          <View style={styles.memberInfo}>
            <Text style={styles.memberName} numberOfLines={1}>
              {formatUserName(member.user.firstName, member.user.lastName)}
            </Text>
            <Text style={styles.memberEmail} numberOfLines={1}>
              {member.user.email}
            </Text>
          </View>
          
          <View style={styles.memberStatus}>
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
        </View>

        <View style={styles.memberFooter}>
          <View style={styles.memberMeta}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.memberJoinDate}>
              Joined {new Date(member.joinedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
          
          <View style={styles.memberActions}>
            {member.user.phone && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleCallMember(member.user.phone)}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={16} color={theme.colors.accent} />
              </TouchableOpacity>
            )}
            
            {user?.role === 'OWNER' && member.role !== 'OWNER' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#EF444415' }]}
                onPress={() => handleRemoveMember(member)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredMembers = filterRole 
    ? members.filter(member => member.role === filterRole)
    : members;

  const renderTeamList = () => (
    renderSection('Team Members', 'people-outline', (
      filteredMembers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={theme.colors.gray300} />
          <Text style={styles.emptyText}>No team members found</Text>
          <Text style={styles.emptyDescription}>
            {filterRole ? 'No members match the selected filter' : 'Add team members to collaborate on this project'}
          </Text>
          {!filterRole && (
            <TouchableOpacity 
              style={styles.emptyAction}
              onPress={handleAddMember}
              activeOpacity={0.7}
            >
              <Text style={styles.emptyActionText}>Add First Member</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMemberCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )
    ))
  );

  if (!selectedProjectId && projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color={theme.colors.gray300} />
          <Text style={styles.emptyText}>No Projects Found</Text>
          <Text style={styles.emptyDescription}>
            Create a project first to manage team members
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Team</Text>
        <TouchableOpacity 
          style={styles.headerAction}
          onPress={handleAddMember}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add" size={24} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
      >
        {projects.length > 1 && renderProjectSelector()}
        {selectedProjectId && renderOverview()}
        {selectedProjectId && members.length > 0 && renderFilters()}
        {selectedProjectId && renderQuickActions()}
        {selectedProjectId && renderTeamList()}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  teamSizeContainer: {
    marginBottom: 20,
  },
  teamSizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  teamSizeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  teamSizeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  quickStatCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  projectScrollContent: {
    paddingRight: 20,
  },
  projectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.gray100,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  projectChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  projectChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  projectChipTextActive: {
    color: theme.colors.background,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.gray100,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  filterChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: theme.colors.background,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  memberCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberIconContainer: {
    marginRight: 12,
  },
  memberIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  memberStatus: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  memberFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberJoinDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAction: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.background,
  },
});