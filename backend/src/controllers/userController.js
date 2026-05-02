import User from '../models/User.js';

export const updateProfile = async (req, res, next) => {
  try {
    const fields = ['name', 'bio', 'location', 'availability', 'interests', 'avatarColor'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    const updated = await req.user.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};
