const jwt = require('jsonwebtoken');

const SECURE_MODE = process.env.SECURE_MODE === 'true';
const DEFAULT_SECRET = 'dev-insecure-secret';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  if (SECURE_MODE && secret === DEFAULT_SECRET) {
    throw new Error('JWT_SECRET requerido cuando SECURE_MODE=true');
  }
  return secret;
}

function signAccessToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: SECURE_MODE ? process.env.JWT_EXPIRES_IN || '1d' : process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = { signAccessToken, verifyAccessToken };
