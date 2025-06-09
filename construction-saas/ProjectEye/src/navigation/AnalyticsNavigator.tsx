import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { AnalyticsDashboardScreen } from '../screens/analytics/AnalyticsDashboardScreen';
import { ReportsScreen } from '../screens/analytics/ReportsScreen';

export type AnalyticsStackParamList = {
  AnalyticsDashboard: { projectId: string };
  Reports: { projectId: string };
};

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

export const AnalyticsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen
        name="AnalyticsDashboard"
        component={AnalyticsDashboardScreen}
        options={{ 
          title: 'Analytics Dashboard',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ 
          title: 'Reports',
          headerBackTitle: 'Dashboard'
        }}
      />
    </Stack.Navigator>
  );
};