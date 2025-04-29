const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const generateTokens = async (user) => {
  const payload = {
    userId: user.userId
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });


  // await RefreshToken.create({
  //   userId: user.userId,
  //   token: refreshToken,
  //   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  // });

  return { accessToken, refreshToken };
};


module.exports = { generateAccessToken, generateRefreshToken, generateTokens};
