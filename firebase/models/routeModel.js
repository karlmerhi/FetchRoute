import { firestore } from '../config';
import { Alert } from 'react-native';

const routesCollection = firestore().collection('routes');

class RouteModel {
  // Create a new optimized route
  async createRoute(routeData) {
    try {
      // Validate required fields
      if (!routeData.routeDate) {
        throw new Error('Route date is required');
      }
      
      if (!routeData.userId) {
        throw new Error('User ID is required');
      }
      
      if (!routeData.appointmentIds || routeData.appointmentIds.length === 0) {
        throw new Error('At least one appointment is required for a route');
      }
      
      // Create route document
      const routeRef = await routesCollection.add({
        routeDate: routeData.routeDate,
        userId: routeData.userId,
        appointmentIds: routeData.appointmentIds,
        waypoints: routeData.waypoints || [],
        optimizedPath: routeData.optimizedPath || null,
        startPoint: routeData.startPoint || null,
        endPoint: routeData.endPoint || null,
        totalDistance: routeData.totalDistance || 0,
        totalDuration: routeData.totalDuration || 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return { id: routeRef.id, ...routeData };
    } catch (error) {
      console.error('Error creating route:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }

  // Get all routes for a specific user
  async getRoutes(userId) {
    try {
      const snapshot = await routesCollection
        .where('userId', '==', userId)
        .orderBy('routeDate', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        routeDate: doc.data().routeDate.toDate(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
    } catch (error) {
      console.error('Error getting routes:', error);
      Alert.alert('Error', 'Failed to load routes');
      throw error;
    }
  }

  // Get a route for a specific date
  async getRouteByDate(userId, date) {
    try {
      // Create date range for the selected day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const snapshot = await routesCollection
        .where('userId', '==', userId)
        .where('routeDate', '>=', startDate)
        .where('routeDate', '<=', endDate)
        .limit(1) // Only get one route per day
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      
      return {
        id: doc.id,
        ...doc.data(),
        routeDate: doc.data().routeDate.toDate(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      };
    } catch (error) {
      console.error('Error getting route by date:', error);
      Alert.alert('Error', 'Failed to load route for this date');
      throw error;
    }
  }

  // Get a specific route by ID
  async getRoute(routeId) {
    try {
      const doc = await routesCollection.doc(routeId).get();
      
      if (!doc.exists) {
        throw new Error('Route not found');
      }
      
      return {
        id: doc.id,
        ...doc.data(),
        routeDate: doc.data().routeDate.toDate(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      };
    } catch (error) {
      console.error('Error getting route:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }

  // Update an existing route
  async updateRoute(routeId, routeData) {
    try {
      // Format date as timestamp if it's a Date object
      const dataToUpdate = { ...routeData };
      
      if (dataToUpdate.routeDate && dataToUpdate.routeDate instanceof Date) {
        dataToUpdate.routeDate = firestore.Timestamp.fromDate(dataToUpdate.routeDate);
      }
      
      await routesCollection.doc(routeId).update({
        ...dataToUpdate,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return { id: routeId, ...routeData };
    } catch (error) {
      console.error('Error updating route:', error);
      Alert.alert('Error', 'Failed to update route');
      throw error;
    }
  }

  // Delete a route
  async deleteRoute(routeId) {
    try {
      await routesCollection.doc(routeId).delete();
      return routeId;
    } catch (error) {
      console.error('Error deleting route:', error);
      Alert.alert('Error', 'Failed to delete route');
      throw error;
    }
  }

  // Get a complete route with appointment details
  async getCompleteRoute(routeId) {
    try {
      const routeDoc = await routesCollection.doc(routeId).get();
      
      if (!routeDoc.exists) {
        throw new Error('Route not found');
      }
      
      const route = {
        id: routeDoc.id,
        ...routeDoc.data(),
        routeDate: routeDoc.data().routeDate.toDate(),
      };
      
      // Get appointment details
      const appointmentIds = route.appointmentIds || [];
      const appointments = [];
      
      for (const appointmentId of appointmentIds) {
        const appointmentDoc = await firestore()
          .collection('appointments')
          .doc(appointmentId)
          .get();
        
        if (appointmentDoc.exists) {
          const appointment = {
            id: appointmentDoc.id,
            ...appointmentDoc.data(),
            date: appointmentDoc.data().date.toDate(),
          };
          
          // Get client details
          const clientDoc = await firestore()
            .collection('clients')
            .doc(appointment.clientId)
            .get();
          
          if (clientDoc.exists) {
            appointment.client = {
              id: clientDoc.id,
              ...clientDoc.data(),
            };
            
            // Get pet details
            const petDoc = await firestore()
              .collection('pets')
              .doc(appointment.petId)
              .get();
            
            if (petDoc.exists) {
              appointment.pet = {
                id: petDoc.id,
                ...petDoc.data(),
              };
            }
            
            appointments.push(appointment);
          }
        }
      }
      
      route.appointments = appointments;
      
      return route;
    } catch (error) {
      console.error('Error getting complete route:', error);
      Alert.alert('Error', 'Failed to load route details');
      throw error;
    }
  }
}

export default new RouteModel();
