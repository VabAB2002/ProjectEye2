import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  rightIcon,
  onRightIconPress,
  variant = 'filled',
  size = 'medium',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = () => {
    const baseStyle = [styles.inputContainer, styles[variant], styles[`${size}Container`]];
    
    if (isFocused) {
      baseStyle.push(styles.focused);
    }
    
    if (error) {
      baseStyle.push(styles.error);
    }
    
    return baseStyle;
  };

  const getIconColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.accent;
    return theme.colors.gray500;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}
      
      <View style={getContainerStyle()}>
        {icon && (
          <Ionicons
            name={icon}
            size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            styles[`${size}Input`],
            style
          ]}
          placeholderTextColor={theme.colors.gray500}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={rightIcon}
              size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <View style={styles.messageContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons 
                name="alert-circle-outline" 
                size={14} 
                color={theme.colors.error} 
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.2,
  },
  labelError: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    backgroundColor: theme.colors.background,
  },
  default: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.gray300,
  },
  filled: {
    backgroundColor: theme.colors.gray50,
    borderColor: theme.colors.gray200,
  },
  outlined: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.gray300,
    borderWidth: 1.5,
  },
  smallContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 40,
  },
  mediumContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  largeContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    minHeight: 56,
  },
  focused: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  error: {
    borderColor: theme.colors.error,
    backgroundColor: `${theme.colors.error}05`,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIconContainer: {
    padding: theme.spacing.xs,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: '500',
    paddingVertical: 0,
  },
  smallInput: {
    fontSize: 14,
  },
  mediumInput: {
    fontSize: 16,
  },
  largeInput: {
    fontSize: 18,
  },
  messageContainer: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: theme.spacing.xs,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.error,
    fontWeight: '500',
    flex: 1,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
});