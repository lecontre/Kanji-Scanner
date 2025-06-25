import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, spacing } from '../utils/theme';

const EmptyState = ({ 
  title = 'No Data Found', 
  message = 'There is nothing to display here.', 
  icon = 'info-outline',
  action = null,
  actionText = 'Take Action'
}) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={60} color={COLORS.gray} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={action}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xlarge,
    color: COLORS.text,
    marginTop: SPACING.l,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  message: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.lightText,
    textAlign: 'center',
    marginBottom: SPACING.l,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.m,
    marginTop: SPACING.l,
  },
  actionText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
});

export default EmptyState;
