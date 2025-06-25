const asyncHandler = require('express-async-handler');
const Flashcard = require('../models/flashcardModel');

// @desc    Fetch all flashcards
// @route   GET /api/flashcards
// @access  Private
const getFlashcards = asyncHandler(async (req, res) => {
  const flashcards = await Flashcard.find({ userId: req.user.id });
  res.json(flashcards);
});

// @desc    Fetch single flashcard
// @route   GET /api/flashcards/:id
// @access  Private
const getFlashcardById = asyncHandler(async (req, res) => {
  const flashcard = await Flashcard.findOne({
    id: req.params.id,
    userId: req.user.id
  });

  if (flashcard) {
    res.json(flashcard);
  } else {
    res.status(404);
    throw new Error('Flashcard not found');
  }
});

// @desc    Create a flashcard
// @route   POST /api/flashcards
// @access  Private
const createFlashcard = asyncHandler(async (req, res) => {
  const {
    id,
    kanji,
    meaning,
    readings,
    jlpt,
    notes,
    examples,
    mnemonic,
    tags,
    imageReference
  } = req.body;

  const flashcard = new Flashcard({
    id,
    kanji,
    meaning,
    readings,
    jlpt,
    notes,
    examples,
    mnemonic,
    tags,
    userId: req.user.id,
    imageReference
  });

  const createdFlashcard = await flashcard.save();
  res.status(201).json(createdFlashcard);
});

// @desc    Update a flashcard
// @route   PUT /api/flashcards/:id
// @access  Private
const updateFlashcard = asyncHandler(async (req, res) => {
  const {
    kanji,
    meaning,
    readings,
    jlpt,
    notes,
    examples,
    mnemonic,
    tags,
    imageReference
  } = req.body;

  const flashcard = await Flashcard.findOne({
    id: req.params.id,
    userId: req.user.id
  });

  if (flashcard) {
    flashcard.kanji = kanji || flashcard.kanji;
    flashcard.meaning = meaning || flashcard.meaning;
    flashcard.readings = readings || flashcard.readings;
    flashcard.jlpt = jlpt || flashcard.jlpt;
    flashcard.notes = notes || flashcard.notes;
    flashcard.examples = examples || flashcard.examples;
    flashcard.mnemonic = mnemonic || flashcard.mnemonic;
    flashcard.tags = tags || flashcard.tags;
    flashcard.imageReference = imageReference || flashcard.imageReference;

    const updatedFlashcard = await flashcard.save();
    res.json(updatedFlashcard);
  } else {
    res.status(404);
    throw new Error('Flashcard not found');
  }
});

// @desc    Delete a flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteFlashcard = asyncHandler(async (req, res) => {
  const flashcard = await Flashcard.findOne({
    id: req.params.id,
    userId: req.user.id
  });

  if (flashcard) {
    await flashcard.deleteOne();
    res.json({ message: 'Flashcard removed' });
  } else {
    res.status(404);
    throw new Error('Flashcard not found');
  }
});

// @desc    Get flashcards by JLPT level
// @route   GET /api/flashcards/jlpt/:level
// @access  Private
const getFlashcardsByJlpt = asyncHandler(async (req, res) => {
  const flashcards = await Flashcard.find({
    userId: req.user.id,
    jlpt: req.params.level
  });
  res.json(flashcards);
});

// @desc    Get flashcards by tag
// @route   GET /api/flashcards/tag/:tag
// @access  Private
const getFlashcardsByTag = asyncHandler(async (req, res) => {
  const flashcards = await Flashcard.find({
    userId: req.user.id,
    tags: req.params.tag
  });
  res.json(flashcards);
});

// @desc    Bulk create flashcards (for syncing)
// @route   POST /api/flashcards/bulk
// @access  Private
const bulkCreateFlashcards = asyncHandler(async (req, res) => {
  const flashcardsToCreate = req.body;
  
  // Add user ID to each flashcard
  const flashcardsWithUserId = flashcardsToCreate.map(flashcard => ({
    ...flashcard,
    userId: req.user.id
  }));
  
  try {
    // Use insertMany with ordered: false to continue even if some insertions fail
    const result = await Flashcard.insertMany(flashcardsWithUserId, { ordered: false });
    res.status(201).json({
      message: `${result.length} flashcards created successfully`,
      flashcards: result
    });
  } catch (error) {
    // Some insertions may fail due to duplicates, but we continue
    if (error.insertedDocs && error.insertedDocs.length > 0) {
      res.status(207).json({
        message: `${error.insertedDocs.length} flashcards created, some failed`,
        flashcards: error.insertedDocs
      });
    } else {
      res.status(400);
      throw new Error('No flashcards created');
    }
  }
});

module.exports = {
  getFlashcards,
  getFlashcardById,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getFlashcardsByJlpt,
  getFlashcardsByTag,
  bulkCreateFlashcards
};
