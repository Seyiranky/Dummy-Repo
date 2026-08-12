const { User, Gig, Skill, Notification } = require('../models');

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

exports.reviewGig = async (req, res) => {
  const { decision } = req.body;
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
  }

  const gig = await Gig.findByPk(req.params.id);
  if (!gig) {
    return res.status(404).json({ message: 'Gig not found' });
  }
  if (gig.status !== 'pending_review') {
    return res.status(409).json({ message: 'This gig has already been reviewed' });
  }

  await gig.update({ status: decision === 'approved' ? 'open' : 'rejected' });

  await Notification.create({
    userId: gig.clientId,
    title: decision === 'approved' ? 'Gig approved' : 'Gig rejected',
    body:
      decision === 'approved'
        ? `Your gig "${gig.title}" was approved and is now live for workers to apply to.`
        : `Your gig "${gig.title}" was rejected.`,
  });

  res.json(gig);
};

exports.moderateUser = async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};
