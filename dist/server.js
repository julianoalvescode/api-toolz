"use strict";

var _cors = _interopRequireDefault(require("cors"));

var _express = _interopRequireDefault(require("express"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _jwtDecode = _interopRequireDefault(require("jwt-decode"));

var _auth = require("./auth");

var _config = require("./config");

var _database = require("./database");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
app.use(_express.default.json());
app.use((0, _cors.default)());
(0, _database.seedUserStore)();

function checkAuthMiddleware(request, response, next) {
  const {
    authorization
  } = request.headers;

  if (!authorization) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token not present."
    });
  }

  const [, token] = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ");

  if (!token) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token not present."
    });
  }

  try {
    const decoded = _jsonwebtoken.default.verify(token, _config.auth.secret);

    request.user = decoded.sub;
    return next();
  } catch (err) {
    return response.status(401).json({
      error: true,
      code: "token.expired",
      message: "Token invalid."
    });
  }
}

function addUserInformationToRequest(request, response, next) {
  const {
    authorization
  } = request.headers;

  if (!authorization) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token not present."
    });
  }

  const [, token] = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ");

  if (!token) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token not present."
    });
  }

  try {
    const decoded = (0, _jwtDecode.default)(token);
    request.user = decoded.sub;
    return next();
  } catch (err) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Invalid token format."
    });
  }
}

app.post("/sessions", (request, response) => {
  const {
    email,
    password
  } = request.body;

  const user = _database.users.get(email);

  if (!user || password !== user.password) {
    return response.status(401).json({
      error: true,
      message: "E-mail or password incorrect."
    });
  }

  const {
    token,
    refreshToken
  } = (0, _auth.generateJwtAndRefreshToken)(email, {
    permissions: user.permissions,
    roles: user.roles
  });
  return response.json({
    token,
    refreshToken,
    permissions: user.permissions,
    roles: user.roles
  });
});
app.post("/refresh", addUserInformationToRequest, (request, response) => {
  const email = request.user;
  const {
    refreshToken
  } = request.body;

  const user = _database.users.get(email);

  if (!user) {
    return response.status(401).json({
      error: true,
      message: "User not found."
    });
  }

  if (!refreshToken) {
    return response.status(401).json({
      error: true,
      message: "Refresh token is required."
    });
  }

  const isValidRefreshToken = (0, _database.checkRefreshTokenIsValid)(email, refreshToken);

  if (!isValidRefreshToken) {
    return response.status(401).json({
      error: true,
      message: "Refresh token is invalid."
    });
  }

  (0, _database.invalidateRefreshToken)(email, refreshToken);
  const {
    token,
    refreshToken: newRefreshToken
  } = (0, _auth.generateJwtAndRefreshToken)(email, {
    permissions: user.permissions,
    roles: user.roles
  });
  return response.json({
    token,
    refreshToken: newRefreshToken,
    permissions: user.permissions,
    roles: user.roles
  });
});
app.get("/", (request, response) => {
  response.json({
    message: "API is running 😎"
  });
});
app.get("/me", checkAuthMiddleware, (request, response) => {
  const email = request.user;

  const user = _database.users.get(email);

  if (!user) {
    return response.status(400).json({
      error: true,
      message: "User not found."
    });
  }

  return response.json({
    email,
    permissions: user.permissions,
    roles: user.roles
  });
});
const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`API is running 👏: https://localhost:${port}`);
});