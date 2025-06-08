import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectsScreen } from '../screens/projects/ProjectsScreen';
import { ProjectDetailsScreen } from '../screens/projects/ProjectDetailsScreen';
import { CreateProjectScreen } from '../screens/projects/CreateProjectScreen';
import { theme } from '../theme';

export type ProjectStackParamList = {
  ProjectsList: undefined;
  ProjectDetails: { projectId: string };
  CreateProject: undefined;
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
    </Stack.Navigator>
  );
};
