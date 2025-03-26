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
import petModel from '../../../firebase/models/petModel';

const PetsScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPets();
  }, [currentUser]);

  const loadPets = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const fetchedPets = await petModel.getAllPets(currentUser.uid);
      setPets(fetchedPets);
    } catch (error) {
      console.error('Error loading pets:', error);
      Alert.alert('Error', 'Failed to load pets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPets();
  };

  const handleAddPet = () => {
    // Navigate to add pet screen - to be implemented
    navigation.navigate('AddPet');
  };

  const handlePetPress = (pet) => {
    // Navigate to pet details screen - to be implemented
    navigation.navigate('PetDetails', { petId: pet.id });
  };

  const renderPetItem = ({ item }) => (
    <TouchableOpacity
      style={styles.petItem}
      onPress={() => handlePetPress(item)}
    >
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petDetails}>
          {item.type} • {item.breed || 'Unknown breed'} • {item.size}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Pets</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pets yet</Text>
          <Text style={styles.emptySubText}>
            Add your first pet by pressing the + button
          </Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          renderItem={renderPetItem}
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
  petItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  petDetails: {
    fontSize: 14,
    color: '#666',
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

export default PetsScreen;
