const { Op, fn, col } = require('sequelize');
const { User, SkillTask } = require('../models');

exports.assignReviewer = async (workerId) => {
  const mentors = await User.findAll({ where: { role: 'mentor' } });
  if (mentors.length === 0) {
    return null;
  }

  const pendingCounts = await SkillTask.findAll({
    attributes: ['reviewerId', [fn('COUNT', col('id')), 'pendingCount']],
    where: { status: 'pending', reviewerId: { [Op.not]: null } },
    group: ['reviewerId'],
    raw: true,
  });
  const countByMentor = new Map(pendingCounts.map((row) => [row.reviewerId, Number(row.pendingCount)]));

  const eligible = mentors.filter((mentor) => mentor.id !== workerId);
  if (eligible.length === 0) {
    return null;
  }

  const loads = eligible.map((mentor) => countByMentor.get(mentor.id) || 0);
  const minLoad = Math.min(...loads);
  const leastBusy = eligible.filter((_, i) => loads[i] === minLoad);

  return leastBusy[Math.floor(Math.random() * leastBusy.length)];
};
