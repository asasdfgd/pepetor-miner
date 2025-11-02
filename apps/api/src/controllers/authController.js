const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
    { expiresIn: '7d' } // Long-lived refresh token
  );

  return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;

    await user.save();

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Update user with refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key'
      );

      // Find user
      const user = await User.findById(decoded.id).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '15m' }
      );

      res.json({
        success: true,
        message: 'Access token refreshed',
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: error.message,
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id; // Set by auth middleware

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, { refreshToken: null });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message,
    });
  }
};