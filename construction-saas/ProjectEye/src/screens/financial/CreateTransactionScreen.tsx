import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import { Button } from '../../components/common/Button';
import { useFinancialStore } from '../../store/financial.store';

const EXPENSE_CATEGORIES = [
  { value: 'MATERIAL', label: 'Materials', icon: 'cube-outline' },
  { value: 'LABOR', label: 'Labor', icon: 'people-outline' },
  { value: 'EQUIPMENT', label: 'Equipment', icon: 'build-outline' },
  { value: 'TRANSPORTATION', label: 'Transport', icon: 'car-outline' },
  { value: 'UTILITIES', label: 'Utilities', icon: 'flash-outline' },
  { value: 'PROFESSIONAL_FEES', label: 'Prof. Fees', icon: 'briefcase-outline' },
  { value: 'PERMITS', label: 'Permits', icon: 'document-outline' },
  { value: 'INSURANCE', label: 'Insurance', icon: 'shield-outline' },
  { value: 'MISCELLANEOUS', label: 'Others', icon: 'ellipsis-horizontal-outline' }
];

const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash', icon: 'cash-outline' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'card-outline' },
  { value: 'CHEQUE', label: 'Cheque', icon: 'document-text-outline' },
  { value: 'UPI', label: 'UPI', icon: 'phone-portrait-outline' },
];

const TRANSACTION_TYPES = [
  { value: 'EXPENSE', label: 'Expense', icon: 'arrow-up-circle-outline', color: '#EF4444' },
  { value: 'PAYMENT', label: 'Payment', icon: 'arrow-down-circle-outline', color: '#10B981' },
  { value: 'ADVANCE', label: 'Advance', icon: 'time-outline', color: '#F59E0B' },
];

