import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, spacing } from '../utils/theme';

const NetworkStatusBar = ({ status, onSync }) => {
  if (status === 'online') {
    return null; // Don't show anything when online
  }

  return (
    <View style={styles.container}>
      <Icon name="wifi-off" size={16} color={COLORS.white} />
      <Text style={styles.text}>You're offline. Flashcards will sync when connection is restored.</Text>
      {onSync && (
        <TouchableOpacity style={styles.button} onPress={onSync}>
          <Text style={styles.buttonText}>Sync Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warning,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  text: {
    ...FONTS.regular,
    color: COLORS.white,
    fontSize: SIZES.small,
    marginLeft: SPACING.s,
    marginRight: SPACING.s,
    flex: 1,
  },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.s,
  },
  buttonText: {
    ...FONTS.medium,
    color: COLORS.warning,
    fontSize: SIZES.small,
  },
});

export default NetworkStatusBar;
