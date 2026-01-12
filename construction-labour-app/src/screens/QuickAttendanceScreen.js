import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useLabour } from '../context/LabourContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { getTodayString } from '../utils/dateHelpers';
import QuickActionButton from '../components/QuickActionButton';

const QuickAttendanceScreen = ({ navigation }) => {
  const { state, updateAttendance, refreshData } = useLabour();
  const { labours } = state;
  const today = getTodayString();

  const [attendanceStatus, setAttendanceStatus] = useState({}); // { workerId: 'full' | 'half' | 'absent' }
  const [workerSites, setWorkerSites] = useState({}); // { workerId: ['Site A', 'Site B'] }
  const [newSiteInput, setNewSiteInput] = useState({}); // { workerId: 'text' }
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isInitialized = useRef(false);

  // Handle pull-to-refresh (no auto-refresh to allow uninterrupted marking)
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  // Pre-fill from existing today's attendance ONLY ONCE on mount
  useEffect(() => {
    if (isInitialized.current) return; // Skip if already initialized
    
    const initial = {};
    const sites = {};
    labours.forEach((labour) => {
      const record = labour.attendance?.[today];
      if (record?.status === 'present' || record?.status === 'half-day') {
        initial[labour.id] = record.status === 'present' ? 'full' : 'half';
        const workerSites = record.sites || (record.site ? record.site.split(',').map(s => s.trim()) : []);
        sites[labour.id] = workerSites;
      }
    });
    setAttendanceStatus(initial);
    setWorkerSites(sites);
    isInitialized.current = true; // Mark as initialized
  }, [labours, today]);

  const toggleAttendanceStatus = (id) => {
    setAttendanceStatus((prev) => {
      const current = prev[id];
      if (!current) return { ...prev, [id]: 'full' }; // Not marked -> Full day
      if (current === 'full') return { ...prev, [id]: 'half' }; // Full -> Half day
      if (current === 'half') return { ...prev, [id]: undefined }; // Half -> Absent
      return { ...prev, [id]: undefined }; // Default to absent
    });
  };

    const addSiteToWorker = (workerId) => {
      const siteText = newSiteInput[workerId]?.trim();
      if (!siteText) return;
    
      const currentSites = workerSites[workerId] || [];
      if (!currentSites.includes(siteText)) {
        setWorkerSites({
          ...workerSites,
          [workerId]: [...currentSites, siteText]
        });
      }
      setNewSiteInput({ ...newSiteInput, [workerId]: '' });
    };

    const removeSiteFromWorker = (workerId, siteIndex) => {
      const currentSites = workerSites[workerId] || [];
      const updated = currentSites.filter((_, idx) => idx !== siteIndex);
      setWorkerSites({ ...workerSites, [workerId]: updated });
    };

  const handleSave = () => {
    labours.forEach((labour) => {
      const status = attendanceStatus[labour.id];
      const sites = workerSites[labour.id] || [];
      let attendanceRecord = {
        marked: true,
        sites: [],
        site: '',
      };
      
      if (status === 'full') {
        attendanceRecord.status = 'present';
        attendanceRecord.sites = sites;
        attendanceRecord.site = sites.length > 0 ? sites.join(', ') : '';
      } else if (status === 'half') {
        attendanceRecord.status = 'half-day';
        attendanceRecord.sites = sites;
        attendanceRecord.site = sites.length > 0 ? sites.join(', ') : '';
      } else {
        attendanceRecord.status = 'absent';
      }
      
      updateAttendance(labour.id, today, attendanceRecord);
    });
    navigation.goBack();
  };

  const renderItem = ({ item }) => {
    const status = attendanceStatus[item.id];
    const isSelected = !!status;
    const sites = workerSites[item.id] || [];
    const isFullDay = status === 'full';
    const isHalfDay = status === 'half';
    
    return (
      <View style={[styles.row, theme.shadows.soft]}>
        <TouchableOpacity
          style={styles.rowHeader}
          onPress={() => toggleAttendanceStatus(item.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.statusButton, isFullDay && styles.statusFullDay, isHalfDay && styles.statusHalfDay, !isSelected && styles.statusAbsent]}>
            <Text style={styles.statusButtonText}>
              {!isSelected ? 'Absent' : isFullDay ? 'Full' : 'Half'}
            </Text>
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{item.name}</Text>
            {item.trade ? (
              <Text style={styles.workerTrade}>{item.trade}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
        {isSelected && (
            <View style={styles.sitesContainer}>
              {/* Display existing sites as chips */}
              {sites.length > 0 && (
                <View style={styles.siteChipsContainer}>
                  {sites.map((site, index) => (
                    <View key={index} style={styles.siteChip}>
                      <Text style={styles.siteChipText}>{site}</Text>
                      <TouchableOpacity
                        onPress={() => removeSiteFromWorker(item.id, index)}
                        style={styles.removeChipButton}
                      >
                        <Text style={styles.removeChipText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {/* Input to add new site */}
              <View style={styles.addSiteRow}>
                <TextInput
                  style={styles.siteInput}
                  placeholder="Enter site name"
                  placeholderTextColor={colors.text.secondary}
                  value={newSiteInput[item.id] || ''}
                  onChangeText={(text) =>
                    setNewSiteInput({ ...newSiteInput, [item.id]: text })
                  }
                  onSubmitEditing={() => addSiteToWorker(item.id)}
                />
                <TouchableOpacity
                  style={styles.addSiteButton}
                  onPress={() => addSiteToWorker(item.id)}
                >
                  <Text style={styles.addSiteButtonText}>+ Add Site</Text>
                </TouchableOpacity>
              </View>
            </View>
        )}
      </View>
    );
  };

  const headerText = useMemo(() => {
    return new Date(today).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [today]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mark Today&apos;s Attendance</Text>
        <Text style={styles.subtitle}>{headerText}</Text>
      </View>

      <FlatList
        data={labours}
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
            <Text style={styles.emptyText}>No workers added yet</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <QuickActionButton
          title="Save Today&apos;s Attendance"
          onPress={handleSave}
          variant="mint"
        />
      </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  row: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary.mint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.primary.mint,
  },
  statusButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusFullDay: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  statusHalfDay: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  statusAbsent: {
    backgroundColor: colors.background,
    borderColor: colors.error,
  },
  statusButtonText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 10,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  workerTrade: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
    sitesContainer: {
      marginTop: theme.spacing.sm,
    },
    siteChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.sm,
    },
    siteChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary.mint,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.xs,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.xs,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    siteChipText: {
      ...typography.caption,
      color: colors.text.primary,
      fontWeight: '600',
      marginRight: theme.spacing.xs,
    },
    removeChipButton: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.text.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeChipText: {
      color: colors.primary.mint,
      fontSize: 16,
      fontWeight: 'bold',
      lineHeight: 18,
    },
    addSiteRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  siteInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      ...typography.caption,
      color: colors.text.primary,
      marginRight: theme.spacing.sm,
    },
    addSiteButton: {
      backgroundColor: colors.primary.blue,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    addSiteButtonText: {
      ...typography.caption,
      color: colors.text.primary,
      fontWeight: '600',
    },
});

export default QuickAttendanceScreen;
