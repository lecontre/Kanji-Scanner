import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Alert,
  SafeAreaView
} from 'react-native';
import { Icon, Button, ButtonGroup } from '@rneui/themed';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SIZES, SPACING, COMMON_STYLES, RADIUS } from '../../utils/theme';
import FlashcardItem from '../../components/FlashcardItem';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getFlashcardsByJlpt, getFlashcardsByTag } from '../../database/db';
import { syncFlashcards } from '../../services/api';

const FlashcardListScreen = ({ route, navigation }) => {
  const { filter } = route.params || { type: 'all' };
  const { flashcards, isLoading, refreshFlashcards, networkStatus, removeFlashcard } = useApp();
  
  const [filteredCards, setFilteredCards] = useState([]);
  const [isFiltering, setIsFiltering] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [title, setTitle] = useState('All Flashcards');
  
  // Set screen title based on filter
  useEffect(() => {
    if (filter) {
      if (filter.type === 'jlpt') {
        setTitle(`JLPT ${filter.level} Flashcards`);
      } else if (filter.type === 'tag') {
        setTitle(`${filter.tag} Flashcards`);
      } else {
        setTitle('All Flashcards');
      }
    }
  }, [filter]);
  
  // Filter flashcards based on route params
  useEffect(() => {
    const applyFilter = async () => {
      setIsFiltering(true);
      
      try {
        if (!filter || filter.type === 'all') {
          setFilteredCards(flashcards);
        } else if (filter.type === 'jlpt' && filter.level) {
          const jlptCards = await getFlashcardsByJlpt(filter.level);
          setFilteredCards(jlptCards);
        } else if (filter.type === 'tag' && filter.tag) {
          const tagCards = await getFlashcardsByTag(filter.tag);
          setFilteredCards(tagCards);
        }
      } catch (error) {
        console.error('Error filtering flashcards:', error);
        Alert.alert('Error', 'Failed to filter flashcards.');
      } finally {
        setIsFiltering(false);
      }
    };
    
    applyFilter();
  }, [filter, flashcards]);
  
  // Handle tab change for JLPT levels
  useEffect(() => {
    const fetchCardsByJlpt = async () => {
      setIsFiltering(true);
      
      try {
        const level = ['N5', 'N4', 'N3', 'N2', 'N1'][currentTab];
        if (level) {
          const jlptCards = await getFlashcardsByJlpt(level);
          setFilteredCards(jlptCards);
          setTitle(`JLPT ${level} Flashcards`);
        }
      } catch (error) {
        console.error('Error fetching by JLPT:', error);
      } finally {
        setIsFiltering(false);
      }
    };
    
    // Only apply tab filtering if we're looking at all cards
    if (!filter || filter.type === 'all') {
      if (currentTab === 0) {
        setFilteredCards(flashcards);
        setTitle('All Flashcards');
      } else {
        fetchCardsByJlpt();
      }
    }
  }, [currentTab, flashcards]);
  
  // Handle card deletion
  const handleDeleteFlashcard = async (id) => {
    Alert.alert(
      'Delete Flashcard',
      'Are you sure you want to delete this flashcard?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFlashcard(id);
              // Refresh the filtered list
              if (filter && filter.type === 'jlpt') {
                const jlptCards = await getFlashcardsByJlpt(filter.level);
                setFilteredCards(jlptCards);
              } else if (filter && filter.type === 'tag') {
                const tagCards = await getFlashcardsByTag(filter.tag);
                setFilteredCards(tagCards);
              } else {
                // Either we're looking at all cards or filtering by tabs
                if (currentTab === 0) {
                  await refreshFlashcards();
                } else {
                  const level = ['N5', 'N4', 'N3', 'N2', 'N1'][currentTab];
                  const jlptCards = await getFlashcardsByJlpt(level);
                  setFilteredCards(jlptCards);
                }
              }
            } catch (error) {
              console.error('Error deleting flashcard:', error);
              Alert.alert('Error', 'Failed to delete flashcard.');
            }
          }
        }
      ]
    );
  };
  
  // Navigate to flashcard detail
  const navigateToDetail = (id) => {
    navigation.navigate('FlashcardDetail', { id });
  };
  
  // Handle sync with backend
  const handleSync = async () => {
    if (networkStatus === 'offline') {
      Alert.alert('Offline', 'You are currently offline. Sync will be done automatically when you are back online.');
      return;
    }
    
    setIsSyncing(true);
    try {
      const result = await syncFlashcards();
      Alert.alert('Sync Complete', result.message);
      await refreshFlashcards();
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Failed', error.message || 'Failed to sync flashcards.');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <EmptyState 
      title="No Flashcards Found" 
      message={
        filter && filter.type === 'jlpt'
          ? `You don't have any JLPT ${filter.level} flashcards yet.`
          : filter && filter.type === 'tag'
          ? `You don't have any flashcards tagged with "${filter.tag}" yet.`
          : "You haven't created any flashcards yet."
      }
      icon="collections-bookmark"
      action={() => navigation.navigate('Camera')}
      actionText="Identify Kanji"
    />
  );
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={isSyncing}
          >
            <Icon 
              name={isSyncing ? "sync" : "sync"}
              size={24} 
              color={COLORS.primary}
              style={isSyncing ? styles.spinningIcon : null} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {!filter || filter.type === 'all' ? (
        <ButtonGroup
          buttons={['All', 'N5', 'N4', 'N3', 'N2', 'N1']}
          selectedIndex={currentTab}
          onPress={setCurrentTab}
          containerStyle={styles.buttonGroupContainer}
          selectedButtonStyle={{ backgroundColor: COLORS.primary }}
          textStyle={{ ...FONTS.medium }}
        />
      ) : null}
      
      {isFiltering ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filteredCards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FlashcardItem
              flashcard={item}
              onPress={() => navigateToDetail(item.id)}
              onDelete={(id) => handleDeleteFlashcard(id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.s,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xlarge,
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButton: {
    padding: SPACING.xs,
  },
  spinningIcon: {
    transform: [{ rotate: '45deg' }]
  },
  buttonGroupContainer: {
    marginVertical: SPACING.m,
    marginHorizontal: SPACING.m,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: SPACING.l,
  },
});

export default FlashcardListScreen;
