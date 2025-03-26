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
import clientModel from '../../../firebase/models/clientModel';

const ClientsScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClients();
  }, [currentUser]);

  const loadClients = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const fetchedClients = await clientModel.getClients(currentUser.uid);
      setClients(fetchedClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadClients();
  };

  const handleAddClient = () => {
    // Navigate to add client screen - to be implemented
    navigation.navigate('AddClient');
  };

  const handleClientPress = (client) => {
    // Navigate to client details screen - to be implemented
    navigation.navigate('ClientDetails', { clientId: client.id });
  };

  const renderClientItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clientItem}
      onPress={() => handleClientPress(item)}
    >
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientAddress} numberOfLines={1}>
          {item.address?.formatted || 'No address provided'}
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
        <Text style={styles.title}>Clients</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {clients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No clients yet</Text>
          <Text style={styles.emptySubText}>
            Add your first client by pressing the + button
          </Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderClientItem}
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
  clientItem: {
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
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  clientAddress: {
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

export default ClientsScreen;
