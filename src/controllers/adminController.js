import User from '../models/User.js';
import Vocabulary from '../models/Vocabulary.js';
import Project from '../models/Project.js';
import Portfolio from '../models/Portfolio.js';
import Contact from '../models/Contact.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const getAdminDashboard = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const [users, totalUsers, totalVocabulary, totalProjects] =
      await Promise.all([
        User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('username email')
          .lean(),
        User.countDocuments(),
        Vocabulary.countDocuments(),
        Project.countDocuments(),
      ]);

    return res.render('admin-dashboard', {
      currentUser,
      users,
      totalUsers,
      totalVocabulary,
      totalProjects,
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getUsersPage = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { search, page } = req.query;

    const searchQuery = search ? search.trim() : '';
    const pageNum = parseInt(page) || 1;
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    const queryObj = searchQuery
      ? { username: { $regex: searchQuery, $options: 'i' } }
      : {};

    const [users, totalUsers] = await Promise.all([
      User.find(queryObj)
        .sort({ role: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('username firstName lastName email role createdAt updatedAt')
        .lean(),
      User.countDocuments(queryObj),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return res.render('admin-users', {
      currentUser,
      users,
      totalUsers,
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

const getProjectsPage = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const { search, page } = req.query;

    const searchQuery = search ? search.trim() : '';

    const pageNum = parseInt(page) || 1;
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    const queryObj = searchQuery
      ? { title: { $regex: searchQuery, $options: 'i' } }
      : {};

    const [projects, totalProjects] = await Promise.all([
      Project.find(queryObj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'title tech description live github createdAt updatedAt imageUrl',
        )
        .lean(),
      Project.countDocuments(queryObj),
    ]);

    const totalPages = Math.ceil(totalProjects / limit);

    return res.status(200).render('admin-projects', {
      currentUser,
      projects,
      totalProjects,
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

const getDictionaryPage = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const { search, page } = req.query;

    const searchQuery = search ? search.trim() : '';

    const pageNum = parseInt(page) || 1;
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    const queryObj = searchQuery
      ? { word: { $regex: searchQuery, $options: 'i' } }
      : {};

    const [vocabularies, totalVocabularies] = await Promise.all([
      Vocabulary.find(queryObj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'word pronunciation partOfSpeech meaning examples createdBy createdAt updatedAt',
        )
        .populate('createdBy', 'username')
        .lean(),
      Vocabulary.countDocuments(queryObj),
    ]);

    const totalPages = Math.ceil(totalVocabularies / limit);

    const paginationRange = getPaginationRange(pageNum, totalPages);

    return res.render('admin-dictionary', {
      currentUser,
      vocabularies,
      totalVocabularies,
      totalPages,
      currentPage: pageNum,
      search: searchQuery,
      paginationRange,
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getUserVocabularies = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const userId = req.params.id;

    const user = await User.findById(userId).select('username').lean();

    if (!user) {
      return res.status(404).render('error', {
        message: 'User not found',
      });
    }

    const vocabularies = await Vocabulary.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.render('admin-user-vocabularies', {
      currentUser,
      user,
      vocabularies,
    });
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

    return res.render('update-profile', { currentUser: user });
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

    return res.redirect('/api/v1/admin/dashboard');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getCreateUserPage = async (req, res) => {
  try {
    const currentUser = req.session.user;

    return res.render('create-user.ejs', {
      currentUser,
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).render('create-user.ejs', {
        error: 'Username and password are required.',
        currentUser,
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).render('create-user.ejs', {
        error: 'Username already exists.',
        currentUser,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: req.newUserRole,
    });

    await newUser.save();

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { id } = req.params;
    const userById = await User.findById(id).lean();

    if (!userById) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    return res.render('user-detail', {
      currentUser,
      userById,
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { username, email, firstName, lastName } = req.body;
    const { id } = req.params;

    const existingUser = await User.findOne({ username, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).render('user-detail', {
        error: 'Username already exists.',
        currentUser,
        userById: await User.findById(id).lean(),
      });
    }
    const updateData = {
      username,
      email,
      firstName,
      lastName,
      role: req.updateUserRole,
    };

    await User.findByIdAndUpdate(id, updateData);

    return res.redirect('/api/v1/admin/users');
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
    const { id } = req.params;
    const userById = await User.findById(id).lean();
    if (!userById) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    return res.render('change-password', {
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
    const { newPassword } = req.body;
    const { id } = req.params;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(id, { password: hashedPassword });

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userToDelete = req.userToDelete;

    await userToDelete.deleteOne();

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, tech, description, live, github } = req.body;
    let imageUrl = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'projects',
      });
      imageUrl = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    await Project.create({
      title,
      tech,
      description,
      live,
      github,
      imageUrl: imageUrl,
    });

    return res.redirect('/api/v1/admin/projects');
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).render('error', {
      message: 'Failed to create project',
      error,
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).render('error', {
        message: 'Project not found.',
      });
    }

    return res.render('project-detail', {
      project,
      currentUser: req.session.user,
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tech, live, github, description } = req.body;

    const updateData = { title, tech, live, github };

    if (description) {
      updateData.description = description
        .split('\n')
        .map((d) => d.trim())
        .filter((d) => d);
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'projects',
      });
      updateData.imageUrl = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedProject) {
      return res.status(404).render('error', { message: 'Project not found' });
    }

    return res.redirect('/api/v1/admin/projects?success=true');
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).render('error', {
      message: 'Failed to update project',
      error,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).render('error', {
        message: 'Project not found',
        error: null,
      });
    }

    return res.redirect('/api/v1/admin/projects');
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

    return res.redirect('/api/v1/admin/dictionary');
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

    return res.render('vocabulary-detail', {
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

    return res.redirect('/api/v1/admin/dictionary');
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

    return res.redirect('/api/v1/admin/dictionary');
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

    return res.redirect('/api/v1/admin/dictionary');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getPortfolioData = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const portfolio = (await Portfolio.findOne({}).lean()) || {};

    return res.render('admin-portfolio', {
      currentUser,
      portfolio,
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const createPortfolioData = async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      education,
      email,
      phone,
      skillCategories,
      skillItems,
      interests,
      socialNames,
      socialUrls,
    } = req.body;

    let formattedSkills = [];
    if (skillCategories && skillItems) {
      const categories = Array.isArray(skillCategories)
        ? skillCategories
        : [skillCategories];
      const items = Array.isArray(skillItems) ? skillItems : [skillItems];

      formattedSkills = categories
        .map((cat, index) => ({
          category: cat ? cat.trim() : '',
          items: items[index]
            ? items[index]
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        }))
        .filter((s) => s.category);
    }

    const formattedInterests = interests
      ? interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    let formattedSocialLinks = [];
    if (socialNames && socialUrls) {
      const names = Array.isArray(socialNames) ? socialNames : [socialNames];
      const urls = Array.isArray(socialUrls) ? socialUrls : [socialUrls];

      formattedSocialLinks = names
        .map((sName, index) => ({
          name: sName ? sName.trim() : '',
          url: urls[index] ? urls[index].trim() : '',
        }))
        .filter((link) => link.name && link.url);
    }

    await Portfolio.create({
      about: {
        name,
        title,
        description,
        education,
      },
      contact: {
        email,
        phone,
        socialLinks: formattedSocialLinks,
      },
      skills: formattedSkills,
      interests: formattedInterests,
    });

    return res.redirect('/api/v1/admin/portfolio');
  } catch (error) {
    return res.status(500).send('Creation Error: ' + error.message);
  }
};

const getEditPortfolioPage = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({});
    res.render('edit-portfolio', {
      currentUser: req.session.user || req.user || { username: 'Admin' },
      portfolio: portfolio || {},
    });
  } catch (error) {
    res.status(500).send('Server Error: ' + error.message);
  }
};

const updatePortfolio = async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      education,
      email,
      phone,
      skillCategories,
      skillItems,
      interests,
      socialNames,
      socialUrls,
    } = req.body;

    let formattedSkills = [];
    if (skillCategories && skillItems) {
      const categories = Array.isArray(skillCategories)
        ? skillCategories
        : [skillCategories];
      const items = Array.isArray(skillItems) ? skillItems : [skillItems];

      formattedSkills = categories
        .map((cat, index) => ({
          category: cat ? cat.trim() : '',
          items: items[index]
            ? items[index]
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        }))
        .filter((s) => s.category);
    }

    const formattedInterests = interests
      ? interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    let formattedSocialLinks = [];
    if (socialNames && socialUrls) {
      const names = Array.isArray(socialNames) ? socialNames : [socialNames];
      const urls = Array.isArray(socialUrls) ? socialUrls : [socialUrls];

      formattedSocialLinks = names
        .map((sName, index) => ({
          name: sName ? sName.trim() : '',
          url: urls[index] ? urls[index].trim() : '',
        }))
        .filter((link) => link.name && link.url);
    }

    await Portfolio.findOneAndUpdate(
      {},
      {
        $set: {
          'about.name': name,
          'about.title': title,
          'about.description': description,
          'about.education': education,
          'contact.email': email,
          'contact.phone': phone,
          'contact.socialLinks': formattedSocialLinks,
          skills: formattedSkills,
          interests: formattedInterests,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    return res.redirect('/api/v1/admin/portfolio');
  } catch (error) {
    return res.status(500).send('Update Error: ' + error.message);
  }
};

const getAdminContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalMessages = await Contact.countDocuments({});
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await Contact.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render('admin-contact', {
      currentUser: req.session.user || req.user || { username: 'Admin' },
      messages,
      currentPage: page,
      totalPages,
      totalMessages,
    });
  } catch (error) {
    res.status(500).send('Server Error: ' + error.message);
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.redirect('/api/v1/admin/contact');
  } catch (error) {
    res.status(500).send('Delete Error: ' + error.message);
  }
};

const getPaginationRange = (currentPage, totalPages) => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }
  return rangeWithDots;
};

export default {
  getAdminDashboard,
  getUsersPage,
  getProjectsPage,
  getDictionaryPage,
  getProfilePage,
  updateProfile,
  getCreateUserPage,
  createUser,
  getUserById,
  updateUser,
  getChangePasswordPage,
  changePassword,
  deleteUser,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  createVocabulary,
  exportDictionary,
  getVocabById,
  updateVocab,
  deleteVocab,
  importVocab,
  getUserVocabularies,
  getPortfolioData,
  createPortfolioData,
  getEditPortfolioPage,
  updatePortfolio,
  getAdminContactMessages,
  deleteContactMessage,
  getPaginationRange,
};
