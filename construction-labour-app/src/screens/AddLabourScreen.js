import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLabour } from '../context/LabourContext';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { showToast } from '../components/Toast';
import QuickActionButton from '../components/QuickActionButton';
import { getTodayString } from '../utils/dateHelpers';
import { generateWorkerCredentials } from '../utils/credentialsHelper';
import { saveWorkerCredentials } from '../services/firebaseWorkers';

const trades = ['Worker', 'Helper'];
const idProofTypes = ['Aadhar', 'PAN', 'Voter ID'];

const AddLabourScreen = ({ navigation }) => {
  const { addLabour, state } = useLabour();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dailyRate: '600',
    joiningDate: getTodayString(),
    trade: '',
    idProofType: '',
    idProofNumber: '',
    photo: null,
  });

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission Required', 'Please allow access to photos to set worker image.', 'warning');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData({ ...formData, photo: result.assets[0].uri });
      }
    } catch (error) {
      showToast('Error', 'Could not open photo library', 'error');
    }
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim().length === 0) {
      showToast(
        'Required Field Missing',
        'Please enter worker name (minimum 3 characters)',
        'warning'
      );
      return false;
    }

    if (formData.name.length < 3) {
      showToast(
        'Invalid Name',
        'Name must be at least 3 characters long',
        'warning'
      );
      return false;
    }

    if (!formData.mobile || formData.mobile.trim().length === 0) {
      showToast(
        'Required Field Missing',
        'Please enter mobile number (10 digits)',
        'warning'
      );
      return false;
    }

    if (formData.mobile.length !== 10) {
      showToast(
        'Invalid Mobile Number',
        'Mobile number must be exactly 10 digits',
        'warning'
      );
      return false;
    }

    const isDuplicateMobile = state.labours.some(
      (labour) => labour.mobile === formData.mobile,
    );
    if (isDuplicateMobile) {
      showToast(
        'Duplicate Entry',
        'A worker with this mobile number already exists',
        'error'
      );
      return false;
    }

    const dailyRate = parseInt(formData.dailyRate);
    if (isNaN(dailyRate) || dailyRate < 200 || dailyRate > 5000) {
      showToast(
        'Invalid Daily Rate',
        'Daily rate must be between ₹200 and ₹5000',
        'warning'
      );
      return false;
    }

    if (!formData.trade) {
      showToast(
        'Required Field Missing',
        'Please select a trade/skill (Worker or Helper)',
        'warning'
      );
      return false;
    }

    return true;
  };

  const handleAddLabour = () => {
    if (!validateForm()) return;

    const credentials = generateWorkerCredentials(formData.name, formData.mobile);

    const newLabour = {
      id: `labour_${Date.now()}`,
      photo: formData.photo,
      name: formData.name,
      mobile: formData.mobile,
      dailyRate: parseInt(formData.dailyRate),
      joiningDate: formData.joiningDate,
      trade: formData.trade,
      idProofType: formData.idProofType || null,
      idProofNumber: formData.idProofNumber || null,
      loginId: credentials.loginId,
      password: credentials.password,
      contractorId: user?.contractorId,
      // Make visible to BOTH contractors immediately
      contractorIds: ['contractor_1', 'contractor_2'],
      attendance: {},
      advances: [],
      totalAdvance: 0,
      payments: [],
    };

    // Save worker credentials to Firebase immediately
    saveWorkerCredentials(newLabour.id, {
      name: newLabour.name,
      loginId: newLabour.loginId,
      password: newLabour.password,
      contractorId: user?.contractorId,
      contractorIds: ['contractor_1', 'contractor_2'],  // Both contractors
      mobile: newLabour.mobile,
    }).catch(error => {
      console.error('Failed to save worker credentials to Firebase:', error);
    });

    addLabour(newLabour);
    showToast(
      'Success!',
      `${formData.name} has been added successfully!\\n\\nLogin Credentials:\\nID: ${credentials.loginId}\\nPassword: ${credentials.password}`,
      'success',
      [
        {
          text: 'Add Another Worker',
          onPress: () => {
            setFormData({
              name: '',
              mobile: '',
              dailyRate: '600',
              joiningDate: getTodayString(),
              trade: '',
              idProofType: '',
              idProofNumber: '',
              photo: null,
            });
          },
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add New Worker</Text>
            <Text style={styles.subtitle}>Fill in the worker details</Text>
          </View>

          {/* Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={[styles.photoWrapper, theme.shadows.soft]}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              {formData.photo ? (
                <Image source={{ uri: formData.photo }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter worker name"
                placeholderTextColor={colors.text.secondary}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            {/* Mobile */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="10 digit mobile number"
                placeholderTextColor={colors.text.secondary}
                keyboardType="numeric"
                maxLength={10}
                value={formData.mobile}
                onChangeText={(text) =>
                  setFormData({ ...formData, mobile: text })
                }
              />
            </View>

            {/* Daily Rate */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Daily Rate (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 600"
                placeholderTextColor={colors.text.secondary}
                keyboardType="numeric"
                value={formData.dailyRate}
                onChangeText={(text) =>
                  setFormData({ ...formData, dailyRate: text })
                }
              />
            </View>

            {/* Trade / Skill */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Trade / Skill *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {trades.map((trade) => (
                  <TouchableOpacity
                    key={trade}
                    style={[
                      styles.chip,
                      formData.trade === trade && styles.chipActive,
                    ]}
                    onPress={() => setFormData({ ...formData, trade })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.trade === trade && styles.chipTextActive,
                      ]}
                    >
                      {trade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ID Proof Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ID Proof Type (optional)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {idProofTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      formData.idProofType === type && styles.chipActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, idProofType: type })
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.idProofType === type && styles.chipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ID Proof Number */}
            {formData.idProofType && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  {formData.idProofType} Number (optional)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${formData.idProofType} number`}
                  placeholderTextColor={colors.text.secondary}
                  value={formData.idProofNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, idProofNumber: text })
                  }
                />
              </View>
            )}

            {/* Joining Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Joining Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.secondary}
                value={formData.joiningDate}
                onChangeText={(text) =>
                  setFormData({ ...formData, joiningDate: text })
                }
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <QuickActionButton
              title="Add Worker"
              onPress={handleAddLabour}
              variant="success"
            />
            <QuickActionButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="error"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
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
  form: {
    marginBottom: theme.spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  photoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...typography.body,
    color: colors.text.primary,
  },
  chipScroll: {
    marginTop: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: theme.spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary.mint,
    borderColor: colors.primary.mint,
  },
  chipText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  buttons: {
    marginTop: theme.spacing.lg,
  },
});

export default AddLabourScreen;
