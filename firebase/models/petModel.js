import { firestore } from '../config';
import { Alert } from 'react-native';

const petsCollection = firestore().collection('pets');

class PetModel {
  // Create a new pet
  async addPet(petData) {
    try {
      // Validate required fields
      if (!petData.name) {
        throw new Error('Pet name is required');
      }
      
      if (!petData.clientId) {
        throw new Error('Client association is required');
      }

      // Create pet document
      const petRef = await petsCollection.add({
        name: petData.name,
        type: petData.type || 'Dog', // Default type
        breed: petData.breed || '',
        size: petData.size || 'Medium',
        specialNeeds: petData.specialNeeds || [],
        clientId: petData.clientId,
        notes: petData.notes || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return { id: petRef.id, ...petData };
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }

  // Get all pets for a specific client
  async getPetsByClient(clientId) {
    try {
      const snapshot = await petsCollection
        .where('clientId', '==', clientId)
        .orderBy('name')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
    } catch (error) {
      console.error('Error getting pets:', error);
      Alert.alert('Error', 'Failed to load pets');
      throw error;
    }
  }

  // Get all pets for a user (via clients)
  async getAllPets(userId) {
    try {
      // First get all clients for the user
      const clientsSnapshot = await firestore()
        .collection('clients')
        .where('userId', '==', userId)
        .get();
      
      const clientIds = clientsSnapshot.docs.map(doc => doc.id);
      
      if (clientIds.length === 0) {
        return [];
      }
      
      // Then get all pets for those clients
      // Note: Firestore "in" query is limited to 10 items, so for larger sets would need batching
      const snapshot = await petsCollection
        .where('clientId', 'in', clientIds)
        .orderBy('name')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
    } catch (error) {
      console.error('Error getting all pets:', error);
      Alert.alert('Error', 'Failed to load pets');
      throw error;
    }
  }

  // Get a specific pet by ID
  async getPet(petId) {
    try {
      const doc = await petsCollection.doc(petId).get();
      
      if (!doc.exists) {
        throw new Error('Pet not found');
      }
      
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      };
    } catch (error) {
      console.error('Error getting pet:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }

  // Update an existing pet
  async updatePet(petId, petData) {
    try {
      await petsCollection.doc(petId).update({
        ...petData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return { id: petId, ...petData };
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert('Error', 'Failed to update pet');
      throw error;
    }
  }

  // Delete a pet
  async deletePet(petId) {
    try {
      // Check if the pet has any appointments
      const appointmentsSnapshot = await firestore()
        .collection('appointments')
        .where('petId', '==', petId)
        .get();

      // If the pet has appointments, delete or update them first
      const deletePromises = appointmentsSnapshot.docs.map(doc => 
        firestore().collection('appointments').doc(doc.id).delete()
      );
      
      await Promise.all(deletePromises);
      
      // Now delete the pet
      await petsCollection.doc(petId).delete();
      
      return petId;
    } catch (error) {
      console.error('Error deleting pet:', error);
      Alert.alert('Error', 'Failed to delete pet');
      throw error;
    }
  }
}

export default new PetModel();
