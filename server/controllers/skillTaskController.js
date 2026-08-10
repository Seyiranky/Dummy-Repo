const { SkillTask, UserSkill, Skill, User } = require('../models');
const { assignReviewer } = require('../services/skillVerificationService');

exports.submitTask = async (req, res) => {
  const { skillId, evidenceUrl, notes } = req.body;
  if (!skillId || !evidenceUrl) {
    return res.status(400).json({ message: 'skillId and evidenceUrl are required' });
  }

  const skill = await Skill.findByPk(skillId);
  if (!skill) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  const reviewer = await assignReviewer(req.user.id);
  if (!reviewer) {
    return res.status(503).json({ message: 'No mentor is available to review this task right now' });
  }

  const task = await SkillTask.create({
    workerId: req.user.id,
    skillId,
    reviewerId: reviewer.id,
    evidenceUrl,
    notes,
    status: 'pending',
  });

  res.status(201).json(task);
};

exports.reviewTask = async (req, res) => {
  const { decision, notes } = req.body;
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
  }

  const task = await SkillTask.findByPk(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Skill task not found' });
  }
  if (task.reviewerId !== req.user.id) {
    return res.status(403).json({ message: 'Only the assigned reviewer may review this task' });
  }
  if (task.status !== 'pending') {
    return res.status(409).json({ message: 'This task has already been reviewed' });
  }

  await task.update({
    status: decision,
    notes: notes ?? task.notes,
    reviewedAt: new Date(),
  });

  if (decision === 'approved') {
    const [userSkill] = await UserSkill.findOrCreate({
      where: { userId: task.workerId, skillId: task.skillId },
      defaults: { proficiencyLevel: 1, verificationStatus: 'verified' },
    });
    if (userSkill.verificationStatus !== 'verified') {
      await userSkill.update({ verificationStatus: 'verified' });
    }
  }

  res.json(task);
};

exports.listTasks = async (req, res) => {
  const where =
    req.user.role === 'mentor'
      ? { reviewerId: req.user.id }
      : req.user.role === 'admin'
        ? {}
        : { workerId: req.user.id };

  const tasks = await SkillTask.findAll({
    where,
    include: [
      { model: Skill, as: 'skill' },
      { model: User, as: 'worker' },
      { model: User, as: 'reviewer' },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(tasks);
};
