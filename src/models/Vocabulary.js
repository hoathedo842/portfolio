import mongoose from 'mongoose';

const vocabularySchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    pronunciation: {
      type: String,
      required: true,
      trim: true,
    },
    partOfSpeech: {
      type: String,
      required: true,
      enum: [
        'noun',
        'verb',
        'adjective',
        'adverb',
        'preposition',
        'conjunction',
        'interjection',
        'pronoun',
        'determiner',
      ],
    },
    meaning: {
      type: String,
      required: true,
      trim: true,
    },
    examples: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);
export default Vocabulary;
