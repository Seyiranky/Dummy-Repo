const { User } = require('../models');

exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
};

const UPDATABLE_FIELDS = ['name', 'bio', 'locationLat', 'locationLng'];

exports.updateProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updates = {};
  for (const field of UPDATABLE_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  await user.update(updates);
  res.json(user);
};
