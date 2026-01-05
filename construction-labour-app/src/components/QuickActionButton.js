import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';

const QuickActionButton = ({ title, onPress, variant = 'primary', icon: Icon }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary.pink;
      case 'mint':
        return colors.primary.mint;
      case 'blue':
        return colors.primary.blue;
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      default:
        return colors.primary.pink;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        theme.shadows.soft,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {Icon && <Icon size={20} color={colors.text.primary} style={styles.icon} />}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default QuickActionButton;
