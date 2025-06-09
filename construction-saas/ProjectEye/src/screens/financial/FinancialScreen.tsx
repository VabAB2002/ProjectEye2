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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useFinancialStore } from '../../store/financial.store';
import { useProjectStore } from '../../store/project.store';
import { useAuthStore } from '../../store/auth.store';

export const FinancialScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { projects, currentProject } = useProjectStore();
  const { transactions, summary, isLoading, fetchTransactions, fetchSummary } = useFinancialStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    currentProject?.id || projects[0]?.id || null
  );
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (selectedProjectId) {
      loadFinancialData();
    }
  }, [selectedProjectId, filterType, filterStatus]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadFinancialData = async () => {
    if (!selectedProjectId) return;
    
    await Promise.all([
      fetchTransactions(selectedProjectId, {
        type: filterType,
        approvalStatus: filterStatus,
      }),
      fetchSummary(selectedProjectId),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFinancialData();
    setRefreshing(false);
  };

  const handleCreateTransaction = () => {
    if (!selectedProjectId) {
      alert('Please select a project first');
      return;
    }
    navigation.navigate('CreateTransaction' as never, { projectId: selectedProjectId } as never);
  };

  const handleTransactionPress = (transactionId: string) => {
    navigation.navigate('TransactionDetails' as never, { 
      projectId: selectedProjectId, 
      transactionId 
    } as never);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getTransactionIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'EXPENSE': return 'arrow-up-circle';
      case 'PAYMENT': return 'arrow-down-circle';
      case 'ADVANCE': return 'time';
      default: return 'cash';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'EXPENSE': return '#EF4444';
      case 'PAYMENT': return '#10B981';
      case 'ADVANCE': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      case 'PENDING': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderSection = (title: string, icon: keyof typeof Ionicons.glyphMap, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name={icon} size={18} color={theme.colors.accent} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderBudgetOverview = () => {
    if (!summary) return null;

    const budgetPercentage = summary.budgetUtilization;
    const getBudgetColor = () => {
      if (budgetPercentage < 50) return '#10B981';
      if (budgetPercentage < 80) return '#F59E0B';
      return '#EF4444';
    };

    return renderSection('Budget Overview', 'wallet-outline', (
      <View style={styles.budgetOverview}>
        {/* Total Budget */}
        <View style={styles.budgetTotalContainer}>
          <Text style={styles.budgetLabel}>Total Budget</Text>
          <Text style={styles.budgetAmount}>{formatCurrency(summary.totalBudget)}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${Math.min(budgetPercentage, 100)}%`,
                  backgroundColor: getBudgetColor()
                }
              ]} 
            />
          </View>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: getBudgetColor() }]}>
              {budgetPercentage.toFixed(1)}% Used
            </Text>
            <Text style={styles.remainingText}>
              {formatCurrency(summary.remainingBudget)} remaining
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsGrid}>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: '#EF444415' }]}>
              <Ionicons name="arrow-up-circle" size={20} color="#EF4444" />
            </View>
            <Text style={styles.quickStatLabel}>Expenses</Text>
            <Text style={styles.quickStatValue}>{formatCurrency(summary.totalExpenses)}</Text>
          </View>
          
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="arrow-down-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.quickStatLabel}>Payments</Text>
            <Text style={styles.quickStatValue}>{formatCurrency(summary.totalPayments)}</Text>
          </View>
          
          {summary.pendingApprovals > 0 && user?.role === 'OWNER' && (
            <TouchableOpacity 
              style={styles.pendingCard}
              onPress={() => setFilterStatus('PENDING')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickStatIcon, { backgroundColor: '#F59E0B15' }]}>
                <Ionicons name="hourglass" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.quickStatLabel}>Pending</Text>
              <Text style={styles.quickStatValue}>{summary.pendingApprovals}</Text>
            </TouchableOpacity>
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
    const typeFilters = [
      { label: 'All', value: null },
      { label: 'Expenses', value: 'EXPENSE' },
      { label: 'Payments', value: 'PAYMENT' },
      { label: 'Advances', value: 'ADVANCE' },
    ];

    const statusFilters = [
      { label: 'All Status', value: null },
      { label: 'Pending', value: 'PENDING' },
      { label: 'Approved', value: 'APPROVED' },
      { label: 'Rejected', value: 'REJECTED' },
    ];

    return renderSection('Filters', 'funnel-outline', (
      <View>
        {/* Type Filters */}
        <Text style={styles.filterSectionLabel}>Transaction Type</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {typeFilters.map((filter) => (
            <TouchableOpacity
              key={filter.label}
              style={[
                styles.filterChip,
                filterType === filter.value && styles.filterChipActive
              ]}
              onPress={() => setFilterType(filter.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterText,
                filterType === filter.value && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filters */}
        <Text style={[styles.filterSectionLabel, { marginTop: 16 }]}>Status</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.label}
              style={[
                styles.filterChip,
                filterStatus === filter.value && styles.filterChipActive
              ]}
              onPress={() => setFilterStatus(filter.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterText,
                filterStatus === filter.value && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ));
  };

  const renderTransactionItem = ({ item }: { item: any }) => {
    const transactionDate = new Date(item.createdAt);
    
    return (
      <TouchableOpacity 
        style={styles.transactionCard}
        onPress={() => handleTransactionPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionContent}>
          <View style={[
            styles.transactionIconContainer,
            { backgroundColor: `${getTransactionColor(item.type)}15` }
          ]}>
            <Ionicons 
              name={getTransactionIcon(item.type)} 
              size={20} 
              color={getTransactionColor(item.type)} 
            />
          </View>
          
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            {item.vendorName && (
              <Text style={styles.transactionVendor}>{item.vendorName}</Text>
            )}
            <Text style={styles.transactionDate}>
              {transactionDate.toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.transactionRight}>
            <Text style={[
              styles.transactionAmount,
              { color: getTransactionColor(item.type) }
            ]}>
              {item.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(item.amount)}
            </Text>
            <View style={[
              styles.statusChip,
              { backgroundColor: `${getStatusColor(item.approvalStatus)}15` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(item.approvalStatus) }
              ]}>
                {item.approvalStatus}
              </Text>
            </View>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.transactionDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (!selectedProjectId && projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Projects Available</Text>
          <Text style={styles.emptyText}>Create a project first to track finances</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.accent]}
              tintColor={theme.colors.accent}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Financial Management</Text>
            <Text style={styles.headerSubtitle}>Track expenses and budget efficiently</Text>
          </View>

          {/* Project Selector */}
          {renderProjectSelector()}

          {/* Budget Overview */}
          {renderBudgetOverview()}

          {/* Filters */}
          {renderFilters()}

          {/* Recent Transactions */}
          {renderSection('Recent Transactions', 'receipt-outline', (
            <View style={styles.transactionsContainer}>
              {transactions.length === 0 ? (
                <View style={styles.emptyTransactions}>
                  <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.emptyTransactionsTitle}>No Transactions</Text>
                  <Text style={styles.emptyTransactionsText}>
                    Start tracking expenses and payments
                  </Text>
                </View>
              ) : (
                transactions.slice(0, 10).map((item) => (
                  <View key={item.id}>
                    {renderTransactionItem({ item })}
                  </View>
                ))
              )}
              
              {transactions.length > 10 && (
                <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.7}>
                  <Text style={styles.viewAllText}>View All Transactions</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.accent} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateTransaction}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },

  // Section Styles (matching CreateTransaction)
  section: {
    backgroundColor: '#FFFFFF',
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionIconContainer: {
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
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Budget Overview Styles
  budgetOverview: {
    
  },
  budgetTotalContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  remainingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pendingCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Project Selector Styles
  projectScrollContent: {
    paddingRight: 20,
  },
  projectChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  projectChipActive: {
    backgroundColor: `${theme.colors.accent}08`,
    borderColor: theme.colors.accent,
  },
  projectChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  projectChipTextActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },

  // Filter Styles
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: `${theme.colors.accent}08`,
    borderColor: theme.colors.accent,
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },

  // Transaction Styles
  transactionsContainer: {
    
  },
  transactionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionVendor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 18,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600',
    marginRight: 4,
  },

  // Empty States
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTransactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyTransactionsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});