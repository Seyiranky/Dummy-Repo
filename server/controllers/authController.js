const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');

const SALT_ROUNDS = 10;
const REGISTERABLE_ROLES = ['worker', 'client'];
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Real Google sign-in: the client uses Google Identity Services to obtain a
// signed ID token (a JWT issued and signed by Google, not something the
// client can forge) and posts it here as `credential`. We verify it against
// Google's public keys before trusting the email/name it contains.
//
// New accounts need a role, which Google's token doesn't carry. If the email
// isn't registered yet and no `role` was sent, we respond with `needsRole`
// instead of a token; the client then re-submits the same credential plus a
// chosen role to finish provisioning the account.
exports.googleLogin = async (req, res) => {
  const { credential, role } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'credential is required' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Invalid Google credential' });
  }

  if (!payload?.email_verified) {
    return res.status(401).json({ message: 'Google account email is not verified' });
  }

  let user = await User.findOne({ where: { email: payload.email } });
  let status = 200;

  if (!user) {
    if (!role) {
      return res.status(200).json({ needsRole: true, name: payload.name, email: payload.email });
    }
    if (!REGISTERABLE_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${REGISTERABLE_ROLES.join(', ')}` });
    }
    // Unusable random hash — this account has no password, only Google sign-in.
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), SALT_ROUNDS);
    user = await User.create({ name: payload.name, email: payload.email, passwordHash, role });
    status = 201;
  }

  const token = signToken(user);
  res.status(status).json({ token, userId: user.id, role: user.role });
};
