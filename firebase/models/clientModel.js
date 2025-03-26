import { firestore } from '../config';
import { Alert } from 'react-native';

const clientsCollection = firestore().collection('clients');

class ClientModel {
  // Create a new client
  async addClient(userId, clientData) {
    try {
      // Validate required fields
      if (!clientData.name) {
        throw new Error('Client name is required');
      }

      if (!clientData.address) {
        throw new Error('Client address is required');
      }

      // Create client document
      const clientRef = await clientsCollection.add({
        name: clientData.name,
        phone: clientData.phone || '',
        email: clientData.email || '',
        address: clientData.address,
        notes: clientData.notes || '',
        userId: userId, // Associate with the service provider
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return { id: clientRef.id, ...clientData };
    } catch (error) {
      console.error('Error adding client:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }

  // Get all clients for a specific user
  async getClients(userId) {
    try {
      const snapshot = await clientsCollection
        .where('userId', '==', userId)
        .orderBy('name')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
    } catch (error) {
      console.error('Error getting clients:', error);
      Alert.alert('Error', 'Failed to load clients');
      throw error;
    }
  }

  // Get a specific client by ID
  async getClient(clientId) {
    try {
      const doc = await clientsCollection.doc(clientId).get();
      
      if (!doc.exists) {
        throw new Error('Client not found');
      }
      
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      };
    } catch (error) {
      console.error('Error getting client:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }

  // Update an existing client
  async updateClient(clientId, clientData) {
    try {
      await clientsCollection.doc(clientId).update({
        ...clientData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return { id: clientId, ...clientData };
    } catch (error) {
      console.error('Error updating client:', error);
      Alert.alert('Error', 'Failed to update client');
      throw error;
    }
  }

  // Delete a client
  async deleteClient(clientId) {
    try {
      // Check if client has any pets
      const petsSnapshot = await firestore()
        .collection('pets')
        .where('clientId', '==', clientId)
        .get();

      // If the client has pets, delete them first
      const deletePromises = petsSnapshot.docs.map(doc => 
        firestore().collection('pets').doc(doc.id).delete()
      );
      
      await Promise.all(deletePromises);

      // Now delete the client
      await clientsCollection.doc(clientId).delete();
      
      return clientId;
    } catch (error) {
      console.error('Error deleting client:', error);
      Alert.alert('Error', 'Failed to delete client');
      throw error;
    }
  }

  // Get clients with addresses for route optimization
  async getClientsWithAddresses(userId) {
    try {
      const snapshot = await clientsCollection
        .where('userId', '==', userId)
        .where('address', '!=', null)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting clients with addresses:', error);
      Alert.alert('Error', 'Failed to load client addresses');
      throw error;
    }
  }
}

export default new ClientModel();
