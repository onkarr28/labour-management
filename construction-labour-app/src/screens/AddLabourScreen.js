import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLabour } from '../context/LabourContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import QuickActionButton from '../components/QuickActionButton';
import { getTodayString } from '../utils/dateHelpers';

const AddLabourScreen = ({ navigation }) => {
  const { addLabour } = useLabour();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dailyRate: '600',
    joiningDate: getTodayString(),
  });

  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) {
      Alert.alert('Error', 'Name must be at least 3 characters');
      return false;
    }

    if (!formData.mobile || formData.mobile.length !== 10) {
      Alert.alert('Error', 'Mobile number must be exactly 10 digits');
      return false;
    }

    const dailyRate = parseInt(formData.dailyRate);
    if (isNaN(dailyRate) || dailyRate < 200 || dailyRate > 5000) {
      Alert.alert('Error', 'Daily rate must be between ₹200 and ₹5000');
      return false;
    }

    return true;
  };

  const handleAddLabour = () => {
    if (!validateForm()) return;

    const newLabour = {
      id: `labour_${Date.now()}`,
      photo: null,
      name: formData.name,
      mobile: formData.mobile,
      dailyRate: parseInt(formData.dailyRate),
      joiningDate: formData.joiningDate,
      attendance: {},
      advances: [],
      totalAdvance: 0,
      currentBalance: 0,
    };

    addLabour(newLabour);
    Alert.alert('Success', 'Worker added successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add New Worker</Text>
            <Text style={styles.subtitle}>Fill in the worker details</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  buttons: {
    marginTop: theme.spacing.lg,
  },
});

export default AddLabourScreen;
