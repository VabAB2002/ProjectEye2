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
import { useFinancialStore } from '../../store/financial.store';
import { useProjectStore } from '../../store/project.store';
import { useAuthStore } from '../../store/auth.store';

const EXPENSE_CATEGORIES = [
  { id: 'MATERIALS', label: 'Materials', icon: 'cube-outline' },
  { id: 'TOOLS', label: 'Tools', icon: 'hammer-outline' },
  { id: 'TRANSPORT', label: 'Transportation', icon: 'car-outline' },
  { id: 'MEALS', label: 'Meals', icon: 'restaurant-outline' },
  { id: 'OTHER', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryLabel}>Expense Category</Text>
      <View style={styles.categoryGrid}>
        {EXPENSE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemSelected
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={24}
              color={selectedCategory === category.id ? theme.colors.secondary : theme.colors.accent}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextSelected
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const WorkerExpensesScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { projects } = useProjectStore();
  const { createTransaction, isLoading } = useFinancialStore();
  
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');

  const myProjects = projects.filter(project => 
    project.teamMembers?.some(member => member.userId === user?.id)
  );

  const handleSubmitExpense = async () => {
    if (!selectedProject) {
      Alert.alert('Missing Information', 'Please select a project.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select an expense category.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a description for this expense.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('type', 'EXPENSE');
      formData.append('amount', amount);
      formData.append('description', description.trim());
      formData.append('category', selectedCategory);
      if (vendor.trim()) {
        formData.append('vendorName', vendor.trim());
      }
      formData.append('paymentMode', 'CASH');

      await createTransaction(selectedProject, formData);

      Alert.alert('Success', 'Expense submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedProject('');
            setSelectedCategory('');
            setAmount('');
            setDescription('');
            setVendor('');
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit expense. Please try again.');
    }
  };

  const formatAmount = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return cleanValue;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Submit Expense</Text>
          <Text style={styles.headerSubtitle}>
            Add work-related expenses for reimbursement
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Project Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Project *</Text>
            {myProjects.length === 0 ? (
              <View style={styles.noProjectsContainer}>
                <Ionicons name="information-circle-outline" size={20} color={theme.colors.warning} />
                <Text style={styles.noProjectsText}>
                  No projects assigned. Contact your supervisor.
                </Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.projectSelector}
              >
                {myProjects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectOption,
                      selectedProject === project.id && styles.projectOptionSelected
                    ]}
                    onPress={() => setSelectedProject(project.id)}
                  >
                    <Text style={[
                      styles.projectOptionText,
                      selectedProject === project.id && styles.projectOptionTextSelected
                    ]}>
                      {project.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Category Selection */}
          <CategorySelector
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Input
              label="Amount *"
              value={amount}
              onChangeText={(value) => setAmount(formatAmount(value))}
              placeholder="0.00"
              keyboardType="decimal-pad"
              icon="cash-outline"
              style={styles.amountInput}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Input
              label="Description *"
              value={description}
              onChangeText={setDescription}
              placeholder="What was this expense for?"
              multiline
              numberOfLines={3}
              style={styles.descriptionInput}
            />
          </View>

          {/* Vendor Input */}
          <View style={styles.inputGroup}>
            <Input
              label="Vendor/Store (Optional)"
              value={vendor}
              onChangeText={setVendor}
              placeholder="Where did you make this purchase?"
              icon="storefront-outline"
            />
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              title="Submit Expense"
              onPress={handleSubmitExpense}
              loading={isLoading}
              disabled={!selectedProject || !selectedCategory || !amount || !description.trim()}
              style={styles.submitButton}
            />
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.gray500} />
            <Text style={styles.helpText}>
              Your expense will be reviewed and processed for reimbursement. Keep your receipts for verification.
            </Text>
          </View>
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
  header: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    padding: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  noProjectsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warningLight,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  noProjectsText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.warning,
  },
  projectSelector: {
    flexDirection: 'row',
  },
  projectOption: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    minWidth: 120,
  },
  projectOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  projectOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  projectOptionTextSelected: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: theme.spacing.xl,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryItem: {
    flex: 1,
    minWidth: '30%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  categoryItemSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  amountInput: {
    fontSize: 18,
    fontWeight: '600',
  },
  descriptionInput: {
    minHeight: 80,
  },
  submitContainer: {
    marginTop: theme.spacing.lg,
  },
  submitButton: {
    paddingVertical: theme.spacing.lg,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.gray500,
    lineHeight: 20,
  },
});