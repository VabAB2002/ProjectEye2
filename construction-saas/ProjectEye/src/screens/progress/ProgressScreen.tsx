import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ProgressScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Project Progress</Text>
        </View>
        
        <View style={styles.content}>
          {/* Progress content will be added here */}
          <Text style={styles.text}>Project progress tracking coming soon...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.lg,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
}); 