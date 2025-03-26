import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// App Screens (will be implemented later)
import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import PetsScreen from '../screens/pets/PetsScreen';
import AppointmentsScreen from '../screens/appointments/AppointmentsScreen';
import RoutesScreen from '../screens/routes/RoutesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator for unauthenticated users
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator for authenticated users
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Clients') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Pets') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Routes') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e88e5',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Clients" component={ClientsScreen} />
      <Tab.Screen name="Pets" component={PetsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Routes" component={RoutesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root navigator to handle auth state
const Navigator = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {currentUser ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default Navigator;
