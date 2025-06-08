// src/navigation/ProgressNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProgressListScreen } from '../screens/progress/ProgressListScreen';
import { CreateProgressScreen } from '../screens/progress/CreateProgressScreen';
import { ProgressDetailsScreen } from '../screens/progress/ProgressDetailsScreen';
import { theme } from '../theme';

export type ProgressStackParamList = {
  ProgressList: { projectId?: string };
  CreateProgress: { projectId: string };
  ProgressDetails: { projectId: string; updateId: string };
};

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export const ProgressNavigator: React.FC = () => {
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
        name="ProgressList" 
        component={ProgressListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreateProgress" 
        component={CreateProgressScreen}
        options={{ title: 'Daily Progress Update' }}
      />
      <Stack.Screen 
        name="ProgressDetails" 
        component={ProgressDetailsScreen}
        options={{ title: 'Progress Details' }}
      />
    </Stack.Navigator>
  );
};