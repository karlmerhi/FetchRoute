import { auth, firestore } from './config';

// Authentication service for FetchRoute
class AuthService {
  // Register a new user
  async register(email, password, displayName) {
    try {
      // Create user in Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Update user profile
      await userCredential.user.updateProfile({
        displayName: displayName,
      });

      // Create user document in Firestore
      await firestore().collection('users').doc(userCredential.user.uid).set({
        email: email,
        displayName: displayName,
        createdAt: firestore.FieldValue.serverTimestamp(),
        role: 'service_provider', // Default role for MVP
      });

      return userCredential.user;
    } catch (error) {
      console.error('Error in register:', error);
      throw error;
    }
  }

  // Sign in existing user
  async login(email, password) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  // Sign out current user
  async logout() {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  }

  // Get current authenticated user
  getCurrentUser() {
    return auth().currentUser;
  }

  // Listen for auth state changes
  onAuthStateChanged(callback) {
    return auth().onAuthStateChanged(callback);
  }

  // Update user profile
  async updateProfile(data) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error("No user is currently logged in");

      // Update profile data in Auth
      if (data.displayName) {
        await user.updateProfile({
          displayName: data.displayName,
        });
      }

      // Update user document in Firestore
      await firestore().collection('users').doc(user.uid).update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return user;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }
}

export default new AuthService();
