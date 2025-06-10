import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './TabNavigator';
import { FieldWorkerNavigator } from './FieldWorkerNavigator';
import { ContractorNavigator } from './ContractorNavigator';
import { OwnerNavigator } from './OwnerNavigator';
import { SplashScreen } from '../screens/auth/SplashScreen';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  const getMainNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }

    // Route based on user role
    switch (user.role) {
      case 'VIEWER':
        return <FieldWorkerNavigator />;
      case 'CONTRACTOR':
        return <ContractorNavigator />;
      case 'OWNER':
        return <OwnerNavigator />;
      default:
        // Fallback to the existing MainNavigator for any other roles or existing users
        return <MainNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {getMainNavigator()}
    </NavigationContainer>
  );
};