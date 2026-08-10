const { Op } = require('sequelize');
const { Gig, User, Skill, UserSkill } = require('../models');
const { rankCandidates } = require('../services/matchingService');

const GIG_INCLUDES = [
  { model: User, as: 'client' },
  { model: Skill, as: 'skill' },
];

exports.createGig = async (req, res) => {
  const { title, description, budget, skillId, locationLat, locationLng } = req.body;
  if (!title || !description || budget === undefined || !skillId || locationLat === undefined || locationLng === undefined) {
    return res.status(400).json({
      message: 'title, description, budget, skillId, locationLat, and locationLng are required',
    });
  }

  const skill = await Skill.findByPk(skillId);
  if (!skill) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  const gig = await Gig.create({
    clientId: req.user.id,
    title,
    description,
    budget,
    skillId,
    locationLat,
    locationLng,
  });

  res.status(201).json(gig);
};

exports.listGigs = async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.skillId) where.skillId = req.query.skillId;

  const gigs = await Gig.findAll({ where, include: GIG_INCLUDES, order: [['createdAt', 'DESC']] });
  res.json(gigs);
};

exports.getGig = async (req, res) => {
  const gig = await Gig.findByPk(req.params.id, { include: GIG_INCLUDES });
  if (!gig) {
    return res.status(404).json({ message: 'Gig not found' });
  }
  res.json(gig);
};

exports.getCandidates = async (req, res) => {
  const gig = await Gig.findByPk(req.params.id);
  if (!gig) {
    return res.status(404).json({ message: 'Gig not found' });
  }

  const verifiedWorkers = await User.findAll({
    where: { role: 'worker', locationLat: { [Op.not]: null }, locationLng: { [Op.not]: null } },
    include: [
      {
        model: UserSkill,
        as: 'userSkills',
        where: { skillId: gig.skillId, verificationStatus: 'verified' },
        required: true,
      },
    ],
  });

  const ranked = rankCandidates(gig, verifiedWorkers).map(({ worker, distanceKm, score }) => ({
    workerId: worker.id,
    name: worker.name,
    trustScore: worker.trustScore,
    distanceKm: Math.round(distanceKm * 100) / 100,
    score: Math.round(score * 1000) / 1000,
  }));

  res.json(ranked);
};

const UPDATABLE_FIELDS = ['title', 'description', 'budget', 'locationLat', 'locationLng', 'status'];

exports.updateGig = async (req, res) => {
  const gig = await Gig.findByPk(req.params.id);
  if (!gig) {
    return res.status(404).json({ message: 'Gig not found' });
  }
  if (gig.clientId !== req.user.id) {
    return res.status(403).json({ message: 'Only the posting client may update this gig' });
  }

  const updates = {};
  for (const field of UPDATABLE_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  await gig.update(updates);
  res.json(gig);
};
