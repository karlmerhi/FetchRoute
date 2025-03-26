import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import Navigator from './src/navigation/Navigator';
import { LogBox } from 'react-native';

// Initialize Firebase (imported via the imported files)
import './firebase/config';

// Ignore specific warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core', // Common AsyncStorage warning
  'Setting a timer', // Firebase timer warning that can be safely ignored
  'Possible Unhandled Promise Rejection', // Common during development
]);

export default function App() {
  // The app entry point wraps all components with necessary providers
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <Navigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
