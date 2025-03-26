import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashboardScreen = ({ navigation }) => {
  const { currentUser } = useAuth();

  // Navigate to the appointments screen
  const goToAppointments = () => {
    navigation.navigate('Appointments');
  };

  // Navigate to the routes screen
  const goToRoutes = () => {
    navigation.navigate('Routes');
  };

  // Navigate to the clients screen
  const goToClients = () => {
    navigation.navigate('Clients');
  };

  // Navigate to the pets screen
  const goToPets = () => {
    navigation.navigate('Pets');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {currentUser?.displayName || 'Pet Pro'}!
          </Text>
          <Text style={styles.subheading}>Here's your pet service dashboard</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Today's Appointments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Pets</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={goToAppointments}>
            <Text style={styles.actionButtonText}>Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={goToRoutes}>
            <Text style={styles.actionButtonText}>Today's Route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={goToClients}>
            <Text style={styles.actionButtonText}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={goToPets}>
            <Text style={styles.actionButtonText}>Pets</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <View style={styles.appointmentsContainer}>
          <Text style={styles.emptyText}>No upcoming appointments</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  scrollView: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  appointmentsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 24,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
});

export default DashboardScreen;
