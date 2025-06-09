import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MilestoneListScreen } from '../screens/milestones/MilestoneListScreen';
import { CreateMilestoneScreen } from '../screens/milestones/CreateMilestoneScreen';
import { MilestoneDetailsScreen } from '../screens/milestones/MilestoneDetailsScreen';
import { theme } from '../theme';

export type MilestoneStackParamList = {
  MilestoneList: { projectId?: string };
  CreateMilestone: { projectId: string };
  MilestoneDetails: { projectId: string; milestoneId: string };
};

const Stack = createNativeStackNavigator<MilestoneStackParamList>();

export const MilestoneNavigator: React.FC = () => {
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
        name="MilestoneList" 
        component={MilestoneListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreateMilestone" 
        component={CreateMilestoneScreen}
        options={{ title: 'Create Milestone' }}
      />
      <Stack.Screen 
        name="MilestoneDetails" 
        component={MilestoneDetailsScreen}
        options={{ title: 'Milestone Details' }}
      />
    </Stack.Navigator>
  );
};