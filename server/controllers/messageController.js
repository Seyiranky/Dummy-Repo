const { Op } = require('sequelize');
const { Message, User } = require('../models');

exports.sendMessage = async (req, res) => {
  const { recipientId, body } = req.body;
  if (!recipientId || !body) {
    return res.status(400).json({ message: 'recipientId and body are required' });
  }
  if (recipientId === req.user.id) {
    return res.status(400).json({ message: 'Cannot send a message to yourself' });
  }

  const recipient = await User.findByPk(recipientId);
  if (!recipient) {
    return res.status(404).json({ message: 'Recipient not found' });
  }

  const senderRole = req.user.role;
  if (!['worker', 'mentor'].includes(senderRole) || !['worker', 'mentor'].includes(recipient.role)) {
    return res.status(403).json({ message: 'Mentorship messaging is limited to workers and mentors' });
  }

  const message = await Message.create({ senderId: req.user.id, recipientId, body });
  res.status(201).json(message);
};

exports.listMessages = async (req, res) => {
  const { recipientId } = req.query;
  if (!recipientId) {
    return res.status(400).json({ message: 'recipientId query parameter is required' });
  }

  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: req.user.id, recipientId },
        { senderId: recipientId, recipientId: req.user.id },
      ],
    },
    order: [['createdAt', 'ASC']],
  });

  res.json(messages);
};
