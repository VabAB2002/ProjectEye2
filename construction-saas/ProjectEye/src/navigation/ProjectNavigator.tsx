import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectsScreen } from '../screens/projects/ProjectsScreen';
import { ProjectDetailsScreen } from '../screens/projects/ProjectDetailsScreen';
import { CreateProjectScreen } from '../screens/projects/CreateProjectScreen';
import { SimpleAnalyticsScreen } from '../screens/analytics/SimpleAnalyticsScreen';
import { SimpleReportsScreen } from '../screens/analytics/SimpleReportsScreen';
import { theme } from '../theme';

export type ProjectStackParamList = {
  ProjectsList: undefined;
  ProjectDetails: { projectId: string };
  CreateProject: undefined;
  SimpleAnalytics: { projectId: string };
  SimpleReports: { projectId: string };
};

const Stack = createNativeStackNavigator<ProjectStackParamList>();

export const ProjectNavigator: React.FC = () => {
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
        name="ProjectsList" 
        component={ProjectsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProjectDetails" 
        component={ProjectDetailsScreen}
        options={{ title: 'Project Details' }}
      />
      <Stack.Screen 
        name="CreateProject" 
        component={CreateProjectScreen}
        options={{ title: 'Create Project' }}
      />
      <Stack.Screen 
        name="SimpleAnalytics" 
        component={SimpleAnalyticsScreen}
        options={{ title: 'Project Health' }}
      />
      <Stack.Screen 
        name="SimpleReports" 
        component={SimpleReportsScreen}
        options={{ title: 'Share Reports' }}
      />
    </Stack.Navigator>
  );
};
