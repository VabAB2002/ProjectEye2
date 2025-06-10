import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { ProjectNavigator } from './ProjectNavigator';
import { FinancialNavigator } from './FinancialNavigator';
import { OwnerDashboardScreen } from '../screens/dashboard/OwnerDashboardScreen';
import { ComprehensiveAnalyticsScreen } from '../screens/analytics/ComprehensiveAnalyticsScreen';
import { TeamMilestonesScreen } from '../screens/management/TeamMilestonesScreen';


export type OwnerTabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Financial: { projectId?: string };
  Analytics: undefined;
  Management: undefined;
};

const Tab = createBottomTabNavigator<OwnerTabParamList>();

export const OwnerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Projects':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'Financial':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Management':
              iconName = focused ? 'people' : 'people-outline';
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
        name="Dashboard" 
        component={OwnerDashboardScreen}
        options={{ 
          title: 'Dashboard',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectNavigator}
        options={{ 
          title: 'Projects',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Financial" 
        component={FinancialNavigator}
        options={{ 
          title: 'Financial',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={ComprehensiveAnalyticsScreen}
        options={{ 
          title: 'Analytics',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Management" 
        component={TeamMilestonesScreen}
        options={{ 
          title: 'Management',
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

