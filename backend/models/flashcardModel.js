const mongoose = require('mongoose');

const flashcardSchema = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    kanji: {
      type: String,
      required: true
    },
    meaning: {
      type: String,
      required: true
    },
    readings: {
      onYomi: [String],
      kunYomi: [String]
    },
    jlpt: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    examples: [
      {
        word: String,
        reading: String,
        meaning: String
      }
    ],
    mnemonic: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tags: [String],
    userId: {
      type: String,
      required: true
    },
    imageReference: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

module.exports = Flashcard;
