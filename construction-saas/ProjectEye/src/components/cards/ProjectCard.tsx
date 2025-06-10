import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Project } from '../../api/types';

interface ProjectCardProps {
  project: Project & {
    _count?: {
      members: number;
      progressUpdates: number;
      transactions: number;
    };
  };
  onPress: () => void;
}

const { width } = Dimensions.get('window');

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { color: theme.colors.success, backgroundColor: `${theme.colors.success}15`, label: 'Active' };
      case 'ON_HOLD':
        return { color: theme.colors.warning, backgroundColor: `${theme.colors.warning}15`, label: 'On Hold' };
      case 'COMPLETED':
        return { color: theme.colors.info, backgroundColor: `${theme.colors.info}15`, label: 'Completed' };
      case 'PLANNING':
        return { color: theme.colors.accent, backgroundColor: `${theme.colors.accent}15`, label: 'Planning' };
      default:
        return { color: theme.colors.gray500, backgroundColor: `${theme.colors.gray500}15`, label: status };
    }
  };

  const formatBudget = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)}L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'RESIDENTIAL':
        return 'home-outline';
      case 'COMMERCIAL':
        return 'business-outline';
      case 'INDUSTRIAL':
        return 'construct-outline';
      default:
        return 'cube-outline';
    }
  };

  const statusConfig = getStatusConfig(project.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header Section */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getTypeIcon(project.type)} 
              size={20} 
              color={theme.colors.accent} 
            />
          </View>
          <View style={styles.titleTextContainer}>
            <Text style={styles.projectTitle} numberOfLines={1}>
              {project.name}
            </Text>
            <Text style={styles.projectLocation} numberOfLines={1}>
              {project.address.city}, {project.address.state}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusIndicator, { backgroundColor: statusConfig.backgroundColor }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Budget Section */}
      <View style={styles.budgetContainer}>
        <View style={styles.budgetInfo}>
          <Text style={styles.budgetLabel}>Total Budget</Text>
          <Text style={styles.budgetAmount}>{formatBudget(project.totalBudget)}</Text>
        </View>
      </View>

      {/* Stats Section */}
      {project._count && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={theme.colors.gray500} />
              <Text style={styles.statNumber}>{project._count.members}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Ionicons name="camera-outline" size={16} color={theme.colors.gray500} />
              <Text style={styles.statNumber}>{project._count.progressUpdates}</Text>
              <Text style={styles.statLabel}>Updates</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Ionicons name="receipt-outline" size={16} color={theme.colors.gray500} />
              <Text style={styles.statNumber}>{project._count.transactions}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${theme.colors.accent}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  titleTextContainer: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  projectLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginLeft: theme.spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.xs,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetContainer: {
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  budgetInfo: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.gray200,
    marginHorizontal: theme.spacing.sm,
  },
});

