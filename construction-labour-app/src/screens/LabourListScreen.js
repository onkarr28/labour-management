import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useLabour } from '../context/LabourContext';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import LabourCard from '../components/LabourCard';

import { Search } from '../components/Icons';

const LabourListScreen = ({ navigation }) => {
  const { state, refreshData } = useLabour();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [filterTrade, setFilterTrade] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'balance', 'date'
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh disabled to prevent interference with user input
  // Use pull-to-refresh instead

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  // All workers are visible to both contractors - no filtering needed
  const contractorLabours = useMemo(() => {
    return state.labours;  // Show ALL workers to both contractors
  }, [state.labours, refreshKey]);

  const filteredAndSortedLabours = useMemo(() => {
    let result = [...contractorLabours];

    // Filter by search text
    if (searchText) {
      result = result.filter((labour) =>
        labour.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by trade
    if (filterTrade) {
      result = result.filter((labour) => labour.trade === filterTrade);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'balance':
        result.sort((a, b) => (b.currentBalance || 0) - (a.currentBalance || 0));
        break;
      case 'date':
        result.sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
        break;
      default:
        break;
    }

    return result;
  }, [contractorLabours, searchText, filterTrade, sortBy]);

  const trades = ['Worker', 'Helper'];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, theme.shadows.soft]}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workers..."
            placeholderTextColor={colors.text.secondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Filter & Sort */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {trades.map((trade) => (
            <TouchableOpacity
              key={trade}
              style={[
                styles.filterButton,
                filterTrade === trade && styles.filterButtonActive,
              ]}
              onPress={() => setFilterTrade(filterTrade === trade ? '' : trade)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterTrade === trade && styles.filterButtonTextActive,
                ]}
              >
                {trade}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Labours List */}
      <FlatList
        data={filteredAndSortedLabours}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <LabourCard
              labour={item}
              onPress={() => navigation.navigate('LabourDetail', { labourId: item.id })}
            />
          </View>
        )}
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
            <Text style={styles.emptyStateText}>
              {state.labours.length === 0
                ? 'No workers added yet'
                : 'No workers match your search'}
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.fab, theme.shadows.medium]}
        onPress={() => navigation.navigate('AddLabour')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.md,
    ...typography.body,
    color: colors.text.primary,
  },
  filterSection: {
    paddingVertical: theme.spacing.md,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    backgroundColor: colors.card,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary.mint,
    borderColor: colors.primary.mint,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    ...typography.h1,
    color: colors.text.primary,
  },
});

export default LabourListScreen;
