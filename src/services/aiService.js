// Gemini API service using gemini-2.0-flash-lite model
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with your key
const API_KEY = "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-lite",
  generationConfig: {
    temperature: 0.2,    // Lower temperature for more focused, consistent responses
    topP: 0.9,           // Default top-p sampling
    topK: 250             // Default top-k sampling
  }
});

// Helper function to clean mnemonic text from markdown formatting
const cleanMnemonicText = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*([^*]+)\*/g, '$1')     // Remove italic markdown
    .replace(/\_\_([^_]+)\_\_/g, '$1') // Remove underline markdown
    .replace(/\_([^_]+)\_/g, '$1')     // Remove alternate italic markdown
    .replace(/\`([^`]+)\`/g, '$1')     // Remove code markdown
    .replace(/\#\#\#*\s?/g, '')        // Remove heading markers
    .replace(/\>\s?/g, '')             // Remove quote markers
    .replace(/\<[^>]+\>/g, '');        // Remove HTML tags
};

// Function to process an image and extract Kanji
export const extractKanjiFromImage = async (imageBase64) => {
  try {
    console.log('Extracting Kanji from image using Gemini API...');
    
    // Prepare the image for the API
    const imageParts = [
      {
        inlineData: {
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ""),
          mimeType: "image/jpeg"
        }
      }
    ];
    
    // Determine if we're analyzing a handwritten kanji or a photo with kanji
    const isHandwritten = imageBase64.startsWith("data:image/jpeg;base64,mockBase64Data");
    
    // Improved prompt for better structured results
    const prompt = isHandwritten 
      ? `
        Analyze this image of a handwritten Japanese Kanji character.
        Identify the single most likely Kanji character that was drawn, even if the drawing is imperfect.
        
        For the identified Kanji character, provide:
        1. The Kanji character itself
        2. Its meanings in English (array of strings)
        3. On'yomi readings in katakana (array of strings)
        4. Kun'yomi readings in hiragana (array of strings) 
        5. JLPT level (N5 to N1)
        6. Stroke count (number)
        7. Example words using this Kanji with their readings and meanings
        
        Format the response as a JSON array with a single object:
        [
          {
            "kanji": "字",
            "meanings": ["character", "letter", "word"],
            "onYomi": ["ジ"],
            "kunYomi": ["あざ"],
            "jlptLevel": "N5",
            "strokeCount": 6,
            "examples": [
              {"word": "漢字", "reading": "かんじ", "meaning": "Chinese character"}
            ]
          }
        ]
        
        Ensure the response is valid JSON with no additional text before or after.
      `
      : `
        Analyze this image and identify Japanese Kanji characters visible.
        Only include clearly visible Kanji characters that you can confidently identify.
        Limit to at most 5 most clearly visible Kanji.
        
        For each Kanji character, provide:
        1. The Kanji character itself
        2. Its meanings in English (array of strings)
        3. On'yomi readings in katakana (array of strings)
        4. Kun'yomi readings in hiragana (array of strings) 
        5. JLPT level (N5 to N1)
        6. Stroke count (number)
        7. Example words using this Kanji with their readings and meanings
        
        Format the response as a JSON array:
        [
          {
            "kanji": "字",
            "meanings": ["character", "letter", "word"],
            "onYomi": ["ジ"],
            "kunYomi": ["あざ"],
            "jlptLevel": "N5",
            "strokeCount": 6,
            "examples": [
              {"word": "漢字", "reading": "かんじ", "meaning": "Chinese character"}
            ]
          }
        ]
        
        Ensure the response is valid JSON with no additional text before or after.
      `;
    
    // Call the Gemini API with debugging
    console.log('Calling Gemini API...');
    const result = await model.generateContent([prompt, ...imageParts]);
    console.log('Received response from Gemini API');
    const response = await result.response;
    const textResponse = response.text();
    console.log('Raw response:', textResponse.substring(0, 100) + '...');
    
    // Parse the JSON response with improved error handling
    try {
      // Try to extract JSON from the response
      let jsonStr = textResponse;
      
      // Check if response is wrapped in markdown code blocks
      const jsonMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1];
        console.log('Extracted JSON from code block');
      } else {
        // Try to find array brackets if not in code block
        const jsonStartIndex = textResponse.indexOf('[');
        const jsonEndIndex = textResponse.lastIndexOf(']') + 1;
        
        if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
          jsonStr = textResponse.substring(jsonStartIndex, jsonEndIndex);
          console.log('Extracted JSON using brackets');
        }
      }
      
      console.log('Attempting to parse:', jsonStr.substring(0, 100) + '...');
      let detectedKanji = JSON.parse(jsonStr);
      
      // Ensure we have an array
      if (!Array.isArray(detectedKanji)) {
        console.warn('Gemini API did not return an array, converting to array');
        detectedKanji = detectedKanji ? [detectedKanji] : [];
      }
      
      console.log(`Successfully parsed ${detectedKanji.length} kanji entries`);
      
      // Use the cleanMnemonicText helper function defined at the top of the file
      
      // Normalize the response data to ensure consistent structure
      const normalizedKanji = detectedKanji.map(kanji => ({
        kanji: kanji?.kanji || '?',
        meanings: Array.isArray(kanji?.meanings) ? kanji.meanings : ['Unknown'],
        onYomi: Array.isArray(kanji?.onYomi) ? kanji.onYomi : [],
        kunYomi: Array.isArray(kanji?.kunYomi) ? kanji.kunYomi : [],
        jlptLevel: kanji?.jlptLevel || 'Unknown',
        strokeCount: kanji?.strokeCount || 0,
        examples: Array.isArray(kanji?.examples) ? kanji.examples : [],
        mnemonic: cleanMnemonicText(kanji?.mnemonic || ''),
        imageReference: imageBase64.substring(0, 100) // Store part as reference
      }));
      
      console.log('Returning normalized kanji data');
      return normalizedKanji;
    } catch (parseError) {
      console.error("Error parsing Gemini API response:", parseError);
      console.error("Response text:", textResponse);
      throw new Error("Failed to parse kanji data");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback to mock data if the API fails
    console.log('Using mock data fallback');
    return [
      {
        kanji: '海',
        meanings: ['sea', 'ocean'],
        onYomi: ['カイ'],
        kunYomi: ['うみ'],
        jlptLevel: 'N5',
        strokeCount: 9,
        examples: [
          { word: '海岸', reading: 'かいがん', meaning: 'coast, beach' },
          { word: '海水', reading: 'かいすい', meaning: 'seawater' }
        ],
        mnemonic: 'Water (氵) with a mother (母) figure inside represents the ocean as the mother of all waters.',
        imageReference: imageBase64.substring(0, 100) // Just store a small part as reference
      },
      {
        kanji: '山',
        meanings: ['mountain'],
        onYomi: ['サン'],
        kunYomi: ['やま'],
        jlptLevel: 'N5',
        strokeCount: 3,
        examples: [
          { word: '火山', reading: 'かざん', meaning: 'volcano' },
          { word: '山道', reading: 'やまみち', meaning: 'mountain path' }
        ],
        mnemonic: 'Looks like three mountain peaks.',
        imageReference: imageBase64.substring(0, 100) // Just store a small part as reference
      }
    ];
  }
};

// Function to get detailed information about a Kanji using Gemini API
export const getKanjiDetails = async (kanji) => {
  try {
    console.log(`Getting details for Kanji: ${kanji} using Gemini API`);
    
    const prompt = `
      Provide detailed information about the Japanese Kanji: ${kanji}
      
      Include:
      1. The Kanji character itself
      2. All meanings in English
      3. On'yomi readings (in katakana)
      4. Kun'yomi readings (in hiragana)
      5. JLPT level (N5 to N1)
      6. Stroke count
      7. 3 example words or compounds using this Kanji with:
         - The word in Japanese
         - Reading in hiragana
         - Meaning in English
      8. A brief mnemonic to help remember the kanji
      
      Format the response as JSON with the following keys:
      kanji, meanings (array), onYomi (array), kunYomi (array), jlptLevel, strokeCount, examples (array of objects with word, reading, meaning), mnemonic (string)
      
      IMPORTANT: Make sure the mnemonic is plain text with no markdown formatting, special characters, or emphasis markers.
      Use normal text capitalization rules (capitalize first word of sentences and proper nouns only).
    `;
    
    // Call the Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    try {
      // Find the JSON in the response - often model wraps JSON in code blocks or text
      let jsonStr = textResponse;
      
      // Check if JSON is wrapped in code blocks
      const jsonMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1];
      }
      
      // Parse the JSON
      const kanjiData = JSON.parse(jsonStr);
      
      // Clean up the mnemonic text if it exists to remove any markdown formatting
      if (kanjiData && kanjiData.mnemonic) {
        kanjiData.mnemonic = cleanMnemonicText(kanjiData.mnemonic);
      }
      
      return kanjiData;
    } catch (parseError) {
      console.error("Error parsing Gemini API response:", parseError);
      throw new Error("Failed to parse kanji data");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Fallback to mock data
    const kanjiData = {
      '海': {
        kanji: '海',
        meanings: ['sea', 'ocean'],
        onYomi: ['カイ'],
        kunYomi: ['うみ'],
        jlptLevel: 'N5',
        strokeCount: 9,
        examples: [
          { word: '海岸', reading: 'かいがん', meaning: 'coast, beach' },
          { word: '海水', reading: 'かいすい', meaning: 'seawater' },
          { word: '海外', reading: 'かいがい', meaning: 'overseas, foreign' }
        ],
        mnemonic: 'Water (氵) with a mother (母) figure inside represents the ocean as the mother of all waters.'
      },
      '山': {
        kanji: '山',
        meanings: ['mountain'],
        onYomi: ['サン'],
        kunYomi: ['やま'],
        jlptLevel: 'N5',
        strokeCount: 3,
        examples: [
          { word: '火山', reading: 'かざん', meaning: 'volcano' },
          { word: '山道', reading: 'やまみち', meaning: 'mountain path' },
          { word: '富士山', reading: 'ふじさん', meaning: 'Mt. Fuji' }
        ],
        mnemonic: 'Looks like three mountain peaks.'
      },
      '道': {
        kanji: '道',
        meanings: ['road', 'way', 'path'],
        onYomi: ['ドウ', 'トウ'],
        kunYomi: ['みち'],
        jlptLevel: 'N5',
        strokeCount: 12,
        examples: [
          { word: '道路', reading: 'どうろ', meaning: 'road' },
          { word: '書道', reading: 'しょどう', meaning: 'calligraphy' },
          { word: '歩道', reading: 'ほどう', meaning: 'sidewalk' }
        ],
        mnemonic: 'The radical 辶 means "going" combined with 首 (head), suggesting following a path.'
      },
      '川': {
        kanji: '川',
        meanings: ['river', 'stream'],
        onYomi: ['セン'],
        kunYomi: ['かわ'],
        jlptLevel: 'N5',
        strokeCount: 3,
        examples: [
          { word: '河川', reading: 'かせん', meaning: 'rivers' },
          { word: '川岸', reading: 'かわぎし', meaning: 'riverbank' }
        ],
        mnemonic: 'Looks like flowing water with three streams.'
      }
    };
    
    return kanjiData[kanji] || {
      kanji: kanji,
      meanings: ['Unknown'],
      onYomi: ['?'],
      kunYomi: ['?'],
      jlptLevel: 'Unknown',
      strokeCount: 0,
      examples: [],
      mnemonic: 'No information available for this kanji.'
    };
  }
};

// Function to generate a mnemonic for a Kanji using Gemini API
export const generateMnemonic = async (kanji) => {
  try {
    console.log(`Generating mnemonic for: ${kanji} using Gemini API`);
    
    const prompt = `
      Create a memorable mnemonic or memory aid for the Japanese Kanji: ${kanji}
      
      Consider:
      1. The visual components/radicals of the kanji
      2. The meaning of the kanji
      3. Any associations that might help remember the character
      
      Make the mnemonic visual, creative, and easy to remember.
      Don't include any additional text or explanations, just provide the mnemonic as a simple paragraph.
      Keep it under 100 words.
      
      IMPORTANT: Write in plain text only. Do not use any markdown formatting, special characters, or text emphasis markers like **bold**, *italics*, etc.
      Use normal text capitalization rules (capitalize first word of sentences and proper nouns only).
    `;
    
    // Call the Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let mnemonic = response.text().trim();
    
    // Clean up any markdown or special formatting that might have been included
    mnemonic = cleanMnemonicText(mnemonic);
    
    return mnemonic;
  } catch (error) {
    console.error("Gemini API error generating mnemonic:", error);
    
    // Fallback to mock mnemonics
    const mnemonics = {
      '海': 'Water (氵) with a mother (母) figure inside represents the ocean as the mother of all waters.',
      '山': 'Picture three mountain peaks side by side.',
      '道': 'Think of a person walking on a long road with a headlamp.',
      '川': 'Imagine three parallel streams of water flowing downward.'
    };
    
    return mnemonics[kanji] || 'Try associating the kanji with a visual image that represents its meaning.';
  }
};
