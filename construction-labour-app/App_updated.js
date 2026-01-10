import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text, StatusBar } from 'react-native';

import { LabourProvider } from './src/context/LabourContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/constants/colors';
import { Toast } from './src/components/Toast';
import { Home, Users } from './src/components/Icons';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Screens
import LoginScreen from './src/screens/LoginScreen';
import WorkerDashboardScreen from './src/screens/WorkerDashboardScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LabourListScreen from './src/screens/LabourListScreen';
import AddLabourScreen from './src/screens/AddLabourScreen';
import LabourDetailScreen from './src/screens/LabourDetailScreen';
import AttendanceCalendarScreen from './src/screens/AttendanceCalendarScreen';
import WeeklyReportScreen from './src/screens/WeeklyReportScreen';
import QuickAttendanceScreen from './src/screens/QuickAttendanceScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Dashboard Stack
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen
      name="AddLabour"
      component={AddLabourScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <Stack.Screen
      name="LabourList"
      component={LabourListScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <Stack.Screen
      name="LabourDetail"
      component={LabourDetailScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <Stack.Screen
      name="AttendanceCalendar"
      component={AttendanceCalendarScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <Stack.Screen
      name="WeeklyReport"
      component={WeeklyReportScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <Stack.Screen
      name="QuickAttendance"
      component={QuickAttendanceScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <Stack.Screen
      name="TransactionHistory"
      component={TransactionHistoryScreen}
      options={{
        animationEnabled: true,
      }}
    />
  </Stack.Navigator>
);

// Labour Stack
const LabourStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="LabourListTab" component={LabourListScreen} />
    <Stack.Screen
      name="AddLabourTab"
      component={AddLabourScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <Stack.Screen
      name="LabourDetailTab"
      component={LabourDetailScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <Stack.Screen
      name="AttendanceCalendarTab"
      component={AttendanceCalendarScreen}
      options={{
        animationEnabled: true,
      }}
    />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const RootTabs = () => (
  <>
    <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary.mint,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopColor: colors.border,
          borderTopWidth: 1,
          backgroundColor: colors.card,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LabourTab"
        component={LabourStack}
        options={{
          tabBarLabel: 'Workers',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  </>
);

// Main App Component
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary.mint} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : user.role === 'worker' ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WorkerDashboard" component={WorkerDashboardScreen} />
        </Stack.Navigator>
      ) : (
        <RootTabs />
      )}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LabourProvider>
          <AppContent />
          <Toast />
        </LabourProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
