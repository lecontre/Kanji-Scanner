import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, Chip, Divider, Avatar, List } from 'react-native-paper';
import { spacing, colors } from '../utils/theme';

/**
 * Example component showing how to use React Native Paper components with our theme
 */
const PaperExample = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title 
          title="React Native Paper" 
          subtitle="Material Design components"
          left={(props) => <Avatar.Icon {...props} icon="book" />}
        />
        <Card.Content>
          <Text variant="bodyLarge">
            This example shows how to use React Native Paper components in the KanjiFinder app.
          </Text>
          <Divider style={styles.divider} />
          <Text variant="bodyMedium">
            React Native Paper provides beautiful, ready-to-use components that follow Material Design guidelines.
          </Text>
          
          <View style={styles.chipContainer}>
            <Chip icon="bookmark" style={styles.chip}>N5</Chip>
            <Chip icon="bookmark" style={styles.chip}>N4</Chip>
            <Chip icon="bookmark" style={styles.chip}>N3</Chip>
          </View>
          
          <List.Section>
            <List.Subheader>Features</List.Subheader>
            <List.Item 
              title="Material Design" 
              description="Consistent with Material Design guidelines" 
              left={props => <List.Icon {...props} icon="material-design" />}
            />
            <List.Item 
              title="Cross-platform" 
              description="Works on iOS and Android" 
              left={props => <List.Icon {...props} icon="cellphone" />}
            />
            <List.Item 
              title="Theming" 
              description="Easy to customize with theming" 
              left={props => <List.Icon {...props} icon="palette" />}
            />
          </List.Section>
        </Card.Content>
        <Card.Actions>
          <Button>Cancel</Button>
          <Button mode="contained">OK</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default PaperExample;
