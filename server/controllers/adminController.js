const { User, Gig, Skill } = require('../models');

exports.listUsers = async (req, res) => {
  const users = await User.findAll({ order: [['createdAt', 'DESC']] });
  res.json(users);
};

exports.listGigs = async (req, res) => {
  const gigs = await Gig.findAll({
    include: [
      { model: User, as: 'client' },
      { model: Skill, as: 'skill' },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(gigs);
};

exports.listFlagged = async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

exports.moderateGig = async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

exports.moderateUser = async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};
