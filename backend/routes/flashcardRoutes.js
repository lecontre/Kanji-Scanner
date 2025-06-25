const express = require('express');
const router = express.Router();
const {
  getFlashcards,
  getFlashcardById,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getFlashcardsByJlpt,
  getFlashcardsByTag,
  bulkCreateFlashcards
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFlashcards)
  .post(protect, createFlashcard);

router.route('/bulk')
  .post(protect, bulkCreateFlashcards);

router.route('/jlpt/:level')
  .get(protect, getFlashcardsByJlpt);

router.route('/tag/:tag')
  .get(protect, getFlashcardsByTag);

router.route('/:id')
  .get(protect, getFlashcardById)
  .put(protect, updateFlashcard)
  .delete(protect, deleteFlashcard);

module.exports = router;
