import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

// Storage key
const FLASHCARDS_STORAGE_KEY = '@KanjiFinder:flashcards';

// Initialize storage
const initDatabase = async () => {
  try {
    // Check if flashcards key exists
    const existingFlashcards = await AsyncStorage.getItem(FLASHCARDS_STORAGE_KEY);
    
    // If no flashcards exist yet, initialize with empty array
    if (!existingFlashcards) {
      await AsyncStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify([]));
    }
    
    console.log('AsyncStorage initialized successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error initializing AsyncStorage:', error);
    return Promise.reject(error);
  }
};

// Save a flashcard to local storage
const saveFlashcard = async (flashcard) => {
  try {
    // Get existing flashcards
    const flashcardsJson = await AsyncStorage.getItem(FLASHCARDS_STORAGE_KEY);
    const flashcards = flashcardsJson ? JSON.parse(flashcardsJson) : [];
    
    // Generate ID and timestamp if not provided
    const id = flashcard.id || uuid.v4();
    const createdAt = flashcard.createdAt || new Date().toISOString();
    
    // Create new flashcard with ID and timestamp
    const newFlashcard = {
      ...flashcard,
      id,
      createdAt,
      syncStatus: flashcard.syncStatus || 'local'
    };
    
    // If flashcard with same ID exists, update it, otherwise add new
    const existingIndex = flashcards.findIndex(card => card.id === id);
    
    if (existingIndex !== -1) {
      flashcards[existingIndex] = newFlashcard;
    } else {
      flashcards.unshift(newFlashcard); // Add to beginning of array
    }
    
    // Save updated flashcards
    await AsyncStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(flashcards));
    console.log('Flashcard saved to AsyncStorage');
    
    return newFlashcard;
  } catch (error) {
    console.error('Error saving flashcard to AsyncStorage:', error);
    throw error;
  }
};

// Get all flashcards
const getFlashcards = async () => {
  try {
    // Get flashcards from AsyncStorage
    const flashcardsJson = await AsyncStorage.getItem(FLASHCARDS_STORAGE_KEY);
    
    // Parse JSON and return, or return empty array if no data
    const flashcards = flashcardsJson ? JSON.parse(flashcardsJson) : [];
    
    // Sort by creation date (newest first)
    return flashcards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting flashcards from AsyncStorage:', error);
    throw error;
  }
};

// Get flashcards by JLPT level
const getFlashcardsByJlpt = async (level) => {
  try {
    const allFlashcards = await getFlashcards();
    return allFlashcards.filter(card => card.jlpt === level);
  } catch (error) {
    console.error('Error fetching flashcards by JLPT:', error);
    throw error;
  }
};

// Get flashcards by tag
const getFlashcardsByTag = async (tag) => {
  try {
    const allFlashcards = await getFlashcards();
    return allFlashcards.filter(card => 
      card.tags && Array.isArray(card.tags) && card.tags.includes(tag)
    );
  } catch (error) {
    console.error('Error fetching flashcards by tag:', error);
    throw error;
  }
};

// Get flashcard by ID
const getFlashcardById = async (id) => {
  try {
    const allFlashcards = await getFlashcards();
    return allFlashcards.find(card => card.id === id) || null;
  } catch (error) {
    console.error('Error fetching flashcard by ID:', error);
    throw error;
  }
};

// Delete flashcard
const deleteFlashcard = async (id) => {
  try {
    // Get current flashcards
    const flashcardsJson = await AsyncStorage.getItem(FLASHCARDS_STORAGE_KEY);
    const flashcards = flashcardsJson ? JSON.parse(flashcardsJson) : [];
    
    // Find flashcard index
    const index = flashcards.findIndex(card => card.id === id);
    
    // If flashcard not found, return false
    if (index === -1) {
      return false;
    }
    
    // Remove the flashcard
    flashcards.splice(index, 1);
    
    // Save updated flashcards
    await AsyncStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(flashcards));
    console.log('Flashcard deleted from AsyncStorage');
    
    return true;
  } catch (error) {
    console.error('Error deleting flashcard from AsyncStorage:', error);
    throw error;
  }
};

// Get flashcards that need syncing
const getUnsyncedFlashcards = async () => {
  try {
    const allFlashcards = await getFlashcards();
    return allFlashcards.filter(card => card.syncStatus === 'local');
  } catch (error) {
    console.error('Error getting unsynced flashcards:', error);
    throw error;
  }
};

// Mark flashcards as synced
const markFlashcardsAsSynced = async (ids) => {
  try {
    // Get current flashcards
    const flashcardsJson = await AsyncStorage.getItem(FLASHCARDS_STORAGE_KEY);
    const flashcards = flashcardsJson ? JSON.parse(flashcardsJson) : [];
    
    // Count how many flashcards were updated
    let updatedCount = 0;
    
    // Update sync status for each ID
    const updatedFlashcards = flashcards.map(card => {
      if (ids.includes(card.id)) {
        updatedCount++;
        return { ...card, syncStatus: 'synced' };
      }
      return card;
    });
    
    // Save updated flashcards
    await AsyncStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedFlashcards));
    console.log(`${updatedCount} flashcards marked as synced`);
    
    return updatedCount;
  } catch (error) {
    console.error('Error marking flashcards as synced:', error);
    throw error;
  }
};

export {
  initDatabase,
  saveFlashcard,
  getFlashcards,
  getFlashcardsByJlpt,
  getFlashcardsByTag,
  getFlashcardById,
  deleteFlashcard,
  getUnsyncedFlashcards,
  markFlashcardsAsSynced
};
