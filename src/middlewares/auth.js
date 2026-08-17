import User from '../models/User.js';

const authSignin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(302).redirect('/api/v1/auth/signin');
  }
  next();
};

const checkSuperAdmin = (req, res, next) => {
  const currentUser = req.session.user;

  if (!currentUser || currentUser.role !== 0) {
    return res.status(403).render('error', {
      message: 'You do not have permission. Super Admin only.',
    });
  }

  next();
};

const checkAdmin = (req, res, next) => {
  const currentUser = req.session.user;

  if (!currentUser || (currentUser.role !== 0 && currentUser.role !== 1)) {
    return res.status(403).render('error', {
      message: 'You do not have permission. Admin or Super Admin only.',
    });
  }

  next();
};

const checkUser = (req, res, next) => {
  const currentUser = req.session.user;

  if (!currentUser || currentUser.role !== 2) {
    return res.status(403).render('error', {
      message: 'You do not have permission. User only.',
    });
  }

  next();
};

const checkGuest = (req, res, next) => {
  const currentUser = req.session.user;

  if (!currentUser || currentUser.role !== 3) {
    return res.status(403).render('error', {
      message: 'You do not have permission. Guest only.',
    });
  }

  next();
};

const assignCreateUserRole = (req, res, next) => {
  const currentUser = req.session.user;
  const { role: roleInput } = req.body;

  let role = 2;

  if (currentUser.role === 0) {
    role = roleInput;
  } else if (currentUser.role === 1 && [1, 2, 3].includes(Number(roleInput))) {
    role = roleInput;
  } else {
    return res.status(403).render('error', {
      message: 'You do not have permission to assign this role.',
    });
  }

  req.newUserRole = role;
  next();
};

const checkUpdateUserPermission = async (req, res, next) => {
  const currentUser = req.session.user;
  const { id } = req.params;

  try {
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    req.userToUpdate = userToUpdate;

    if (currentUser.role === 0) {
      return next();
    }

    if (currentUser.role === 1 && [2, 3].includes(userToUpdate.role)) {
      return next();
    }

    return res.status(403).render('error', {
      message: 'You do not have permission to update users.',
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const assignUpdateUserRole = (req, res, next) => {
  const currentUser = req.session.user;
  const { role: roleInput } = req.body;
  const userToUpdate = req.userToUpdate;

  let role = userToUpdate.role;

  if (currentUser.role === 0) {
    role = roleInput;
  } else if (currentUser.role === 1 && [1, 2, 3].includes(Number(roleInput))) {
    role = roleInput;
  }

  req.updateUserRole = role;
  next();
};

const checkChangePasswordPermission = async (req, res, next) => {
  const currentUser = req.session.user;
  const { id } = req.params;

  if (!id) {
    return next();
  }

  try {
    const userById = await User.findById(id);
    if (!userById) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    req.userById = userById;

    if (currentUser.role === 0) {
      return next();
    }

    if (currentUser.role === 1 && [2, 3].includes(userById.role)) {
      return next();
    }

    if (currentUser._id.toString() === userById._id.toString()) {
      return next();
    }

    return res.status(403).render('error', {
      message: 'You do not have permission to change password for this user.',
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const checkDeleteUserPermission = async (req, res, next) => {
  const currentUser = req.session.user;
  const { id } = req.params;

  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    req.userToDelete = userToDelete;

    if (currentUser.role === 0) {
      return next();
    }

    if (currentUser.role === 1 && [2, 3].includes(userToDelete.role)) {
      return next();
    }

    return res.status(403).render('error', {
      message: 'You do not have permission to delete this user.',
    });
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

export default {
  authSignin,
  checkSuperAdmin,
  checkAdmin,
  checkUser,
  checkGuest,
  assignCreateUserRole,
  checkUpdateUserPermission,
  assignUpdateUserRole,
  checkChangePasswordPermission,
  checkDeleteUserPermission,
};
