// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { RegistrationScreen } from '../screens/auth/RegistrationScreen';
import { theme } from '../theme';
import { UserRole } from '../api/types';

export type AuthStackParamList = {
  Login: undefined;
  RoleSelection: undefined;
  Registration: { role: UserRole };
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Sign In'
        }}
      />
      <Stack.Screen 
        name="RoleSelection" 
        component={RoleSelectionScreen}
        options={{
          title: 'Choose Your Role'
        }}
      />
      <Stack.Screen 
        name="Registration" 
        component={RegistrationScreen}
        options={{
          title: 'Create Account'
        }}
      />
    </Stack.Navigator>
  );
};