import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import authService from '../../firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and provides auth context
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Function to handle user login
  const login = async (email, password) => {
    try {
      const user = await authService.login(email, password);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Function to handle user registration
  const register = async (email, password, displayName) => {
    try {
      const user = await authService.register(email, password, displayName);
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      await authService.logout();
      // Clear any persisted app state
      await AsyncStorage.multiRemove([
        'userLocation',
        'lastRoute',
        'appSettings'
      ]);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Function to handle password reset
  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Function to update user profile
  const updateProfile = async (userData) => {
    try {
      await authService.updateProfile(userData);
      // Update the current user state
      setCurrentUser(authService.getCurrentUser());
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Set up auth state change listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
      setInitialized(true);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Value to be provided by context
  const value = {
    currentUser,
    loading,
    initialized,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
