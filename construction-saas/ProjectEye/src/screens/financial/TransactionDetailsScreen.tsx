import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { financialApi } from '../../api/endpoints/financial.api';
import { useAuthStore } from '../../store/auth.store';

export const TransactionDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { projectId, transactionId } = route.params;
  const { user } = useAuthStore();
  
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    fetchTransactionDetails();
  }, [transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setIsLoading(true);
      const response = await financialApi.getById(projectId, transactionId);
      if (response.success && response.data) {
        setTransaction(response.data.transaction);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      Alert.alert('Error', 'Failed to load transaction details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED' && !approvalRemarks.trim()) {
      Alert.alert('Error', 'Please provide remarks for rejection');
      return;
    }

    setIsApproving(true);
    try {
      await financialApi.approve(projectId, transactionId, {
        approvalStatus: status,
        remarks: approvalRemarks.trim() || undefined,
      });
      
      Alert.alert(
        'Success',
        `Transaction ${status.toLowerCase()} successfully`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowApprovalModal(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || `Failed to ${status.toLowerCase()} transaction`
      );
    } finally {
      setIsApproving(false);
    }
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
      case 'EXPENSE': return theme.colors.error;
      case 'PAYMENT': return theme.colors.success;
      case 'ADVANCE': return theme.colors.warning;
      default: return theme.colors.gray500;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return theme.colors.success;
      case 'REJECTED': return theme.colors.error;
      case 'PENDING': return theme.colors.warning;
      default: return theme.colors.gray500;
    }
  };

  const getPaymentModeIcon = (mode: string): keyof typeof Ionicons.glyphMap => {
    switch (mode) {
      case 'CASH': return 'cash';
      case 'BANK_TRANSFER': return 'business';
      case 'CHEQUE': return 'document';
      case 'UPI': return 'phone-portrait';
      default: return 'wallet';
    }
  };

  const renderApprovalModal = () => (
    <Modal
      visible={showApprovalModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowApprovalModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Approve Transaction</Text>
          
          <Input
            label="Remarks (Optional for approval)"
            placeholder="Add any remarks..."
            value={approvalRemarks}
            onChangeText={setApprovalRemarks}
            multiline
            numberOfLines={3}
            style={styles.remarksInput}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Approve"
              onPress={() => handleApproval('APPROVED')}
              loading={isApproving}
              style={styles.approveButton}
            />
            
            <Button
              title="Reject"
              variant="outline"
              onPress={() => handleApproval('REJECTED')}
              loading={isApproving}
              style={styles.rejectButton}
            />
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowApprovalModal(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderReceiptModal = () => (
    <Modal
      visible={showReceiptModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowReceiptModal(false)}
    >
      <View style={styles.receiptModalOverlay}>
        <SafeAreaView style={styles.receiptModalContainer}>
          <TouchableOpacity
            style={styles.receiptCloseButton}
            onPress={() => setShowReceiptModal(false)}
          >
            <Ionicons name="close" size={32} color="#ffffff" />
          </TouchableOpacity>
          
          {transaction?.receiptUrl && (
            <Image
              source={{ uri: transaction.receiptUrl }}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }

  const transactionDate = new Date(transaction.createdAt);
  const billDate = transaction.billDate ? new Date(transaction.billDate) : null;
  const approvalDate = transaction.approvedAt ? new Date(transaction.approvedAt) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[
          styles.headerSection,
          { backgroundColor: `${getTransactionColor(transaction.type)}15` }
        ]}>
          <View style={[
            styles.headerIconContainer,
            { backgroundColor: getTransactionColor(transaction.type) }
          ]}>
            <Ionicons
              name={getTransactionIcon(transaction.type)}
              size={32}
              color="#ffffff"
            />
          </View>
          
          <Text style={styles.transactionType}>{transaction.type}</Text>
          <Text style={[
            styles.transactionAmount,
            { color: getTransactionColor(transaction.type) }
          ]}>
            {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(transaction.amount)}
          </Text>
          
          <View style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(transaction.approvalStatus)}15` }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(transaction.approvalStatus) }
            ]}>
              {transaction.approvalStatus}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>
              {transaction.category.replace(/_/g, ' ')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Mode</Text>
            <View style={styles.paymentModeContainer}>
              <Ionicons
                name={getPaymentModeIcon(transaction.paymentMode)}
                size={16}
                color={theme.colors.gray500}
                style={styles.paymentModeIcon}
              />
              <Text style={styles.detailValue}>
                {transaction.paymentMode.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created On</Text>
            <Text style={styles.detailValue}>
              {transactionDate.toLocaleDateString()} at {transactionDate.toLocaleTimeString()}
            </Text>
          </View>

          {transaction.vendorName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vendor</Text>
              <Text style={styles.detailValue}>{transaction.vendorName}</Text>
            </View>
          )}

          {transaction.billNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bill Number</Text>
              <Text style={styles.detailValue}>{transaction.billNumber}</Text>
            </View>
          )}

          {billDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bill Date</Text>
              <Text style={styles.detailValue}>{billDate.toLocaleDateString()}</Text>
            </View>
          )}

          {transaction.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.descriptionText}>{transaction.description}</Text>
            </View>
          )}
        </View>

        {/* Receipt Section */}
        {transaction.receiptUrl && (
          <View style={styles.receiptSection}>
            <Text style={styles.sectionTitle}>Receipt</Text>
            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => setShowReceiptModal(true)}
            >
              <Ionicons name="document-attach" size={24} color={theme.colors.accent} />
              <Text style={styles.receiptButtonText}>View Receipt</Text>
              <Ionicons name="expand" size={20} color={theme.colors.gray500} />
            </TouchableOpacity>
          </View>
        )}

        {/* Approval Info */}
        {transaction.approvalStatus !== 'PENDING' && transaction.approver && (
          <View style={styles.approvalSection}>
            <Text style={styles.sectionTitle}>Approval Information</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {transaction.approvalStatus === 'APPROVED' ? 'Approved By' : 'Rejected By'}
              </Text>
              <Text style={styles.detailValue}>
                {transaction.approver.firstName} {transaction.approver.lastName}
              </Text>
            </View>

            {approvalDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {approvalDate.toLocaleDateString()} at {approvalDate.toLocaleTimeString()}
                </Text>
              </View>
            )}

            {transaction.metadata?.remarks && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.detailLabel}>Remarks</Text>
                <Text style={styles.descriptionText}>{transaction.metadata.remarks}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {transaction.approvalStatus === 'PENDING' && user?.role === 'OWNER' && (
          <View style={styles.actionContainer}>
            <Button
              title="Review & Approve"
              onPress={() => setShowApprovalModal(true)}
              icon="checkmark-circle-outline"
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      {renderApprovalModal()}
      {renderReceiptModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  transactionType: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  transactionAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsSection: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: theme.spacing.md,
    textTransform: 'capitalize',
  },
  paymentModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentModeIcon: {
    marginRight: theme.spacing.xs,
  },
  descriptionContainer: {
    paddingTop: theme.spacing.md,
  },
  descriptionText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
  },
  receiptSection: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  receiptButtonText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    marginLeft: theme.spacing.md,
  },
  approvalSection: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  actionContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  remarksInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  approveButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
  },
  cancelButton: {
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  cancelText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  receiptModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  receiptModalContainer: {
    flex: 1,
  },
  receiptCloseButton: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});