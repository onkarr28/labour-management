import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';

const WeeklySummaryCard = ({ label, value, color = 'primary' }) => {
  const getCardColor = () => {
    switch (color) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'blue':
        return colors.primary.blue;
      default:
        return colors.primary.pink;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: getCardColor() }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  value: {
    ...typography.h3,
    color: colors.text.primary,
  },
});

export default WeeklySummaryCard;
