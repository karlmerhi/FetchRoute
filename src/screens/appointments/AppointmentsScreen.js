import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import appointmentModel from '../../../firebase/models/appointmentModel';

const AppointmentsScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [currentUser]);

  const loadAppointments = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const fetchedAppointments = await appointmentModel.getAppointments(currentUser.uid);
      
      // Sort appointments by date (upcoming first)
      const sortedAppointments = fetchedAppointments.sort((a, b) => a.date - b.date);
      
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const handleAddAppointment = () => {
    // Navigate to add appointment screen - to be implemented
    navigation.navigate('AddAppointment');
  };

  const handleAppointmentPress = (appointment) => {
    // Navigate to appointment details screen - to be implemented
    navigation.navigate('AppointmentDetails', { appointmentId: appointment.id });
  };

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (date) => {
    const options = { hour: 'numeric', minute: '2-digit' };
    return date.toLocaleTimeString(undefined, options);
  };

  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => handleAppointmentPress(item)}
    >
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        <Text style={styles.timeText}>{formatTime(item.date)}</Text>
      </View>
      <View style={styles.appointmentInfo}>
        <Text style={styles.serviceType}>{item.serviceType}</Text>
        <Text style={styles.petInfo} numberOfLines={1}>
          {/* In a real app, we would fetch and display the pet and client names */}
          Pet ID: {item.petId?.substring(0, 8)}...
        </Text>
      </View>
      <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'scheduled':
        return styles.scheduledStatus;
      case 'completed':
        return styles.completedStatus;
      case 'cancelled':
        return styles.cancelledStatus;
      default:
        return styles.scheduledStatus;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAppointment}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No appointments scheduled</Text>
          <Text style={styles.emptySubText}>
            Schedule your first appointment by pressing the + button
          </Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#1e88e5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateContainer: {
    marginRight: 12,
    width: 70,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  petInfo: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  scheduledStatus: {
    backgroundColor: '#e3f2fd',
  },
  completedStatus: {
    backgroundColor: '#e8f5e9',
  },
  cancelledStatus: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default AppointmentsScreen;
