const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');
const { generateAccessToken, generateRefreshToken,generateTokens } = require('../utils/generateTokens');

const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully',user:user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
      userId: user.userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
        maxAge: 24 *60* 60 * 1000
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .status(200)
      .json({ message: 'Logged in successfully',user:user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const storedToken = await RefreshToken.findOne({ where: { token } });
    if (!storedToken) return res.sendStatus(403);

    const user = await User.findByPk(payload.userId);
    if (!user) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user);
    res
      .cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: false,
      })
      .status(200)
      .json({ message: 'Access token refreshed',user:user });
  } catch (err) {
    res.sendStatus(403);
  }
};

const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await RefreshToken.destroy({ where: { token } });
  }
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .status(200)
    .json({ message: 'Logged out successfully' });
};

module.exports = { register, login, refreshToken, logout };
