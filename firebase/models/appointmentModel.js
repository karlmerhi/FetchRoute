import { firestore } from '../config';
import { Alert } from 'react-native';

const appointmentsCollection = firestore().collection('appointments');

class AppointmentModel {
  // Create a new appointment
  async addAppointment(appointmentData) {
    try {
      // Validate required fields
      if (!appointmentData.date) {
        throw new Error('Appointment date is required');
      }
      
      if (!appointmentData.petId) {
        throw new Error('Pet selection is required');
      }
      
      if (!appointmentData.clientId) {
        throw new Error('Client association is required');
      }
      
      if (!appointmentData.serviceType) {
        throw new Error('Service type is required');
      }
      
      // Create appointment document
      const appointmentRef = await appointmentsCollection.add({
        date: appointmentData.date,
        duration: appointmentData.duration || 60, // Default 60 minutes
        status: appointmentData.status || 'scheduled',
        petId: appointmentData.petId,
        clientId: appointmentData.clientId,
        serviceType: appointmentData.serviceType,
        notes: appointmentData.notes || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
        userId: appointmentData.userId, // The service provider
      });

      return { id: appointmentRef.id, ...appointmentData };
    } catch (error) {
      console.error('Error adding appointment:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }

  // Get all appointments for a specific user
  async getAppointments(userId) {
    try {
      const snapshot = await appointmentsCollection
        .where('userId', '==', userId)
        .orderBy('date', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
    } catch (error) {
      console.error('Error getting appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
      throw error;
    }
  }

  // Get appointments for a specific date
  async getAppointmentsByDate(userId, date) {
    try {
      // Create date range for the selected day (start of day to end of day)
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const snapshot = await appointmentsCollection
        .where('userId', '==', userId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
    } catch (error) {
      console.error('Error getting appointments by date:', error);
      Alert.alert('Error', 'Failed to load appointments for this date');
      throw error;
    }
  }

  // Get a specific appointment by ID
  async getAppointment(appointmentId) {
    try {
      const doc = await appointmentsCollection.doc(appointmentId).get();
      
      if (!doc.exists) {
        throw new Error('Appointment not found');
      }
      
      return {
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      };
    } catch (error) {
      console.error('Error getting appointment:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }

  // Update an existing appointment
  async updateAppointment(appointmentId, appointmentData) {
    try {
      // Format date as timestamp if it's a Date object
      const dataToUpdate = { ...appointmentData };
      
      if (dataToUpdate.date && dataToUpdate.date instanceof Date) {
        dataToUpdate.date = firestore.Timestamp.fromDate(dataToUpdate.date);
      }
      
      await appointmentsCollection.doc(appointmentId).update({
        ...dataToUpdate,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return { id: appointmentId, ...appointmentData };
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert('Error', 'Failed to update appointment');
      throw error;
    }
  }

  // Delete an appointment
  async deleteAppointment(appointmentId) {
    try {
      await appointmentsCollection.doc(appointmentId).delete();
      
      // Also remove this appointment from any routes it might be part of
      const routesSnapshot = await firestore()
        .collection('routes')
        .where('appointmentIds', 'array-contains', appointmentId)
        .get();
      
      const updatePromises = routesSnapshot.docs.map(doc => {
        const route = doc.data();
        const appointmentIds = route.appointmentIds.filter(id => id !== appointmentId);
        
        return firestore().collection('routes').doc(doc.id).update({
          appointmentIds,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      });
      
      await Promise.all(updatePromises);
      
      return appointmentId;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      Alert.alert('Error', 'Failed to delete appointment');
      throw error;
    }
  }

  // Get appointments for route planning
  async getAppointmentsForRouting(userId, date) {
    try {
      // Create date range for the selected day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const appointmentsSnapshot = await appointmentsCollection
        .where('userId', '==', userId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .where('status', '==', 'scheduled')
        .get();
      
      // Get client details for each appointment
      const appointmentsWithDetails = [];
      
      for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointment = {
          id: appointmentDoc.id,
          ...appointmentDoc.data(),
          date: appointmentDoc.data().date.toDate()
        };
        
        // Get client details including address
        const clientDoc = await firestore()
          .collection('clients')
          .doc(appointment.clientId)
          .get();
        
        if (clientDoc.exists) {
          appointment.client = {
            id: clientDoc.id,
            ...clientDoc.data()
          };
          
          appointmentsWithDetails.push(appointment);
        }
      }
      
      return appointmentsWithDetails;
    } catch (error) {
      console.error('Error getting appointments for routing:', error);
      Alert.alert('Error', 'Failed to load appointments for route planning');
      throw error;
    }
  }
}

export default new AppointmentModel();
