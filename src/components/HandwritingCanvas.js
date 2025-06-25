import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator
} from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../utils/theme';
import * as FileSystem from 'expo-file-system';

/**
 * A component that allows users to draw kanji characters for recognition
 */
const HandwritingCanvas = ({ onRecognize, onCancel }) => {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        setIsDrawing(true);
        setCurrentLine([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (event) => {
        if (isDrawing) {
          const { locationX, locationY } = event.nativeEvent;
          setCurrentLine(currentPoints => [...currentPoints, { x: locationX, y: locationY }]);
        }
      },
      onPanResponderRelease: () => {
        if (currentLine.length > 1) {
          setLines(currentLines => [...currentLines, currentLine]);
        }
        setCurrentLine([]);
        setIsDrawing(false);
      }
    })
  ).current;

  // Function to clear the canvas
  const clearCanvas = () => {
    setLines([]);
    setCurrentLine([]);
  };

  // Function to handle kanji recognition
  const recognizeKanji = async () => {
    if (lines.length === 0) {
      return;
    }

    setIsRecognizing(true);
    
    try {
      // Convert canvas to a base64 image (this is a mock implementation)
      // In a real implementation, you'd render the canvas to an image
      const imageBase64 = await convertCanvasToBase64();
      
      // Call the recognition function passed from the parent
      await onRecognize(imageBase64);
    } catch (error) {
      console.error('Error recognizing handwriting:', error);
    } finally {
      setIsRecognizing(false);
    }
  };

  // Mock function to convert canvas to base64 image
  // In a real app, you'd implement proper canvas rendering to image conversion
  const convertCanvasToBase64 = async () => {
    // This is a mock implementation
    // In a real implementation, you'd use something like react-native-view-shot
    
    // For now we'll return a placeholder base64 image
    // Placeholder for demonstration - this would be generated from your canvas
    return "data:image/jpeg;base64,mockBase64Data";
  };

  // Render the drawn lines on the canvas
  const renderLines = () => {
    return lines.map((line, index) => (
      <View key={index} style={styles.lineContainer}>
        <View
          style={[
            styles.line,
            {
              width: '100%',
              height: '100%',
              position: 'absolute',
            },
          ]}
        >
          {line.map((point, pointIndex) => (
            <View
              key={pointIndex}
              style={[
                styles.point,
                {
                  left: point.x - 4, // Adjust for point width
                  top: point.y - 4,  // Adjust for point height
                },
              ]}
            />
          ))}
        </View>
      </View>
    ));
  };

  // Render the current line being drawn
  const renderCurrentLine = () => {
    if (currentLine.length < 1) return null;
    
    return (
      <View style={styles.lineContainer}>
        <View
          style={[
            styles.line,
            {
              width: '100%',
              height: '100%',
              position: 'absolute',
            },
          ]}
        >
          {currentLine.map((point, index) => (
            <View
              key={index}
              style={[
                styles.point,
                {
                  left: point.x - 4, // Adjust for point width
                  top: point.y - 4,  // Adjust for point height
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Draw a Kanji</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <Icon name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.canvasContainer}>
        <View
          style={styles.canvas}
          {...panResponder.panHandlers}
        >
          {renderLines()}
          {renderCurrentLine()}
          <View style={styles.guideGrid}>
            <View style={styles.gridLine} />
            <View style={[styles.gridLine, styles.horizontalLine]} />
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Clear"
          icon={{ name: 'delete-outline', color: COLORS.white }}
          buttonStyle={[styles.button, styles.clearButton]}
          onPress={clearCanvas}
          disabled={isRecognizing || (lines.length === 0 && currentLine.length === 0)}
        />
        
        <Button
          title="Recognize"
          icon={{ name: 'search', color: COLORS.white }}
          buttonStyle={[styles.button, styles.recognizeButton]}
          onPress={recognizeKanji}
          disabled={isRecognizing || lines.length === 0}
          loading={isRecognizing}
        />
      </View>
      
      <Text style={styles.tip}>
        Tip: Draw the kanji as clearly as possible within the box
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.m,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  canvasContainer: {
    flex: 1,
    padding: SPACING.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.s,
  },
  lineContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  line: {
    backgroundColor: 'transparent',
  },
  point: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.black,
    borderRadius: 4,
  },
  guideGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  gridLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: COLORS.gray,
    left: '50%',
  },
  horizontalLine: {
    width: '100%',
    height: 1,
    top: '50%',
    left: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.l,
  },
  button: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.m,
  },
  clearButton: {
    backgroundColor: COLORS.gray,
  },
  recognizeButton: {
    backgroundColor: COLORS.primary,
  },
  tip: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.lightText,
    textAlign: 'center',
    paddingBottom: SPACING.l,
  },
});

export default HandwritingCanvas;
