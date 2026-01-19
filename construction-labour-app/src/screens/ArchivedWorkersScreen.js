import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useLabour } from '../context/LabourContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { ChevronLeft } from '../components/Icons';

const ArchivedWorkersScreen = ({ navigation }) => {
  const { state, refreshData, restoreLabour } = useLabour();
  const [refreshing, setRefreshing] = useState(false);

  const archivedLabours = useMemo(
    () => state.labours.filter((l) => l.deleted),
    [state.labours]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleRestore = (id) => {
    restoreLabour(id);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, theme.shadows.soft]}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.mobile}>{item.mobile}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.detailLabel}>Daily Rate:</Text>
        <Text style={styles.detailValue}>₹{item.dailyRate}</Text>
      </View>
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={() => handleRestore(item.id)}
      >
        <Text style={styles.restoreButtonText}>Restore</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Archived Workers</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={archivedLabours}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.mint}
            colors={[colors.primary.mint]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No archived workers</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  name: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  mobile: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  restoreButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: colors.primary.mint,
  },
  restoreButtonText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});

export default ArchivedWorkersScreen;
