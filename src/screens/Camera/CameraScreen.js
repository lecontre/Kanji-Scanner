import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button, Icon, Overlay } from '@rneui/themed';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, COMMON_STYLES, spacing } from '../../utils/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import HandwritingCanvas from '../../components/HandwritingCanvas';
import { extractKanjiFromImage } from '../../services/aiService';

const CameraScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState('back'); // Use 'back' or 'front' string literals
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedKanji, setDetectedKanji] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showHandwriting, setShowHandwriting] = useState(false);
  
  const cameraRef = useRef(null);

  // Request camera permissions if needed
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Handle taking a picture
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: false
        });
        
        setCapturedImage(photo);
        processImage(photo);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture.');
      }
    }
  };

  // Handle picking an image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
        allowsEditing: true,
      });
      
      if (!result.canceled) {
        setCapturedImage(result.assets[0]);
        processImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  // Process the image using AI service
  const processImage = async (image) => {
    setIsProcessing(true);
    try {
      // In real app, we'd send the base64 image to the Gemini API
      const base64Image = `data:image/jpeg;base64,${image.base64}`;
      
      // Call AI service to extract Kanji
      let kanji = await extractKanjiFromImage(base64Image);
      
      // Ensure we have valid data for each kanji
      kanji = kanji.map(item => ({
        kanji: item.kanji || '?',
        meanings: Array.isArray(item.meanings) ? item.meanings : ['Unknown'],
        onYomi: Array.isArray(item.onYomi) ? item.onYomi : [],
        kunYomi: Array.isArray(item.kunYomi) ? item.kunYomi : [],
        jlptLevel: item.jlptLevel || 'Unknown',
        strokeCount: item.strokeCount || 0,
        examples: Array.isArray(item.examples) ? item.examples : [],
        mnemonic: item.mnemonic || '',
        imageReference: item.imageReference || ''
      }));
      
      setDetectedKanji(kanji);
      setShowResults(true);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render help tips if no kanji detected
  const renderNoKanjiHelp = () => (
    <View style={styles.noKanjiContainer}>
      <Icon name="search-off" size={60} color={COLORS.gray} />
      <Text style={styles.noKanjiTitle}>No Kanji Detected</Text>
      <Text style={styles.noKanjiText}>Try these tips for better results:</Text>
      
      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Icon name="lightbulb-outline" size={20} color={COLORS.primary} />
          <Text style={styles.tipText}>Ensure good lighting</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Icon name="crop-free" size={20} color={COLORS.primary} />
          <Text style={styles.tipText}>Frame the Kanji clearly</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Icon name="straighten" size={20} color={COLORS.primary} />
          <Text style={styles.tipText}>Hold the camera steady and level</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Icon name="filter-center-focus" size={20} color={COLORS.primary} />
          <Text style={styles.tipText}>Focus on one or a few characters</Text>
        </View>
      </View>
      
      <Button
        title="Try Again"
        icon={{ name: 'refresh', color: COLORS.white }}
        buttonStyle={styles.tryAgainButton}
        onPress={() => {
          setShowResults(false);
          setCapturedImage(null);
        }}
      />
    </View>
  );

  // Handle navigation to KanjiDetail screen
  const viewKanjiDetail = (kanji) => {
    navigation.navigate('KanjiDetail', { kanji });
  };

  // Render list of detected kanji
  const renderKanjiList = () => (
    <ScrollView 
      style={styles.kanjiListContainer}
      contentContainerStyle={styles.kanjiListContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.resultsTitle}>
        {detectedKanji.length === 1 
          ? '1 Kanji Detected'
          : `${detectedKanji.length} Kanji Detected`
        }
      </Text>
      
      {Array.isArray(detectedKanji) && detectedKanji.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.kanjiCard}
          onPress={() => viewKanjiDetail(item)}
        >
          <View style={styles.kanjiCardContent}>
            <Text style={styles.kanjiCharacter}>{item?.kanji || '?'}</Text>
            
            <View style={styles.kanjiInfo}>
              <Text style={styles.kanjiMeaning}>
                {item.meanings && Array.isArray(item.meanings) 
                  ? item.meanings.join(', ')
                  : 'No meaning available'}
              </Text>
              
              <View style={styles.kanjiMeta}>
                <View style={styles.jlptBadge}>
                  <Text style={styles.jlptText}>{item.jlptLevel || 'N?'}</Text>
                </View>
                <Text style={styles.strokeCount}>
                  {item.strokeCount !== undefined ? `${item.strokeCount} strokes` : 'Unknown strokes'}
                </Text>
              </View>
              
              <Text style={styles.kanjiReading}>
                <Text style={styles.readingLabel}>On: </Text>
                {item.onYomi && Array.isArray(item.onYomi) 
                  ? item.onYomi.join(', ') 
                  : 'N/A'}
                {'  '}
                <Text style={styles.readingLabel}>Kun: </Text>
                {item.kunYomi && Array.isArray(item.kunYomi) 
                  ? item.kunYomi.join(', ') 
                  : 'N/A'}
              </Text>
            </View>
            
            <Icon name="chevron-right" color={COLORS.gray} />
          </View>
        </TouchableOpacity>
      ))}
      
      <Button
        title="Scan Again"
        icon={{ name: 'camera-alt', color: COLORS.white }}
        buttonStyle={[styles.button, { marginTop: SPACING.m, marginBottom: SPACING.xl }]}
        onPress={() => {
          setShowResults(false);
          setCapturedImage(null);
          setDetectedKanji([]);
        }}
      />
    </ScrollView>
  );

  // If waiting for camera permissions
  if (!permission) {
    return <LoadingSpinner />;
  }
  
  // If camera permissions denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={COMMON_STYLES.safeArea}>
        <View style={styles.permissionContainer}>
          <Icon name="no-photography" size={80} color={COLORS.gray} />
          <Text style={styles.permissionTitle}>Camera Access Denied</Text>
          <Text style={styles.permissionText}>
            Please enable camera access in your device settings to use this feature.
          </Text>
          <Button
            title="Request Permission"
            icon={{ name: 'camera-alt', color: COLORS.white }}
            buttonStyle={[styles.button, { marginBottom: SPACING.m }]}
            onPress={requestPermission}
          />
          <Button
            title="Use Image from Gallery"
            icon={{ name: 'photo-library', color: COLORS.white }}
            buttonStyle={[styles.button, { marginTop: SPACING.l }]}
            onPress={pickImage}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {!showResults ? (
        <>
          {!capturedImage ? (
            <>
              <CameraView 
                style={styles.camera} 
                facing={cameraType}
                ref={cameraRef}
                onCameraReady={() => console.log('Camera ready')}
                onMountError={(error) => console.error('Camera error:', error)}
              >
                <View style={styles.cameraOverlay}>
                  <View style={styles.cameraMask}>
                    <View style={styles.guideFrame} />
                  </View>
                  <Text style={styles.guideText}>
                    Position the Kanji in the frame
                  </Text>
                </View>
              </CameraView>
              
              <View style={styles.controlsContainer}>
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={pickImage}
                >
                  <Icon name="photo-library" size={28} color={COLORS.white} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureCircle} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => setShowHandwriting(true)}
                >
                  <Icon name="gesture" size={28} color={COLORS.white} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => setCameraType(
                    cameraType === 'back'
                      ? 'front'
                      : 'back'
                  )}
                >
                  <Icon name="flip-camera-ios" size={28} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.previewContainer}>
              <Image 
                source={{ uri: capturedImage.uri }} 
                style={styles.previewImage} 
              />
            </View>
          )}
        </>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          {detectedKanji.length > 0 ? renderKanjiList() : renderNoKanjiHelp()}
        </SafeAreaView>
      )}
      
      {/* Processing overlay */}
      <Overlay 
        isVisible={isProcessing} 
        overlayStyle={styles.overlay}
      >
        <LoadingSpinner color={COLORS.white} size="large" />
        <Text style={styles.overlayText}>Processing image...</Text>
      </Overlay>
      
      {/* Handwriting canvas overlay */}
      <Overlay
        isVisible={showHandwriting}
        overlayStyle={styles.handwritingOverlay}
        onBackdropPress={() => setShowHandwriting(false)}
      >
        <HandwritingCanvas 
          onRecognize={(imageBase64) => {
            setShowHandwriting(false);
            processImage({ base64: imageBase64.replace('data:image/jpeg;base64,', '') });
          }}
          onCancel={() => setShowHandwriting(false)}
        />
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraMask: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: RADIUS.m,
  },
  guideText: {
    ...FONTS.medium,
    color: COLORS.white,
    fontSize: SIZES.medium,
    textAlign: 'center',
    marginTop: SPACING.l,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.black,
  },
  controlButton: {
    padding: SPACING.m,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    width: '80%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: RADIUS.m,
  },
  overlayText: {
    ...FONTS.medium,
    color: COLORS.white,
    marginTop: SPACING.m,
  },
  handwritingOverlay: {
    width: '90%',
    height: '80%',
    padding: 0,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.m,
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permissionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxlarge,
    color: COLORS.text,
    marginTop: SPACING.l,
    marginBottom: SPACING.s,
  },
  permissionText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    textAlign: 'center',
    color: COLORS.lightText,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.m,
  },
  noKanjiContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  noKanjiTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxlarge,
    color: COLORS.text,
    marginTop: SPACING.l,
    marginBottom: SPACING.s,
  },
  noKanjiText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SPACING.l,
  },
  tipsList: {
    width: '100%',
    marginBottom: SPACING.l,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  tipText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginLeft: SPACING.m,
  },
  tryAgainButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.m,
  },
  kanjiListContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  kanjiListContent: {
    padding: SPACING.m,
    paddingBottom: SPACING.xl,
  },
  resultsTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxlarge,
    color: COLORS.text,
    marginVertical: SPACING.m,
  },
  kanjiCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.m,
    marginBottom: SPACING.m,
    padding: SPACING.m,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  kanjiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kanjiCharacter: {
    fontSize: SIZES.kanji/1.5,
    ...FONTS.bold,
    marginRight: SPACING.m,
  },
  kanjiInfo: {
    flex: 1,
  },
  kanjiMeaning: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  kanjiMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  jlptBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.s,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginRight: SPACING.s,
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
  kanjiReading: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  readingLabel: {
    ...FONTS.medium,
  }
});

export default CameraScreen;
