import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';

const SummaryCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => {
  const getCardColor = () => {
    switch (color) {
      case 'primary':
        return colors.primary.pink;
      case 'mint':
        return colors.primary.mint;
      case 'blue':
        return colors.primary.blue;
      default:
        return colors.primary.pink;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: getCardColor() }, theme.shadows.soft]}>
      <View style={styles.header}>
        {Icon && <Icon size={24} color={colors.text.primary} />}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  value: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

export default SummaryCard;
