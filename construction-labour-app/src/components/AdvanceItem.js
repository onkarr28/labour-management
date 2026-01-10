import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';

const AdvanceItem = ({ advance, onEdit, onDelete, variant = 'advance' }) => {
  const { date, amount, note, paidBy, contractorName, receivedBy } = advance;

  return (
    <View
      style={[
        styles.card,
        theme.shadows.soft,
        variant === 'payment' && styles.cardPayment,
        variant === 'repayment' && styles.cardRepayment,
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{date}</Text>
          {contractorName && <Text style={styles.paidBy}>{contractorName}</Text>}
        </View>
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
  cardPayment: {
    borderLeftColor: colors.success,
  },
  cardRepayment: {
    borderLeftColor: colors.primary.blue,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  date: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  paidBy: {
    ...typography.caption,
    color: colors.primary.mint,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
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
