import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const getSigninPage = (req, res) => {
  return res.render('signin');
};

const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render('signin.ejs', {
        error: 'Username and password are required.',
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    req.session.user = {
      _id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    if (user.role === 0 || user.role === 1) {
      return res.redirect('/api/v1/admin/dashboard');
    } else {
      return res.redirect('/api/v1/user/dashboard');
    }
  } catch (error) {
    return res.status(500).render('signin.ejs', {
      error: 'Internal server error. Please try again.',
    });
  }
};

const signOut = (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie('connect.sid');
    res.redirect('/api/v1/auth/signin');
  });
};

const getSignUpPage = (req, res) => {
  try {
    return res.render('signup');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const signUp = async (req, res) => {
  try {
    const { username, password, confirmPassword, email } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.render('signup', {
        message: 'Username already exists.',
      });
    }

    if (password !== confirmPassword) {
      return res.render('signup', {
        message: 'Passwords do not match.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 2,
    });

    await newUser.save();

    return res.redirect('/api/v1/auth/signin');
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal server error',
      error,
    });
  }
};

export default {
  getSigninPage,
  signIn,
  signOut,
  getSignUpPage,
  signUp,
};
