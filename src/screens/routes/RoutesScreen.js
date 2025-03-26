import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import routeModel from '../../../firebase/models/routeModel';
import appointmentModel from '../../../firebase/models/appointmentModel';
import routeOptimization from '../../../utils/routeOptimization';

const RoutesScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [route, setRoute] = useState(null);
  const [todayDate, setTodayDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    loadTodayRoute();
  }, [currentUser]);

  const loadTodayRoute = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Check if we already have a route for today
      const existingRoute = await routeModel.getRouteByDate(currentUser.uid, todayDate);
      
      if (existingRoute) {
        // Get the complete route with all details
        const completeRoute = await routeModel.getCompleteRoute(existingRoute.id);
        setRoute(completeRoute);
      } else {
        setRoute(null);
      }
    } catch (error) {
      console.error('Error loading route:', error);
      Alert.alert('Error', 'Failed to load today\'s route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async () => {
    try {
      setOptimizing(true);
      
      // Get today's appointments
      const appointments = await appointmentModel.getAppointmentsForRouting(currentUser.uid, todayDate);
      
      if (appointments.length === 0) {
        Alert.alert('No Appointments', 'There are no appointments scheduled for today to create a route.');
        setOptimizing(false);
        return;
      }
      
      // Default starting point (this would be user's home/office location)
      // In a real app, this would be retrieved from user settings
      const startingPoint = {
        name: 'Home/Office',
        address: 'Default Location',
        coordinates: {
          latitude: 37.7749, // Example: San Francisco
          longitude: -122.4194,
        },
        type: 'start',
      };
      
      // Run optimization algorithm
      const optimizedRoute = routeOptimization.optimizeRoute(appointments, startingPoint);
      
      // Save the route to Firestore
      const newRoute = await routeModel.createRoute({
        routeDate: todayDate,
        userId: currentUser.uid,
        appointmentIds: optimizedRoute.appointmentIds,
        waypoints: optimizedRoute.waypoints,
        optimizedPath: optimizedRoute.optimizedRoute,
        startPoint: optimizedRoute.startPoint,
        endPoint: optimizedRoute.endPoint,
        totalDistance: optimizedRoute.totalDistance,
        totalDuration: optimizedRoute.estimatedTravelTime,
      });
      
      // Reload the route with full details
      const completeRoute = await routeModel.getCompleteRoute(newRoute.id);
      setRoute(completeRoute);
      
      Alert.alert('Success', 'Route created successfully!');
    } catch (error) {
      console.error('Error creating route:', error);
      Alert.alert('Error', 'Failed to create route. Please try again.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleViewOnMap = () => {
    // Navigate to route map screen - to be implemented
    navigation.navigate('RouteMap', { routeId: route.id });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const options = { hour: 'numeric', minute: '2-digit' };
    return date.toLocaleTimeString(undefined, options);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Route</Text>
        <Text style={styles.date}>
          {todayDate.toDateString()}
        </Text>
      </View>

      {!route ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No route planned for today</Text>
          <Text style={styles.emptySubText}>
            Create an optimized route for your appointments
          </Text>
          <TouchableOpacity
            style={[styles.createButton, optimizing && styles.buttonDisabled]}
            onPress={handleCreateRoute}
            disabled={optimizing}
          >
            {optimizing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="navigate" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.createButtonText}>Create Route</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {route.appointments?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Stops</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.round(route.totalDistance || 0)} km
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.round(route.totalDuration || 0)} min
              </Text>
              <Text style={styles.statLabel}>Travel Time</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleViewOnMap}
          >
            <Ionicons name="map" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Route Details</Text>

          <View style={styles.timelineContainer}>
            {route.waypoints?.map((waypoint, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {waypoint.type === 'start' ? 'Start' : 
                     waypoint.type === 'end' ? 'Return' : 
                     formatTime(waypoint.arrivalTime)}
                  </Text>
                </View>
                <View style={styles.timelineLine}>
                  <View
                    style={[
                      styles.timelineCircle,
                      waypoint.type === 'start'
                        ? styles.startCircle
                        : waypoint.type === 'end'
                        ? styles.endCircle
                        : styles.appointmentCircle,
                    ]}
                  />
                  {index < route.waypoints.length - 1 && (
                    <View style={styles.timelineVerticalLine} />
                  )}
                </View>
                <View style={styles.waypointContainer}>
                  <Text style={styles.waypointTitle}>
                    {waypoint.type === 'start'
                      ? 'Start from Home/Office'
                      : waypoint.type === 'end'
                      ? 'Return to Home/Office'
                      : waypoint.serviceType}
                  </Text>
                  <Text style={styles.waypointSubtitle}>
                    {waypoint.type === 'appointment'
                      ? waypoint.clientName || 'Client'
                      : waypoint.address}
                  </Text>
                  <Text style={styles.waypointAddress} numberOfLines={1}>
                    {waypoint.address}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#1e88e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a7c9e8',
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollView: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  mapButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  timelineContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timeContainer: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timelineLine: {
    alignItems: 'center',
    width: 30,
  },
  timelineCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 7,
  },
  startCircle: {
    backgroundColor: '#4caf50',
  },
  appointmentCircle: {
    backgroundColor: '#1e88e5',
  },
  endCircle: {
    backgroundColor: '#f44336',
  },
  timelineVerticalLine: {
    width: 2,
    height: 60,
    backgroundColor: '#e0e0e0',
  },
  waypointContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  waypointTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  waypointSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  waypointAddress: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default RoutesScreen;
