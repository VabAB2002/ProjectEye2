import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { TeamNavigator } from '../../navigation/TeamNavigator';
import { MilestoneNavigator } from '../../navigation/MilestoneNavigator';

type TabType = 'team' | 'milestones';

export const TeamMilestonesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('team');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic will be handled by child components
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTab = (tab: TabType, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? theme.colors.accent : theme.colors.gray500}
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'team':
        return <TeamNavigator />;
      case 'milestones':
        return <MilestoneNavigator />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Management</Text>
        <Text style={styles.headerSubtitle}>Team & Project Milestones</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTab('team', 'Team', 'people-outline')}
        {renderTab('milestones', 'Milestones', 'flag-outline')}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
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
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: theme.spacing.sm,
  },
  activeTab: {
    borderBottomColor: theme.colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.gray500,
  },
  activeTabText: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
});