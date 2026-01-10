import React, { createContext, useReducer, useEffect } from 'react';
import * as StorageService from '../utils/storage';
import { fetchLaboursFromFirebase, syncLaboursToFirebase, deleteAllLaboursFromFirebase } from '../services/firebaseLabours';

export const LabourContext = createContext();

// Empty initial workers - will be synced from Firebase
const testWorkers = [];

const initialState = {
  labours: testWorkers,
  contractorProfile: { name: 'Contractor', businessName: '', contact: '' },
  appSettings: {
    defaultDailyRate: 600,
    weekStartDay: 'monday',
    currency: '₹',
    darkMode: false,
  },
  paymentHistory: [],
  loading: true,
  error: null,
};

const labourReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LABOURS':
      return { ...state, labours: action.payload };

    case 'ADD_LABOUR':
      return { ...state, labours: [...state.labours, action.payload] };

    case 'UPDATE_LABOUR':
      return {
        ...state,
        labours: state.labours.map((labour) =>
          labour.id === action.payload.id ? action.payload : labour
        ),
      };

    case 'DELETE_LABOUR':
      return {
        ...state,
        labours: state.labours.filter((labour) => labour.id !== action.payload),
      };

    case 'UPDATE_ATTENDANCE':
      return {
        ...state,
        labours: state.labours.map((labour) =>
          labour.id === action.payload.labourId
            ? {
                ...labour,
                attendance: {
                  ...labour.attendance,
                  [action.payload.date]: action.payload.record,
                },
              }
            : labour
        ),
      };

    case 'ADD_ADVANCE':
      return {
        ...state,
        labours: state.labours.map((labour) =>
          labour.id === action.payload.labourId
            ? {
                ...labour,
                advances: [...(labour.advances || []), action.payload.advance],
                totalAdvance:
                  (labour.totalAdvance || 0) + action.payload.advance.amount,
              }
            : labour
        ),
      };

    case 'DELETE_ADVANCE':
      return {
        ...state,
        labours: state.labours.map((labour) =>
          labour.id === action.payload.labourId
            ? {
                ...labour,
                advances: labour.advances.filter(
                  (_, idx) => idx !== action.payload.advanceIndex
                ),
                totalAdvance:
                  (labour.totalAdvance || 0) -
                  labour.advances[action.payload.advanceIndex].amount,
              }
            : labour
        ),
      };

    case 'RECORD_PAYMENT':
      return {
        ...state,
        labours: state.labours.map((labour) =>
          labour.id === action.payload.labourId
            ? {
                ...labour,
                payments: [...(labour.payments || []), action.payload.payment],
              }
            : labour
        ),
        paymentHistory: [...state.paymentHistory, action.payload],
      };

    case 'RECORD_REPAYMENT':
      return {
        ...state,
        labours: state.labours.map((labour) =>
          labour.id === action.payload.labourId
            ? {
                ...labour,
                repayments: [...(labour.repayments || []), action.payload.repayment],
              }
            : labour
        ),
      };

    case 'SET_CONTRACTOR_PROFILE':
      return { ...state, contractorProfile: action.payload };

    case 'SET_APP_SETTINGS':
      return { ...state, appSettings: action.payload };

    case 'SET_PAYMENT_HISTORY':
      return { ...state, paymentHistory: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
};

export const LabourProvider = ({ children }) => {
  const [state, dispatch] = useReducer(labourReducer, initialState);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [firebaseLabours, contractor, settings, payments] = await Promise.all([
          fetchLaboursFromFirebase(),
          StorageService.getContractorProfile(),
          StorageService.getAppSettings(),
          StorageService.getPaymentHistory(),
        ]);

        if (firebaseLabours && firebaseLabours.length > 0) {
          dispatch({ type: 'SET_LABOURS', payload: firebaseLabours });
        }

        dispatch({ type: 'SET_CONTRACTOR_PROFILE', payload: contractor });
        dispatch({ type: 'SET_APP_SETTINGS', payload: settings });
        dispatch({ type: 'SET_PAYMENT_HISTORY', payload: payments });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Persist labours to storage whenever they change
  useEffect(() => {
    if (!state.loading) {
      StorageService.saveLabours(state.labours);
      // Also sync to Firebase
      syncLaboursToFirebase(state.labours);
    }
  }, [state.labours, state.loading]);

  // Persist contractor profile
  useEffect(() => {
    if (!state.loading) {
      StorageService.saveContractorProfile(state.contractorProfile);
    }
  }, [state.contractorProfile, state.loading]);

  // Persist app settings
  useEffect(() => {
    if (!state.loading) {
      StorageService.saveAppSettings(state.appSettings);
    }
  }, [state.appSettings, state.loading]);

  // Persist payment history
  useEffect(() => {
    if (!state.loading) {
      StorageService.savePaymentHistory(state.paymentHistory);
    }
  }, [state.paymentHistory, state.loading]);

  const value = {
    state,
    dispatch,
    // Convenience functions
    addLabour: (labour) => dispatch({ type: 'ADD_LABOUR', payload: labour }),
    updateLabour: (labour) =>
      dispatch({ type: 'UPDATE_LABOUR', payload: labour }),
    deleteLabour: (labourId) =>
      dispatch({ type: 'DELETE_LABOUR', payload: labourId }),
    updateAttendance: (labourId, date, record) =>
      dispatch({
        type: 'UPDATE_ATTENDANCE',
        payload: { labourId, date, record },
      }),
    addAdvance: (labourId, advance) =>
      dispatch({ type: 'ADD_ADVANCE', payload: { labourId, advance } }),
    deleteAdvance: (labourId, advanceIndex) =>
      dispatch({
        type: 'DELETE_ADVANCE',
        payload: { labourId, advanceIndex },
      }),
    recordPayment: (payment) =>
      dispatch({ type: 'RECORD_PAYMENT', payload: payment }),
    recordRepayment: (labourId, repayment) =>
      dispatch({ type: 'RECORD_REPAYMENT', payload: { labourId, repayment } }),
    setContractorProfile: (profile) =>
      dispatch({ type: 'SET_CONTRACTOR_PROFILE', payload: profile }),
    setAppSettings: (settings) =>
      dispatch({ type: 'SET_APP_SETTINGS', payload: settings }),
    refreshData: async () => {
      try {
        const firebaseLabours = await fetchLaboursFromFirebase();
        if (firebaseLabours && firebaseLabours.length >= 0) {
          dispatch({ type: 'SET_LABOURS', payload: firebaseLabours });
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    },
    clearAllData: async () => {
      await deleteAllLaboursFromFirebase();
      dispatch({ type: 'RESET_STATE' });
    },
  };

  return (
    <LabourContext.Provider value={value}>{children}</LabourContext.Provider>
  );
};

export const useLabour = () => {
  const context = React.useContext(LabourContext);
  if (!context) {
    throw new Error('useLabour must be used within LabourProvider');
  }
  return context;
};
