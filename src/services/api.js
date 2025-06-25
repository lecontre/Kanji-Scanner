import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUnsyncedFlashcards,
  markFlashcardsAsSynced
} from '../database/db';

// API URL - change this to your backend URL when deploying
const API_URL = 'http://localhost:5000/api';

// Get token from storage
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Set auth header
const authHeader = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
};

// Login user
const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Store the token
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email
      }));
      return data;
    } else {
      throw new Error(data.message || 'Authentication failed');
    }
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

// Register user
const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Store the token
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email
      }));
      return data;
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Register Error:', error);
    throw error;
  }
};

// Logout user
const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Logout Error:', error);
    throw error;
  }
};

// Check if user is logged in
const isLoggedIn = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Get current user data
const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};

// Sync flashcards with backend
const syncFlashcards = async () => {
  try {
    // Check if user is logged in
    const isAuth = await isLoggedIn();
    if (!isAuth) {
      throw new Error('User not authenticated');
    }
    
    // Get unsynced flashcards from local DB
    const unsyncedFlashcards = await getUnsyncedFlashcards();
    
    if (unsyncedFlashcards.length === 0) {
      return { synced: 0, message: 'No flashcards to sync' };
    }
    
    // Send to backend
    const response = await fetch(`${API_URL}/flashcards/bulk`, {
      method: 'POST',
      headers: await authHeader(),
      body: JSON.stringify(unsyncedFlashcards)
    });
    
    const data = await response.json();
    
    if (response.ok || response.status === 207) {
      // Mark successful flashcards as synced
      const syncedIds = data.flashcards.map(card => card.id);
      await markFlashcardsAsSynced(syncedIds);
      
      return {
        synced: syncedIds.length,
        total: unsyncedFlashcards.length,
        message: `Synced ${syncedIds.length} of ${unsyncedFlashcards.length} flashcards`
      };
    } else {
      throw new Error(data.message || 'Sync failed');
    }
  } catch (error) {
    console.error('Sync Error:', error);
    throw error;
  }
};

// Upload a flashcard and sync with backend
const uploadFlashcard = async (flashcard) => {
  try {
    // Check if user is logged in
    const isAuth = await isLoggedIn();
    if (!isAuth) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${API_URL}/flashcards`, {
      method: 'POST',
      headers: await authHeader(),
      body: JSON.stringify(flashcard)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

export {
  loginUser,
  registerUser,
  logoutUser,
  isLoggedIn,
  getCurrentUser,
  syncFlashcards,
  uploadFlashcard
};
