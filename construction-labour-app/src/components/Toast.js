import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';

let showToastRef = null;

export const Toast = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    buttons: [],
  });

  useEffect(() => {
    showToastRef = (toastConfig) => {
      setConfig(toastConfig);
      setVisible(true);
    };
    return () => {
      showToastRef = null;
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  const getIconForType = () => {
    switch (config.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getColorForType = () => {
    switch (config.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.primary.blue;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.toastContainer, { borderLeftColor: getColorForType() }]}>
          <View style={styles.header}>
            <Text style={styles.icon}>{getIconForType()}</Text>
            <Text style={styles.title}>{config.title}</Text>
          </View>
          <Text style={styles.message}>{config.message}</Text>
          <View style={styles.buttonContainer}>
            {config.buttons && config.buttons.length > 0 ? (
              config.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.buttonCancel,
                  ]}
                  onPress={() => {
                    handleClose();
                    if (button.onPress) button.onPress();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.buttonTextCancel,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleClose}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const showToast = (title, message, type = 'info', buttons = []) => {
  if (showToastRef) {
    showToastRef({ title, message, type, buttons });
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  toastContainer: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    minWidth: 280,
    maxWidth: 400,
    borderLeftWidth: 4,
    ...theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: colors.primary.mint,
    borderRadius: theme.radius.sm,
  },
  buttonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  buttonTextCancel: {
    color: colors.text.secondary,
  },
});
