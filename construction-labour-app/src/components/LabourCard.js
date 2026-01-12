import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import {
  calculatePresentDays,
  calculateEarned,
  calculateTotalAdvances,
  calculateTotalPayments,
  calculateNetBalance,
} from '../utils/calculations';

const LabourCard = ({ labour, onPress }) => {
  const balance = useMemo(() => {
    const presentDays = calculatePresentDays(labour.attendance);
    const earned = calculateEarned(presentDays, labour.dailyRate);
    const totalAdvances = calculateTotalAdvances(labour.advances);
    const totalPayments = calculateTotalPayments(labour.payments);
    return calculateNetBalance(earned, totalAdvances, totalPayments);
  }, [labour]);

  const getBalanceColor = () => {
    if (balance === 0) return colors.success;
    if (balance > 0) return colors.warning;
    return colors.error;
  };

  const getBalanceLabel = () => {
    if (balance === 0) return 'Settled';
    if (balance > 0) return `Pay: ₹${balance}`;
    return `Due: ₹${Math.abs(balance)}`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, theme.shadows.soft]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.photoContainer}>
        {labour.photoUrl || labour.photo ? (
          <Image
            source={{ uri: labour.photoUrl || labour.photo }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Text style={styles.initials}>
              {labour.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{labour.name}</Text>
        {labour.trade ? (
          <Text style={styles.trade}>{labour.trade}</Text>
        ) : null}
        
        <View style={styles.balanceContainer}>
          <View
            style={[
              styles.balanceBadge,
              { backgroundColor: getBalanceColor() },
            ]}
          >
            <Text style={styles.balanceText}>{getBalanceLabel()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  photoContainer: {
    marginRight: theme.spacing.md,
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    ...typography.h4,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  trade: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  balanceContainer: {
    marginTop: theme.spacing.xs,
  },
  balanceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  balanceText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  arrow: {
    marginLeft: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
  arrowText: {
    ...typography.h3,
    color: colors.text.secondary,
  },
});

export default LabourCard;
