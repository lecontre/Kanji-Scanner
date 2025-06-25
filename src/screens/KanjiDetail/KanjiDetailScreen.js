import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Alert
} from 'react-native';
import { Button, Icon, Divider, Input } from '@rneui/themed';
import { useApp } from '../../context/AppContext';
import uuid from 'react-native-uuid';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, COMMON_STYLES } from '../../utils/theme';
import { generateMnemonic } from '../../services/aiService';

const KanjiDetailScreen = ({ route, navigation }) => {
  const { kanji } = route.params;
  const { addFlashcard } = useApp();
  
  const [customNotes, setCustomNotes] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState(kanji.mnemonic || '');
  
  // Generate mnemonic using AI
  const handleGenerateMnemonic = async () => {
    if (isGeneratingMnemonic) return;
    
    setIsGeneratingMnemonic(true);
    try {
      const generatedMnemonic = await generateMnemonic(kanji.kanji);
      setMnemonic(generatedMnemonic);
    } catch (error) {
      console.error('Error generating mnemonic:', error);
      Alert.alert('Error', 'Failed to generate mnemonic. Please try again.');
    } finally {
      setIsGeneratingMnemonic(false);
    }
  };
  
  // Create flashcard and save
  const createFlashcard = async () => {
    setIsSaving(true);
    
    try {
      // Process the tags string into an array
      const tagsArray = customTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Add JLPT level as a tag if not already included
      if (!tagsArray.includes(kanji.jlptLevel)) {
        tagsArray.push(kanji.jlptLevel);
      }
      
      // Create the flashcard object
      const flashcard = {
        id: uuid.v4(),
        kanji: kanji.kanji,
        meaning: kanji.meanings.join(', '),
        readings: {
          onYomi: kanji.onYomi || [],
          kunYomi: kanji.kunYomi || []
        },
        jlpt: kanji.jlptLevel,
        notes: customNotes,
        examples: kanji.examples || [],
        mnemonic: mnemonic,
        createdAt: new Date().toISOString(),
        tags: tagsArray,
        imageReference: kanji.imageReference || ''
      };
      
      // Save the flashcard
      const result = await addFlashcard(flashcard);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Flashcard created successfully!',
          [
            { 
              text: 'View All Cards', 
              onPress: () => navigation.navigate('FlashcardList', { filter: { type: 'all' } }) 
            },
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to create flashcard');
      }
    } catch (error) {
      console.error('Error creating flashcard:', error);
      Alert.alert('Error', 'Failed to create flashcard. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kanji Details</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.container}>
        <View style={styles.kanjiHeader}>
          <Text style={styles.kanjiCharacter}>{kanji.kanji}</Text>
          
          <View style={styles.headerRight}>
            <View style={styles.jlptBadge}>
              <Text style={styles.jlptText}>{kanji.jlptLevel}</Text>
            </View>
            
            <Text style={styles.strokeCount}>{kanji.strokeCount} strokes</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meanings</Text>
          <Text style={styles.meanings}>{kanji.meanings.join(', ')}</Text>
        </View>
        
        <Divider />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Readings</Text>
          
          <View style={styles.readingsContainer}>
            <View style={styles.readingBlock}>
              <Text style={styles.readingTitle}>On'yomi (音読み)</Text>
              <Text style={styles.readingValues}>
                {kanji.onYomi && kanji.onYomi.length > 0 
                  ? kanji.onYomi.join('、') 
                  : 'N/A'
                }
              </Text>
            </View>
            
            <View style={styles.readingBlock}>
              <Text style={styles.readingTitle}>Kun'yomi (訓読み)</Text>
              <Text style={styles.readingValues}>
                {kanji.kunYomi && kanji.kunYomi.length > 0 
                  ? kanji.kunYomi.join('、') 
                  : 'N/A'
                }
              </Text>
            </View>
          </View>
        </View>
        
        <Divider />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Example Words</Text>
          
          {kanji.examples && kanji.examples.length > 0 ? (
            <View style={styles.examplesContainer}>
              {kanji.examples.map((example, index) => (
                <View key={index} style={styles.exampleItem}>
                  <Text style={styles.exampleWord}>{example.word}</Text>
                  <Text style={styles.exampleReading}>「{example.reading}」</Text>
                  <Text style={styles.exampleMeaning}>{example.meaning}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noExamples}>No examples available.</Text>
          )}
        </View>
        
        <Divider />
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mnemonic</Text>
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
          </View>
          
          <Text style={styles.mnemonicText}>
            {mnemonic 
              ? mnemonic
                  .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown if any passed through
                  .replace(/\*([^*]+)\*/g, '$1')     // Remove italic markdown if any
              : 'No mnemonic available. Generate one with the button above.'
            }
          </Text>
        </View>
        
        <Divider />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add to Flashcards</Text>
          
          <Input
            placeholder="Add notes (optional)"
            value={customNotes}
            onChangeText={setCustomNotes}
            multiline
            numberOfLines={3}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            leftIcon={<Icon name="note" size={24} color={COLORS.gray} />}
          />
          
          <Input
            placeholder="Add tags, comma separated (e.g., verbs, nature)"
            value={customTags}
            onChangeText={setCustomTags}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            leftIcon={<Icon name="local-offer" size={24} color={COLORS.gray} />}
          />
          
          <Button
            title="Create Flashcard"
            icon={{ name: 'add-circle-outline', color: COLORS.white }}
            buttonStyle={styles.createButton}
            loading={isSaving}
            onPress={createFlashcard}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  backButton: {
    padding: SPACING.xs,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  kanjiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.l,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  kanjiCharacter: {
    fontSize: SIZES.kanji,
    ...FONTS.bold,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  jlptBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.s,
    marginBottom: SPACING.xs,
  },
  jlptText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
  strokeCount: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.lightText,
  },
  section: {
    padding: SPACING.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  meanings: {
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
  readingTitle: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.lightText,
    marginBottom: SPACING.xs,
  },
  readingValues: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  examplesContainer: {
    marginTop: SPACING.s,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.s,
    flexWrap: 'wrap',
  },
  exampleWord: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginRight: SPACING.s,
  },
  exampleReading: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.lightText,
    marginRight: SPACING.s,
  },
  exampleMeaning: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  noExamples: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.lightText,
    fontStyle: 'italic',
  },
  mnemonicText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    lineHeight: 24,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.s,
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
    marginBottom: SPACING.s,
  },
  inputText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    marginTop: SPACING.m,
    borderRadius: RADIUS.m,
  },
});

export default KanjiDetailScreen;
