import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { ProjectNavigator } from './ProjectNavigator';
import { ProgressNavigator } from './ProgressNavigator';
import { FinancialScreen } from '../screens/financial/FinancialScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

export type TabParamList = {
  Projects: undefined;
  Progress: { projectId?: string };
  Financial: { projectId?: string };
  More: undefined;
};

export type DrawerParamList = {
  Main: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const TabNavigatorComponent: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Projects':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'Progress':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Financial':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
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
        name="Projects" 
        component={ProjectNavigator}
        options={{ 
          title: 'Projects',
          headerShown: false 
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressNavigator}
        options={{ title: 'Progress', headerShown: false }}
      />
      <Tab.Screen 
        name="Financial" 
        component={FinancialScreen}
        options={{ title: 'Financial' }}
      />
      <Tab.Screen 
        name="More" 
        component={SettingsScreen}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.accent,
        drawerInactiveTintColor: theme.colors.text,
      }}
    >
      <Drawer.Screen 
        name="Main" 
        component={TabNavigatorComponent}
        options={{ title: 'Home' }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Drawer.Navigator>
  );
};