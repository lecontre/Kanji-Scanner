import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  isLoggedIn, 
  getCurrentUser, 
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  logoutUser as apiLogoutUser
} from '../services/api';
import { initDatabase, getFlashcards, saveFlashcard, deleteFlashcard } from '../database/db';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // State variables
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('unknown');

  // Initialize app
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check login status
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
        
        // Initialize database
        await initDatabase();
        setIsDbInitialized(true);
        
        // Load flashcards
        const cards = await getFlashcards();
        setFlashcards(cards);
        
        // TODO: Add network status listener here
        setNetworkStatus('online'); // Mock status, replace with actual network detection
        
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const userData = await apiLoginUser(email, password);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register user
  const register = async (name, email, password) => {
    try {
      setIsLoading(true);
      const userData = await apiRegisterUser(name, email, password);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setIsLoading(true);
      await apiLogoutUser();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Add a flashcard
  const addFlashcard = async (flashcard) => {
    try {
      const savedCard = await saveFlashcard(flashcard);
      setFlashcards(prev => [savedCard, ...prev]);
      return { success: true, flashcard: savedCard };
    } catch (error) {
      console.error('Add flashcard error:', error);
      return { success: false, error: error.message };
    }
  };

  // Remove a flashcard
  const removeFlashcard = async (id) => {
    try {
      const deleted = await deleteFlashcard(id);
      if (deleted) {
        setFlashcards(prev => prev.filter(card => card.id !== id));
      }
      return { success: deleted };
    } catch (error) {
      console.error('Remove flashcard error:', error);
      return { success: false, error: error.message };
    }
  };

  // Refresh flashcards list
  const refreshFlashcards = async () => {
    try {
      const cards = await getFlashcards();
      setFlashcards(cards);
      return { success: true };
    } catch (error) {
      console.error('Refresh flashcards error:', error);
      return { success: false, error: error.message };
    }
  };

  // Context value
  const contextValue = {
    user,
    isLoading,
    flashcards,
    networkStatus,
    isDbInitialized,
    login,
    register,
    logout,
    addFlashcard,
    removeFlashcard,
    refreshFlashcards,
    setIsLoading
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
