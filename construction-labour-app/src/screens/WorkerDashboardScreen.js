import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useLabour } from '../context/LabourContext';
import { uploadWorkerPhoto } from '../services/firebasePhotoStorage';
import { showToast } from '../components/Toast';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { LogOut } from '../components/Icons';
import AdvanceItem from '../components/AdvanceItem';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  calculatePresentDays,
  calculateEarned,
  calculateTotalAdvances,
  calculateTotalPayments,
  calculateNetBalance,
  calculateWeekSummary,
} from '../utils/calculations';
import { formatDateForDisplay, getWeekStart } from '../utils/dateHelpers';

const WorkerDashboardScreen = () => {
  const { user, logout } = useAuth();
  const { state, updateLabour } = useLabour();
  const worker = state.labours.find((l) => l.id === user?.workerId);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  const handleChangePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission Required', 'Please allow access to photos', 'warning');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingPhoto(true);
        try {
          // Upload to Firebase Storage
          const photoUrl = await uploadWorkerPhoto(worker.id, result.assets[0].uri);
          
          // Update worker profile
          const updatedWorker = {
            ...worker,
            photoUrl: photoUrl,
            photo: photoUrl,
          };
          
          updateLabour(updatedWorker);
          showToast('Success', 'Profile photo updated successfully!', 'success');
        } catch (error) {
          console.error('Photo upload failed:', error);
          showToast('Error', 'Failed to upload photo. Please try again.', 'error');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('Error', 'Could not open photo library', 'error');
    }
  };

  const summary = useMemo(() => {
    if (!worker) return null;
    const presentDays = calculatePresentDays(worker.attendance);
    const earned = calculateEarned(presentDays, worker.dailyRate);
    const totalAdvances = calculateTotalAdvances(worker.advances);
    const totalPaid = calculateTotalPayments(worker.payments);
    const netBalance = calculateNetBalance(earned, totalAdvances, totalPaid);
    const weekStart = getWeekStart();
    const weeklySummary = calculateWeekSummary(worker, weekStart);

    return { presentDays, earned, totalAdvances, totalPaid, netBalance, weeklySummary };
  }, [worker]);

  // Get site work history
  const siteHistory = useMemo(() => {
    if (!worker || !worker.attendance) return [];
    
    const history = [];
    Object.entries(worker.attendance).forEach(([date, record]) => {
      if (record.status === 'present') {
        const sites = record.sites || (record.site ? [record.site] : []);
        if (sites.length > 0) {
          history.push({
            date,
            sites: sites.join(' and '),
          });
        }
      }
    });
    
    // Sort by date descending (most recent first)
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [worker]);

  if (!worker) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Worker data not found</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome, {worker.name}!</Text>
            <Text style={styles.subtitle}>Your Work Summary</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
            <LogOut size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Photo Section */}
        <View style={[styles.photoSection, theme.shadows.soft]}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <View style={styles.photoPlaceholder}>
                <ActivityIndicator size="large" color={colors.primary.mint} />
                <Text style={styles.photoPlaceholderText}>Uploading...</Text>
              </View>
            ) : worker.photoUrl || worker.photo ? (
              <Image 
                source={{ uri: worker.photoUrl || worker.photo }} 
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitials}>
                  {worker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
          >
            <Text style={styles.changePhotoText}>
              {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Worker Info Card */}
        <View style={[styles.infoCard, theme.shadows.soft]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile:</Text>
            <Text style={styles.infoValue}>{worker.mobile}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Daily Rate:</Text>
            <Text style={styles.infoValue}>₹{worker.dailyRate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trade:</Text>
            <Text style={styles.infoValue}>{worker.trade}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Joined:</Text>
            <Text style={styles.infoValue}>
              {formatDateForDisplay(worker.joiningDate)}
            </Text>
          </View>
        </View>

        {/* Overall Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Summary</Text>
          <View style={styles.summaryCards}>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary.blue }]}>
              <Text style={styles.summaryLabel}>Days Worked</Text>
              <Text style={styles.summaryValue}>{summary.presentDays % 1 === 0 ? summary.presentDays : summary.presentDays.toFixed(1)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary.mint }]}>
              <Text style={styles.summaryLabel}>Total Earned</Text>
              <Text style={styles.summaryValue}>₹{summary.earned}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.warning }]}>
              <Text style={styles.summaryLabel}>Advances Taken</Text>
              <Text style={styles.summaryValue}>₹{summary.totalAdvances}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary.pink }]}>
              <Text style={styles.summaryLabel}>Paid to You</Text>
              <Text style={styles.summaryValue}>₹{summary.totalPaid}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.success }]}>
              <Text style={styles.summaryLabel}>Balance Due</Text>
              <Text style={styles.summaryValue}>₹{summary.netBalance}</Text>
            </View>
          </View>
        </View>

        {/* Weekly Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={[styles.weeklyBreakdown, theme.shadows.soft]}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Days Present:</Text>
              <Text style={styles.breakdownValue}>{summary.weeklySummary.presentDays % 1 === 0 ? summary.weeklySummary.presentDays : summary.weeklySummary.presentDays.toFixed(1)} days</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Amount Earned:</Text>
              <Text style={styles.breakdownValue}>₹{summary.weeklySummary.earned}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Advances Taken:</Text>
              <Text style={styles.breakdownValue}>₹{summary.weeklySummary.weekAdvances}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownRowHighlight]}>
              <Text style={styles.breakdownLabelHighlight}>Amount Due:</Text>
              <Text style={styles.breakdownValueHighlight}>₹{summary.weeklySummary.netPay}</Text>
            </View>
          </View>
        </View>

        {/* Advances History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Advances</Text>
          {worker.advances && worker.advances.length > 0 ? (
            worker.advances.map((advance, index) => (
              <AdvanceItem key={index} advance={advance} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No advances taken</Text>
            </View>
          )}
        </View>

        {/* Payments History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments Received</Text>
          {worker.payments && worker.payments.length > 0 ? (
            worker.payments.map((payment, index) => (
              <AdvanceItem key={index} advance={payment} variant="payment" />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No payments received</Text>
            </View>
          )}
        </View>

        {/* Site Work History */}
        {siteHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Worked Sites</Text>
            {siteHistory.map((record, index) => (
              <View key={index} style={[styles.siteHistoryCard, theme.shadows.soft]}>
                <View style={styles.siteHistoryDate}>
                  <Text style={styles.siteHistoryDateText}>
                    {formatDateForDisplay(record.date)}
                  </Text>
                </View>
                <View style={styles.siteHistoryLocation}>
                  <Text style={styles.siteHistoryLocationText}>{record.sites}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
      
      <ConfirmDialog
        visible={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  logoutIcon: {
    padding: theme.spacing.sm,
  },
  greeting: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  logoutIcon: {
    padding: theme.spacing.sm,
  },
  photoSection: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitials: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: '700',
  },
  photoPlaceholderText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  changePhotoButton: {
    backgroundColor: colors.primary.blue,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  changePhotoText: {
    ...typography.bodySmall,
    color: colors.card,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.text.primary,
  },
  weeklyBreakdown: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  breakdownRowHighlight: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
    backgroundColor: colors.background,
  },
  breakdownLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  breakdownLabelHighlight: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '700',
  },
  breakdownValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  breakdownValueHighlight: {
    ...typography.h4,
    color: colors.success,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  emptyStateText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  siteHistoryCard: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  siteHistoryDate: {
    flex: 1,
  },
  siteHistoryDateText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  siteHistoryLocation: {
    flex: 2,
    alignItems: 'flex-end',
  },
  siteHistoryLocationText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    ...typography.h4,
    color: colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  logoutButton: {
    backgroundColor: colors.primary.mint,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  logoutButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default WorkerDashboardScreen;
