import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView 
} from 'react-native';
import { Button, Icon, Divider, Input, Chip } from '@rneui/themed';
import { useApp } from '../../context/AppContext';
import { 
  COLORS, 
  FONTS, 
  SIZES,
  SPACING, 
  SPACING_M,
  RADIUS, 
  RADIUS_S,
  COMMON_STYLES,
  spacing,
  colors
} from '../../utils/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getFlashcardById, saveFlashcard } from '../../database/db';
import { generateMnemonic } from '../../services/aiService';

const FlashcardDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { isLoading: isAppLoading, refreshFlashcards } = useApp();
  
  const [flashcard, setFlashcard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);
  
  // Form state
  const [editedNotes, setEditedNotes] = useState('');
  const [editedMnemonic, setEditedMnemonic] = useState('');
  const [editedTags, setEditedTags] = useState('');
  
  // Load flashcard data
  useEffect(() => {
    const loadFlashcard = async () => {
      try {
        const card = await getFlashcardById(id);
        if (card) {
          setFlashcard(card);
          // Initialize form state
          setEditedNotes(card.notes || '');
          setEditedMnemonic(card.mnemonic || '');
          setEditedTags(card.tags ? card.tags.join(', ') : '');
        } else {
          Alert.alert('Error', 'Flashcard not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading flashcard:', error);
        Alert.alert('Error', 'Failed to load flashcard details');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcard();
  }, [id]);

  // Handle editing toggle
  const toggleEditing = () => {
    if (isEditing) {
      // Discard changes
      setEditedNotes(flashcard.notes || '');
      setEditedMnemonic(flashcard.mnemonic || '');
      setEditedTags(flashcard.tags ? flashcard.tags.join(', ') : '');
    }
    setIsEditing(!isEditing);
  };

  // Handle save changes
  const saveChanges = async () => {
    setIsSaving(true);
    
    try {
      // Process the tags string into an array
      const tagsArray = editedTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Update the flashcard
      const updatedFlashcard = {
        ...flashcard,
        notes: editedNotes,
        mnemonic: editedMnemonic,
        tags: tagsArray,
        syncStatus: 'local' // Mark for sync
      };
      
      await saveFlashcard(updatedFlashcard);
      setFlashcard(updatedFlashcard);
      setIsEditing(false);
      refreshFlashcards();
      
      Alert.alert('Success', 'Flashcard updated successfully');
    } catch (error) {
      console.error('Error saving flashcard:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate mnemonic
  const handleGenerateMnemonic = async () => {
    if (!flashcard || isGeneratingMnemonic) return;
    
    setIsGeneratingMnemonic(true);
    try {
      const generatedMnemonic = await generateMnemonic(flashcard.kanji);
      setEditedMnemonic(generatedMnemonic);
    } catch (error) {
      console.error('Error generating mnemonic:', error);
      Alert.alert('Error', 'Failed to generate mnemonic');
    } finally {
      setIsGeneratingMnemonic(false);
    }
  };

  // Get color based on JLPT level
  const getJlptColor = (level) => {
    switch (level) {
      case 'N5':
        return COLORS.n5Color;
      case 'N4':
        return COLORS.n4Color;
      case 'N3':
        return COLORS.n3Color;
      case 'N2':
        return COLORS.n2Color;
      case 'N1':
        return COLORS.n1Color;
      default:
        return COLORS.gray;
    }
  };

  if (isLoading || isAppLoading || !flashcard) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{flashcard.kanji}</Text>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={toggleEditing}
          disabled={isSaving}
        >
          <Icon 
            name={isEditing ? "close" : "edit"} 
            size={24} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container}>
        <View style={styles.kanjiContainer}>
          <Text style={styles.kanjiCharacter}>{flashcard.kanji}</Text>
          
          <View style={[
            styles.jlptBadge, 
            { backgroundColor: getJlptColor(flashcard.jlpt) }
          ]}>
            <Text style={styles.jlptText}>{flashcard.jlpt}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meaning</Text>
          <Text style={styles.meaning}>{flashcard.meaning}</Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Readings</Text>
          
          <View style={styles.readingsContainer}>
            {flashcard.readings.onYomi && flashcard.readings.onYomi.length > 0 && (
              <View style={styles.readingBlock}>
                <Text style={styles.readingType}>On'yomi (音読み)</Text>
                <Text style={styles.readingValues}>
                  {flashcard.readings.onYomi.join('、')}
                </Text>
              </View>
            )}
            
            {flashcard.readings.kunYomi && flashcard.readings.kunYomi.length > 0 && (
              <View style={styles.readingBlock}>
                <Text style={styles.readingType}>Kun'yomi (訓読み)</Text>
                <Text style={styles.readingValues}>
                  {flashcard.readings.kunYomi.join('、')}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {flashcard.examples && flashcard.examples.length > 0 && (
          <>
            <Divider style={styles.divider} />
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Example Words</Text>
              
              <View style={styles.examplesContainer}>
                {flashcard.examples.map((example, index) => (
                  <View key={index} style={styles.exampleItem}>
                    <Text style={styles.exampleWord}>{example.word}</Text>
                    <Text style={styles.exampleReading}>「{example.reading}」</Text>
                    <Text style={styles.exampleMeaning}>{example.meaning}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mnemonic</Text>
            
            {isEditing && (
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={handleGenerateMnemonic}
                disabled={isGeneratingMnemonic}
              >
                <Icon name="psychology" size={16} color={COLORS.white} />
                <Text style={styles.generateButtonText}>
                  {isGeneratingMnemonic ? 'Generating...' : 'Generate'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {isEditing ? (
            <Input
              value={editedMnemonic}
              onChangeText={setEditedMnemonic}
              multiline
              numberOfLines={5}
              placeholder="Enter a mnemonic to help remember this Kanji..."
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
            />
          ) : (
            <Text style={styles.contentText}>
              {flashcard.mnemonic || 'No mnemonic available.'}
            </Text>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          
          {isEditing ? (
            <Input
              value={editedNotes}
              onChangeText={setEditedNotes}
              multiline
              numberOfLines={4}
              placeholder="Add your personal notes about this Kanji..."
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
            />
          ) : (
            <Text style={styles.contentText}>
              {flashcard.notes || 'No notes available.'}
            </Text>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          
          {isEditing ? (
            <Input
              value={editedTags}
              onChangeText={setEditedTags}
              placeholder="Add tags separated by commas (e.g. nature, verbs)"
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              leftIcon={<Icon name="local-offer" size={20} color={COLORS.gray} />}
            />
          ) : (
            <View style={styles.tagsContainer}>
              {flashcard.tags && flashcard.tags.length > 0 ? (
                flashcard.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    title={tag}
                    type="outline"
                    containerStyle={styles.chip}
                  />
                ))
              ) : (
                <Text style={styles.contentText}>No tags.</Text>
              )}
            </View>
          )}
        </View>
        
        {isEditing && (
          <View style={styles.actionButtonsContainer}>
            <Button
              title="Cancel"
              type="outline"
              buttonStyle={styles.cancelButton}
              titleStyle={{ color: COLORS.primary }}
              onPress={toggleEditing}
              disabled={isSaving}
            />
            
            <Button
              title="Save Changes"
              buttonStyle={styles.saveButton}
              loading={isSaving}
              onPress={saveChanges}
            />
          </View>
        )}
        
        {/* Add some bottom padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
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
    paddingHorizontal: SPACING_M,
    paddingVertical: SPACING_M,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxlarge,
    color: COLORS.text,
  },
  backButton: {
    padding: SPACING.xs,
  },
  editButton: {
    padding: SPACING.xs,
  },
  kanjiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  kanjiCharacter: {
    fontSize: SIZES.kanji,
    ...FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  jlptBadge: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS_S,
  },
  jlptText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  divider: {
    marginVertical: SPACING.s,
  },
  section: {
    padding: SPACING.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  meaning: {
    ...FONTS.medium,
    fontSize: SIZES.xlarge,
    color: COLORS.text,
  },
  readingsContainer: {
    marginTop: SPACING.xs,
  },
  readingBlock: {
    marginBottom: SPACING.m,
  },
  readingType: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.lightText,
  },
  readingValues: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  contentText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    lineHeight: 24,
  },
  examplesContainer: {
    marginTop: SPACING.xs,
  },
  exampleItem: {
    marginBottom: SPACING.m,
  },
  exampleWord: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  exampleReading: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.lightText,
  },
  exampleMeaning: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: SPACING.xs,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS_S,
    alignItems: 'center',
  },
  generateButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  inputText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.m,
    marginTop: SPACING.m,
    marginBottom: SPACING.l,
  },
  cancelButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    marginRight: SPACING.s,
    flex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    flex: 1,
  },
});

export default FlashcardDetailScreen;
