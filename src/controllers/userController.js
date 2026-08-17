import Vocabulary from '../models/Vocabulary.js';
import User from '../models/User.js';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const getMyDashboard = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { search, page } = req.query;

    const searchQuery = search ? search.trim() : '';
    const pageNum = parseInt(page) || 1;
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    const queryObj = {
      createdBy: currentUser._id,
    };

    if (searchQuery) {
      queryObj.word = { $regex: searchQuery, $options: 'i' };
    }

    const [vocabularies, totalVocabularies] = await Promise.all([
      Vocabulary.find(queryObj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'word pronunciation partOfSpeech meaning examples createdAt updatedAt',
        )
        .lean(),
      Vocabulary.countDocuments(queryObj),
    ]);

    const totalPages = Math.ceil(totalVocabularies / limit);

    return res.render('users', {
      currentUser,
      vocabularies,
      totalVocabularies,
      totalPages,
      currentPage: pageNum,
      search: searchQuery,
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const createVocabulary = async (req, res) => {
  try {
    const { word, pronunciation, partOfSpeech, meaning, examples } = req.body;

    const newVocabulary = new Vocabulary({
      word,
      pronunciation,
      partOfSpeech,
      meaning,
      examples,
      createdBy: req.session.user._id,
    });

    await newVocabulary.save();

    return res.redirect('/api/v1/user/dashboard');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getProfilePage = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const user = await User.findById(currentUser._id).lean();

    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    return res.render('user-update-profile', { currentUser: user });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email, firstName, lastName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      { username, email, firstName, lastName },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    req.session.user = updatedUser;

    return res.redirect('/api/v1/user/dashboard');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const importVocab = async (req, res) => {
  try {
    const filePath = path.join(req.file.destination, req.file.filename);

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const posMap = {
      n: 'noun',
      v: 'verb',
      adj: 'adjective',
      adv: 'adverb',
      prep: 'preposition',
      conj: 'conjunction',
      interj: 'interjection',
      pron: 'pronoun',
      det: 'determiner',
    };

    const keyMap = {
      Word: 'word',
      Pronunciation: 'pronunciation',
      'Part Of Speech': 'partOfSpeech',
      Meaning: 'meaning',
      Examples: 'examples',
    };

    const normalizedData = data.map((item) => {
      const obj = {};
      for (let key in item) {
        const cleanKey = key.trim();
        if (keyMap[cleanKey]) {
          obj[keyMap[cleanKey]] = item[key];
        }
      }
      return obj;
    });

    const formattedData = normalizedData.map((item) => ({
      word: item.word ? item.word.trim().toLowerCase() : null,
      pronunciation: item.pronunciation ? item.pronunciation.trim() : null,
      partOfSpeech: item.partOfSpeech
        ? posMap[item.partOfSpeech.trim().toLowerCase()] ||
          item.partOfSpeech.trim().toLowerCase()
        : null,
      meaning: item.meaning ? item.meaning.trim() : null,
      examples: item.examples
        ? item.examples.split(',').map((e) => e.trim())
        : [],
      createdBy: req.session.user._id,
    }));

    const validData = formattedData.filter(
      (item) =>
        item.word && item.pronunciation && item.partOfSpeech && item.meaning,
    );

    if (validData.length > 0) {
      await Vocabulary.insertMany(validData);
    }

    fs.unlinkSync(filePath);

    return res.redirect('/api/v1/user/dashboard');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const exportDictionary = async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find({}).lean();

    const data = vocabularies.map((vocab) => ({
      Word: vocab.word,
      Pronunciation: vocab.pronunciation,
      'Part Of Speech': vocab.partOfSpeech,
      Meaning: vocab.meaning,
      Examples: Array.isArray(vocab.examples) ? vocab.examples.join(', ') : '',
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Dictionary');

    const excelBuffer = xlsx.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="dictionary_export.xlsx"',
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.send(excelBuffer);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

const getVocabById = async (req, res) => {
  try {
    const { id } = req.params;

    const vocabulary = await Vocabulary.findById(id);

    if (!vocabulary) {
      return res.status(404).render('error', {
        message: 'Vocabulary not found',
        error: null,
      });
    }

    return res.render('user-vocab-detail', {
      vocabulary,
      currentUser: req.session.user,
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const updateVocab = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, pronunciation, partOfSpeech, meaning, examples } = req.body;

    const updated = await Vocabulary.findByIdAndUpdate(
      id,
      {
        word,
        pronunciation,
        partOfSpeech,
        meaning,
        examples: examples
          .split('\n')
          .map((e) => e.trim())
          .filter((e) => e),
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).render('error', {
        message: 'Vocabulary not found',
        error: null,
      });
    }

    return res.redirect('/api/v1/user/dashboard');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const deleteVocab = async (req, res) => {
  try {
    const deleted = await Vocabulary.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).render('error', {
        message: 'Vocabulary not found',
        error: null,
      });
    }

    return res.redirect('/api/v1/user/dashboard');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getChangePasswordPage = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const userById = await User.findById(currentUser._id).lean();

    if (!userById) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    return res.render('user-change-password', {
      currentUser,
      userById,
    });
  } catch (err) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).render('user-change-password', {
        currentUser,
        error: 'Please enter old password and new password.',
      });
    }

    const user = await User.findById(currentUser._id);
    if (!user) {
      return res.status(404).render('error', { message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).render('user-change-password', {
        currentUser,
        error: 'Old password is incorrect.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.redirect('/api/v1/user/dashboard');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

export default {
  getMyDashboard,
  createVocabulary,
  getProfilePage,
  updateProfile,
  importVocab,
  exportDictionary,
  getVocabById,
  updateVocab,
  deleteVocab,
  getChangePasswordPage,
  changePassword,
};
