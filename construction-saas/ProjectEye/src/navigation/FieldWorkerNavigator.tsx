// src/navigation/FieldWorkerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { DailyWorkScreen } from '../screens/worker/DailyWorkScreen';
import { WorkerProjectsScreen } from '../screens/worker/WorkerProjectsScreen';
import { WorkerExpensesScreen } from '../screens/worker/WorkerExpensesScreen';
import { WorkerProfileScreen } from '../screens/worker/WorkerProfileScreen';

export type FieldWorkerTabParamList = {
  DailyWork: undefined;
  MyProjects: undefined;
  Expenses: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<FieldWorkerTabParamList>();

export const FieldWorkerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'DailyWork':
              iconName = focused ? 'hammer' : 'hammer-outline';
              break;
            case 'MyProjects':
              iconName = focused ? 'folder' : 'folder-outline';
              break;
            case 'Expenses':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.gray500,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: 18,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="DailyWork" 
        component={DailyWorkScreen}
        options={{ 
          title: 'Daily Work',
          headerTitle: 'Daily Work Tracking'
        }}
      />
      <Tab.Screen 
        name="MyProjects" 
        component={WorkerProjectsScreen}
        options={{ 
          title: 'My Projects',
          headerTitle: 'My Projects'
        }}
      />
      <Tab.Screen 
        name="Expenses" 
        component={WorkerExpensesScreen}
        options={{ 
          title: 'Expenses',
          headerTitle: 'My Expenses'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={WorkerProfileScreen}
        options={{ 
          title: 'Profile',
          headerTitle: 'My Profile'
        }}
      />
    </Tab.Navigator>
  );
};