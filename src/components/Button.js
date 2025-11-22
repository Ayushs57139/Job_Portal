import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const { width } = Dimensions.get('window');
// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';
const isWideScreen = width > 768;
const isMobile = width <= 600;

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (variant === 'secondary') {
      baseStyle.push(styles.buttonSecondary);
    } else if (variant === 'outline') {
      baseStyle.push(styles.buttonOutline);
    }
    
    if (disabled) {
      baseStyle.push(styles.buttonDisabled);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    if (variant === 'secondary' || variant === 'outline') {
      baseStyle.push(styles.buttonSecondaryText);
    }
    
    if (textStyle) {
      baseStyle.push(textStyle);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textWhite : colors.primary} />
      ) : (
        <View style={styles.buttonContent}>
          <Text style={getTextStyle()}>{title}</Text>
          {icon && (
            <Ionicons 
              name={icon} 
              size={20} 
              color={variant === 'primary' ? colors.textWhite : colors.primary}
              style={styles.buttonIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: isWideScreen ? spacing.md : spacing.sm + 2,
    paddingHorizontal: isWideScreen ? spacing.lg : spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    minHeight: isMobile ? 44 : 48,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.button,
    color: colors.textWhite,
    fontSize: isWideScreen ? 16 : 14,
  },
  buttonSecondaryText: {
    color: colors.primary,
    fontSize: isWideScreen ? 16 : 14,
  },
});

export default Button;

