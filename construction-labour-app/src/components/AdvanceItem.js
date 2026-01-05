import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';

const AdvanceItem = ({ advance, onEdit, onDelete }) => {
  const { date, amount, note } = advance;

  return (
    <View style={[styles.card, theme.shadows.soft]}>
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.amount}>₹{amount}</Text>
      </View>
      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  date: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  amount: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '700',
  },
  note: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
});

export default AdvanceItem;
