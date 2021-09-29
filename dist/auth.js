"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateJwtAndRefreshToken = generateJwtAndRefreshToken;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _config = require("./config");

var _database = require("./database");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generateJwtAndRefreshToken(email, payload = {}) {
  const token = _jsonwebtoken.default.sign(payload, _config.auth.secret, {
    subject: email,
    expiresIn: 15 * 24 * 24 // 15 minutes

  });

  const refreshToken = (0, _database.createRefreshToken)(email);
  return {
    token,
    refreshToken
  };
}