export const CreateTransactionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { projectId } = route.params;
  const { createTransaction } = useFinancialStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receipt, setReceipt] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    type: 'EXPENSE' as 'EXPENSE' | 'PAYMENT' | 'ADVANCE',
    category: '',
    amount: '',
    description: '',
    vendorName: '',
    billNumber: '',
    billDate: new Date(),
    paymentMode: 'CASH' as 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI',
  });

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = new FormData();
      
      data.append('type', formData.type);
      data.append('category', formData.category);
      data.append('amount', formData.amount);
      data.append('paymentMode', formData.paymentMode);
      
      if (formData.description) {
        data.append('description', formData.description);
      }
      if (formData.vendorName) {
        data.append('vendorName', formData.vendorName);
      }
      if (formData.billNumber) {
        data.append('billNumber', formData.billNumber);
      }
      if (formData.type === 'EXPENSE' && formData.billDate) {
        data.append('billDate', formData.billDate.toISOString());
      }
      
      if (receipt) {
        data.append('receipt', {
          uri: receipt.uri,
          type: 'image/jpeg',
          name: 'receipt.jpg',
        } as any);
      }

      await createTransaction(projectId, data);
      
      Alert.alert('Success', 'Transaction created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to create transaction'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    const numericValue = amount.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return `₹${parseInt(numericValue).toLocaleString('en-IN')}`;
  };

  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceipt(result.assets[0]);
    }
  };

  const takeReceiptPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceipt(result.assets[0]);
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

  const renderTypeSelector = () => (
    <View style={styles.typeGrid}>
      {TRANSACTION_TYPES.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.typeCard,
            formData.type === type.value && styles.typeCardActive,
          ]}
          onPress={() => setFormData({ ...formData, type: type.value as any })}
          activeOpacity={0.7}
        >
          <View style={[
            styles.typeIconContainer,
            { backgroundColor: `${type.color}15` },
            formData.type === type.value && { backgroundColor: `${type.color}25` }
          ]}>
            <Ionicons
              name={type.icon as any}
              size={24}
              color={formData.type === type.value ? type.color : '#6B7280'}
            />
          </View>
          <Text style={[
            styles.typeLabel,
            formData.type === type.value && { color: type.color, fontWeight: '600' }
          ]}>
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCategoryGrid = () => (
    <View style={styles.categoryGrid}>
      {EXPENSE_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={[
            styles.categoryCard,
            formData.category === category.value && styles.categoryCardActive,
            inputErrors.category && styles.categoryCardError,
          ]}
          onPress={() => {
            setFormData({ ...formData, category: category.value });
            if (inputErrors.category) {
              setInputErrors({ ...inputErrors, category: '' });
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={category.icon as any}
            size={20}
            color={formData.category === category.value ? theme.colors.accent : '#6B7280'}
          />
          <Text style={[
            styles.categoryLabel,
            formData.category === category.value && styles.categoryLabelActive,
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPaymentModes = () => (
    <View style={styles.paymentGrid}>
      {PAYMENT_MODES.map((mode) => (
        <TouchableOpacity
          key={mode.value}
          style={[
            styles.paymentCard,
            formData.paymentMode === mode.value && styles.paymentCardActive,
          ]}
          onPress={() => setFormData({ ...formData, paymentMode: mode.value as any })}
          activeOpacity={0.7}
        >
          <Ionicons
            name={mode.icon as any}
            size={20}
            color={formData.paymentMode === mode.value ? theme.colors.accent : '#6B7280'}
          />
          <Text style={[
            styles.paymentLabel,
            formData.paymentMode === mode.value && styles.paymentLabelActive,
          ]}>
            {mode.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInputField = (
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    options?: {
      keyboardType?: any;
      multiline?: boolean;
      numberOfLines?: number;
      icon?: keyof typeof Ionicons.glyphMap;
      error?: string;
    }
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.textInputWrapper,
        options?.error && styles.textInputError
      ]}>
        {options?.icon && (
          <Ionicons name={options.icon} size={20} color="#6B7280" style={styles.inputIcon} />
        )}
        <TextInput
          style={[
            styles.textInput,
            options?.multiline && styles.textInputMultiline,
            options?.icon && styles.textInputWithIcon
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={options?.keyboardType || 'default'}
          multiline={options?.multiline}
          numberOfLines={options?.numberOfLines}
          textAlignVertical={options?.multiline ? 'top' : 'center'}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      {options?.error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{options.error}</Text>
        </View>
      )}
    </View>
  );

  const renderDateSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Bill Date</Text>
      <TouchableOpacity
        style={styles.dateSelector}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#6B7280" style={styles.inputIcon} />
        <Text style={styles.dateText}>
          {formData.billDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  const renderReceiptSection = () => (
    <View style={styles.receiptSection}>
      <Text style={styles.receiptTitle}>Receipt (Optional)</Text>
      {receipt ? (
        <View style={styles.receiptPreview}>
          <View style={styles.receiptInfo}>
            <Ionicons name="document-attach-outline" size={24} color="#10B981" />
            <Text style={styles.receiptText}>Receipt attached</Text>
          </View>
          <TouchableOpacity
            onPress={() => setReceipt(null)}
            style={styles.removeReceiptButton}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.receiptButtons}>
          <TouchableOpacity style={styles.receiptButton} onPress={takeReceiptPhoto}>
            <Ionicons name="camera-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.receiptButtonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.receiptButton} onPress={pickReceipt}>
            <Ionicons name="image-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.receiptButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Transaction Type */}
          {renderSection('Transaction Type', 'swap-horizontal-outline', renderTypeSelector())}

          {/* Amount */}
          {renderSection('Amount Details', 'cash-outline', (
            <View>
              {renderInputField(
                'Amount *',
                'Enter amount',
                formData.amount ? formatCurrency(formData.amount) : '',
                (text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, amount: numericValue });
                  if (inputErrors.amount) {
                    setInputErrors({ ...inputErrors, amount: '' });
                  }
                },
                {
                  keyboardType: 'numeric',
                  icon: 'cash-outline',
                  error: inputErrors.amount
                }
              )}
            </View>
          ))}

          {/* Category */}
          {renderSection('Category', 'grid-outline', (
            <View>
              {renderCategoryGrid()}
              {inputErrors.category && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{inputErrors.category}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Vendor Details */}
          {formData.type === 'EXPENSE' && renderSection('Vendor Details', 'business-outline', (
            <View>
              {renderInputField(
                'Vendor Name',
                'Enter vendor name',
                formData.vendorName,
                (text) => setFormData({ ...formData, vendorName: text }),
                { icon: 'business-outline' }
              )}
              
              {renderInputField(
                'Bill Number',
                'Enter bill/invoice number',
                formData.billNumber,
                (text) => setFormData({ ...formData, billNumber: text }),
                { icon: 'document-text-outline' }
              )}

              {renderDateSelector()}
            </View>
          ))}

          {/* Description */}
          {renderSection('Description', 'document-text-outline', (
            renderInputField(
              'Description (Optional)',
              'Add any additional details...',
              formData.description,
              (text) => setFormData({ ...formData, description: text }),
              {
                multiline: true,
                numberOfLines: 3,
                icon: 'text-outline'
              }
            )
          ))}

          {/* Payment Mode */}
          {renderSection('Payment Mode', 'card-outline', renderPaymentModes())}

          {/* Receipt Upload */}
          {formData.type === 'EXPENSE' && renderSection('Receipt', 'camera-outline', renderReceiptSection())}

          <View style={styles.buttonContainer}>
            <Button
              title="Create Transaction"
              onPress={handleSubmit}
              loading={isLoading}
              icon="checkmark-circle-outline"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.billDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setFormData({ ...formData, billDate: date });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Section Styles
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

  // Transaction Type Styles
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}08`,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },

  // Category Styles
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  categoryCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}08`,
  },
  categoryCardError: {
    borderColor: '#EF4444',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  categoryLabelActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },

  // Payment Mode Styles
  paymentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}08`,
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  paymentLabelActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },

  // Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    minHeight: 48,
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  textInputWithIcon: {
    marginLeft: 0,
  },
  textInputMultiline: {
    paddingVertical: 12,
    minHeight: 80,
  },

  // Date Selector Styles
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginLeft: 12,
  },

  // Receipt Styles
  receiptSection: {
    
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  receiptPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  receiptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#059669',
    marginLeft: 8,
  },
  removeReceiptButton: {
    padding: 4,
  },
  receiptButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  receiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  receiptButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.accent,
    marginLeft: 6,
  },

  // Error Styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 6,
    fontWeight: '500',
  },

  // Button Styles
  buttonContainer: {
    marginTop: 24,
    marginHorizontal: 16,
  },
});