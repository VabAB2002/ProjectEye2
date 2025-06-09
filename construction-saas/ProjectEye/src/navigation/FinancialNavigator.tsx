import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FinancialScreen } from '../screens/financial/FinancialScreen';
import { CreateTransactionScreen } from '../screens/financial/CreateTransactionScreen';
import { TransactionDetailsScreen } from '../screens/financial/TransactionDetailsScreen';
import { theme } from '../theme';

export type FinancialStackParamList = {
  FinancialList: undefined;
  CreateTransaction: { projectId: string };
  TransactionDetails: { projectId: string; transactionId: string };
};

const Stack = createNativeStackNavigator<FinancialStackParamList>();

export const FinancialNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.accent,
      }}
    >
      <Stack.Screen 
        name="FinancialList" 
        component={FinancialScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreateTransaction" 
        component={CreateTransactionScreen}
        options={{ title: 'Add Transaction' }}
      />
      <Stack.Screen 
        name="TransactionDetails" 
        component={TransactionDetailsScreen}
        options={{ title: 'Transaction Details' }}
      />
    </Stack.Navigator>
  );
};