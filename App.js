import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme, Text, ActivityIndicator, Surface } from 'react-native-paper';
import { AppProvider } from './src/context/AppContext';
import { initDatabase } from './src/database/db';
import { paperTheme } from './src/utils/theme';

// Screen imports
import HomeScreen from './src/screens/Home/HomeScreen';
import CameraScreen from './src/screens/Camera/CameraScreen';
import KanjiDetailScreen from './src/screens/KanjiDetail/KanjiDetailScreen';
import FlashcardListScreen from './src/screens/FlashcardList/FlashcardListScreen';
import FlashcardDetailScreen from './src/screens/FlashcardDetail/FlashcardDetailScreen';
import LoadingSpinner from './src/components/LoadingSpinner';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database on app start
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initialize();
  }, []);

  // Show loading screen while database is initializing
  if (!isInitialized) {
    return (
      <PaperProvider theme={paperTheme}>
        <Surface style={styles.container}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </Surface>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="KanjiDetail" component={KanjiDetailScreen} />
            <Stack.Screen name="FlashcardList" component={FlashcardListScreen} />
            <Stack.Screen name="FlashcardDetail" component={FlashcardDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
