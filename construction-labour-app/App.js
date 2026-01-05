import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';

import { LabourProvider } from './src/context/LabourContext';
import { colors } from './src/constants/colors';

// Simple icon components as placeholders
const Home = ({ size, color }) => <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }} />;
const Users = ({ size, color }) => <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />;
const BarChart3 = ({ size, color }) => <View style={{ width: size, height: size, backgroundColor: color }} />;

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import LabourListScreen from './src/screens/LabourListScreen';
import AddLabourScreen from './src/screens/AddLabourScreen';
import LabourDetailScreen from './src/screens/LabourDetailScreen';
import AttendanceCalendarScreen from './src/screens/AttendanceCalendarScreen';
import WeeklyReportScreen from './src/screens/WeeklyReportScreen';

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

// Reports Stack
const ReportsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="WeeklyReportTab" component={WeeklyReportScreen} />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const RootTabs = () => (
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
    <Tab.Screen
      name="ReportsTab"
      component={ReportsStack}
      options={{
        tabBarLabel: 'Reports',
        tabBarIcon: ({ color, size }) => (
          <BarChart3 size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main App Component
const App = () => {
  return (
    <LabourProvider>
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </LabourProvider>
  );
};

export default App;
