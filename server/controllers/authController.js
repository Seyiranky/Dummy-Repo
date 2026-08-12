const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const SALT_ROUNDS = 10;
const REGISTERABLE_ROLES = ['worker', 'client'];

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, and role are required' });
  }
  if (!REGISTERABLE_ROLES.includes(role)) {
    return res.status(400).json({ message: `role must be one of: ${REGISTERABLE_ROLES.join(', ')}` });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, role });

  const token = signToken(user);
  res.status(201).json({ token, userId: user.id, role: user.role });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user);
  res.json({ token, userId: user.id, role: user.role });
};

// Simulated Google sign-in: no real Google integration is wired up. The client
// collects a mock profile (name/email/role) from an in-app "account picker" and
// posts it here, which either logs into a matching existing account or
// provisions a new one — mirroring what a real OAuth callback would do.
exports.googleLogin = async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required' });
  }

  let user = await User.findOne({ where: { email } });
  let status = 200;

  if (!user) {
    if (!REGISTERABLE_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${REGISTERABLE_ROLES.join(', ')}` });
    }
    // Unusable random hash — this account has no password, only Google sign-in.
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), SALT_ROUNDS);
    user = await User.create({ name, email, passwordHash, role });
    status = 201;
  }

  const token = signToken(user);
  res.status(status).json({ token, userId: user.id, role: user.role });
};
