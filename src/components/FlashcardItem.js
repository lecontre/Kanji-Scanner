import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Icon } from '@rneui/themed';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, spacing } from '../utils/theme';

const FlashcardItem = ({ flashcard, onPress, onDelete }) => {
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card containerStyle={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.leftContainer}>
            <Text style={styles.kanji}>{flashcard.kanji}</Text>
            <View style={[styles.jlptBadge, { backgroundColor: getJlptColor(flashcard.jlpt) }]}>
              <Text style={styles.jlptText}>{flashcard.jlpt}</Text>
            </View>
          </View>
          
          <View style={styles.rightContainer}>
            <Text style={styles.meaning}>{flashcard.meaning}</Text>
            
            <View style={styles.readingsContainer}>
              {flashcard.readings.onYomi && flashcard.readings.onYomi.length > 0 && (
                <Text style={styles.reading}>
                  <Text style={styles.readingLabel}>On: </Text>
                  {flashcard.readings.onYomi.join(', ')}
                </Text>
              )}
              
              {flashcard.readings.kunYomi && flashcard.readings.kunYomi.length > 0 && (
                <Text style={styles.reading}>
                  <Text style={styles.readingLabel}>Kun: </Text>
                  {flashcard.readings.kunYomi.join(', ')}
                </Text>
              )}
            </View>
            
            {flashcard.examples && flashcard.examples.length > 0 && (
              <Text style={styles.example}>
                {flashcard.examples[0].word} 「{flashcard.examples[0].reading}」
              </Text>
            )}
          </View>
          
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete(flashcard.id);
              }}
            >
              <Icon name="delete" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
        
        {flashcard.tags && flashcard.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {flashcard.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    margin: SPACING.s,
    marginBottom: SPACING.m,
    backgroundColor: COLORS.white,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.m,
  },
  rightContainer: {
    flex: 1,
  },
  kanji: {
    fontSize: SIZES.kanji,
    ...FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  jlptBadge: {
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jlptText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    ...FONTS.bold,
  },
  meaning: {
    fontSize: SIZES.large,
    ...FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  readingsContainer: {
    marginBottom: SPACING.xs,
  },
  reading: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  readingLabel: {
    ...FONTS.medium,
  },
  example: {
    fontSize: SIZES.small,
    color: COLORS.lightText,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.s,
  },
  tag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagText: {
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
});

export default FlashcardItem;
