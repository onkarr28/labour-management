import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveContractorCredentials } from '../services/firebaseContractors';

export const AuthContext = createContext();

// Multiple contractors - stored in Firebase as well
const CONTRACTORS = {
  'shivaji_kokate': {
    username: 'shivaji_kokate',
    password: 'Shiv@2026',
    name: 'Shivaji Kokate',
    contractorId: 'contractor_1',
  },
  'dattatray_jagtap': {
    username: 'dattatray_jagtap',
    password: 'Datta@2026',
    name: 'Dattatray Jagtap',
    contractorId: 'contractor_2',
  },
};

// Initialize contractors in Firebase
const initializeContractors = async () => {
  try {
    for (const [key, contractor] of Object.entries(CONTRACTORS)) {
      await saveContractorCredentials(contractor.contractorId, contractor);
    }
  } catch (error) {
    console.error('Error initializing contractors:', error);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in and initialize contractors
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Initialize contractors in Firebase
        await initializeContractors();
        
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username, password, labours) => {
    // Check if contractor login
    const contractor = Object.values(CONTRACTORS).find(
      (c) => c.username === username && c.password === password
    );

    if (contractor) {
      const userData = {
        role: 'contractor',
        username: contractor.username,
        contractorId: contractor.contractorId,
        name: contractor.name,
      };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    // Check worker login
    const worker = labours.find(
      (l) => l.loginId === username && l.password === password
    );

    if (worker) {
      const userData = {
        role: 'worker',
        username: worker.loginId,
        workerId: worker.id,
        name: worker.name,
        // Worker can be assigned to multiple contractors
        contractorIds: worker.contractorIds || [worker.contractorId],
      };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    return { success: false, message: 'Invalid credentials' };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isContractor: user?.role === 'contractor',
    isWorker: user?.role === 'worker',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
