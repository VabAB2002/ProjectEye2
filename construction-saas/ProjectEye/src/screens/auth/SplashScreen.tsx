import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { theme } from '../../theme';

export const SplashScreen: React.FC = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="construct" size={40} color={theme.colors.accent} />
          </View>
          <Text style={styles.title}>ProjectEye</Text>
          <Text style={styles.tagline}>Construction Management Made Simple</Text>
        </View>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.accent} 
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl * 2,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: `${theme.colors.accent}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    fontWeight: '500',
  },
});