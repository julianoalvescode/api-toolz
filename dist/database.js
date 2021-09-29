"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.seedUserStore = seedUserStore;
exports.createRefreshToken = createRefreshToken;
exports.checkRefreshTokenIsValid = checkRefreshTokenIsValid;
exports.invalidateRefreshToken = invalidateRefreshToken;
exports.tokens = exports.users = void 0;

var _uuid = require("uuid");

const users = new Map();
exports.users = users;
const tokens = new Map();
exports.tokens = tokens;

function seedUserStore() {
  users.set('marcio.dias@edulabzz.com', {
    password: '123456',
    permissions: ['users.list', 'users.create', 'metrics.list', 'dashboard.view'],
    roles: ['administrator', 'student']
  });
  users.set('estagiario@edulabzz.com', {
    password: '123456',
    permissions: ['users.list', 'metrics.list'],
    roles: ['editor']
  });
}

function createRefreshToken(email) {
  const currentUserTokens = tokens.get(email) ?? [];
  const refreshToken = (0, _uuid.v4)();
  tokens.set(email, [...currentUserTokens, refreshToken]);
  return refreshToken;
}

function checkRefreshTokenIsValid(email, refreshToken) {
  const storedRefreshTokens = tokens.get(email) ?? [];
  return storedRefreshTokens.some(token => token === refreshToken);
}

function invalidateRefreshToken(email, refreshToken) {
  const storedRefreshTokens = tokens.get(email) ?? [];
  tokens.set(email, storedRefreshTokens.filter(token => token !== refreshToken));
}