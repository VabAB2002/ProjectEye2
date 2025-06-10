import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/auth.store';

interface ProfileButtonProps {
  onPress: () => void;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ onPress }) => {
  const { user } = useAuthStore();

  const getInitials = () => {
    if (!user) return 'U';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return firstInitial + lastInitial;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.profileCircle}>
        <Text style={styles.initials}>{getInitials()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  initials: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
});