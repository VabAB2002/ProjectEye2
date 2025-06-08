// src/screens/progress/ProgressDetailsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const ProgressDetailsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Progress Details - Coming Soon</Text>
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
  text: {
    fontSize: 18,
    color: theme.colors.text,
  },
});