import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { theme } from '../../theme';

export const SplashScreen: React.FC = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProjectEye</Text>
      <Text style={styles.tagline}>Construction Management Made Simple</Text>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.accent} 
        style={styles.loader} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxxl,
  },
  loader: {
    marginTop: theme.spacing.xxl,
  },
});