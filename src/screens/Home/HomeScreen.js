import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { IconButton, ActivityIndicator, Text } from 'react-native-paper';
import { COMMON_STYLES, COLORS, SPACING, FONTS, SIZES, RADIUS } from '../../utils/theme';
import {Icon} from '@rneui/themed';
import NetworkStatusBar from '../../components/NetworkStatusBar';
import FlashcardItem from '../../components/FlashcardItem';
import EmptyState from '../../components/EmptyState';
import PaperExample from '../../components/PaperExample';

const HomeScreen = ({ navigation }) => {
  const { flashcards, isLoading, networkStatus, refreshFlashcards } = useApp();
  
  // Get most recent 5 flashcards
  const recentFlashcards = flashcards.slice(0, 5);
  
  // Count flashcards by JLPT level
  const jlptCounts = flashcards.reduce((counts, card) => {
    counts[card.jlpt] = (counts[card.jlpt] || 0) + 1;
    return counts;
  }, {});
  
  const navigateToCamera = () => {
    navigation.navigate('Camera');
  };
  
  const navigateToFlashcards = (filter) => {
    navigation.navigate('FlashcardList', { filter });
  };
  
  const navigateToFlashcardDetail = (id) => {
    navigation.navigate('FlashcardDetail', { id });
  };
  
  if (isLoading) {
    return (
      <View style={COMMON_STYLES.centerContent}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <NetworkStatusBar 
        status={networkStatus} 
        onSync={() => console.log('Sync requested')} 
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kanji Finder</Text>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => console.log('Sync flashcards')}
        >
          <Icon name="sync" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container}>
        {/* Camera Action */}
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={navigateToCamera}
        >
          <View style={styles.cameraContent}>
            <Icon name="camera-alt" size={32} color={COLORS.white} />
            <Text style={styles.cameraText}>Identify Kanji</Text>
          </View>
          <Icon name="arrow-forward" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        {/* Flashcard Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statCard} 
              onPress={() => navigateToFlashcards({ type: 'all' })}
            >
              <Text style={styles.statNumber}>{flashcards.length}</Text>
              <Text style={styles.statLabel}>Total Flashcards</Text>
            </TouchableOpacity>
            
            {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
              <TouchableOpacity 
                key={level}
                style={[
                  styles.statCard, 
                  { backgroundColor: level === 'N5' ? COLORS.n5Color : 
                    level === 'N4' ? COLORS.n4Color :
                    level === 'N3' ? COLORS.n3Color :
                    level === 'N2' ? COLORS.n2Color :
                    COLORS.n1Color }
                ]}
                onPress={() => navigateToFlashcards({ type: 'jlpt', level })}
              >
                <Text style={[styles.statNumber, styles.statNumberLight]}>{jlptCounts[level] || 0}</Text>
                <Text style={[styles.statLabel, styles.statLabelLight]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Recent Flashcards */}
        <View style={styles.recentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Flashcards</Text>
            <TouchableOpacity onPress={() => navigateToFlashcards({ type: 'all' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentFlashcards.length > 0 ? (
            recentFlashcards.map(flashcard => (
              <FlashcardItem 
                key={flashcard.id}
                flashcard={flashcard}
                onPress={() => navigateToFlashcardDetail(flashcard.id)}
              />
            ))
          ) : (
            <EmptyState 
              title="No Flashcards Yet"
              message="Capture an image to identify Kanji and create your first flashcard."
              icon="collections-bookmark"
              action={navigateToCamera}
              actionText="Identify Kanji"
            />
          )}
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={navigateToCamera}
      >
        <Icon name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxlarge,
    color: COLORS.primary,
  },
  syncButton: {
    padding: SPACING.s,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.m,
    margin: SPACING.m,
    padding: SPACING.m,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cameraContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.white,
    marginLeft: SPACING.m,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xlarge,
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  statsContainer: {
    margin: SPACING.m,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    width: '48%',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    ...FONTS.extraBold,
    fontSize: SIZES.xxxlarge,
    color: COLORS.text,
  },
  statNumberLight: {
    color: COLORS.white,
  },
  statLabel: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabelLight: {
    color: COLORS.white,
  },
  recentContainer: {
    margin: SPACING.m,
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  seeAllText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.l,
    bottom: SPACING.l,
    backgroundColor: COLORS.secondary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
});

export default HomeScreen;
