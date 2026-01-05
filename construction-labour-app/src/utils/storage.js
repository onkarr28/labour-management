import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  LABOURS: '@labours',
  CONTRACTOR_PROFILE: '@contractor_profile',
  APP_SETTINGS: '@app_settings',
  PAYMENT_HISTORY: '@payment_history',
};

/**
 * Save labours to storage
 */
export const saveLabours = async (labours) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LABOURS, JSON.stringify(labours));
    return true;
  } catch (error) {
    console.error('Error saving labours:', error);
    return false;
  }
};

/**
 * Get all labours from storage
 */
export const getLabours = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LABOURS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting labours:', error);
    return [];
  }
};

/**
 * Save contractor profile
 */
export const saveContractorProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.CONTRACTOR_PROFILE,
      JSON.stringify(profile)
    );
    return true;
  } catch (error) {
    console.error('Error saving contractor profile:', error);
    return false;
  }
};

/**
 * Get contractor profile
 */
export const getContractorProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONTRACTOR_PROFILE);
    return data
      ? JSON.parse(data)
      : { name: 'Contractor', businessName: '', contact: '' };
  } catch (error) {
    console.error('Error getting contractor profile:', error);
    return { name: 'Contractor', businessName: '', contact: '' };
  }
};

/**
 * Save app settings
 */
export const saveAppSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.APP_SETTINGS,
      JSON.stringify(settings)
    );
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Get app settings
 */
export const getAppSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          defaultDailyRate: 600,
          weekStartDay: 'monday',
          currency: '₹',
          darkMode: false,
        };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      defaultDailyRate: 600,
      weekStartDay: 'monday',
      currency: '₹',
      darkMode: false,
    };
  }
};

/**
 * Save payment history
 */
export const savePaymentHistory = async (payments) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PAYMENT_HISTORY,
      JSON.stringify(payments)
    );
    return true;
  } catch (error) {
    console.error('Error saving payment history:', error);
    return false;
  }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting payment history:', error);
    return [];
  }
};

/**
 * Clear all data
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

/**
 * Export all data as JSON
 */
export const exportAllData = async () => {
  try {
    const labours = await getLabours();
    const contractor = await getContractorProfile();
    const settings = await getAppSettings();
    const payments = await getPaymentHistory();

    return {
      exportDate: new Date().toISOString(),
      labours,
      contractor,
      settings,
      payments,
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

/**
 * Import data from JSON
 */
export const importData = async (data) => {
  try {
    if (data.labours) await saveLabours(data.labours);
    if (data.contractor) await saveContractorProfile(data.contractor);
    if (data.settings) await saveAppSettings(data.settings);
    if (data.payments) await savePaymentHistory(data.payments);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
