const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

const ADMIN_USERNAME = 'clearnetmoney';

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', status = 'all' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { walletAddress: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status === 'active') query.isActive = true;
    if (status === 'banned') query.isActive = false;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('username email walletAddress role isActive createdAt lastLogin totalPepetorEarned')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    if (user.username === ADMIN_USERNAME) {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban the admin user',
      });
    }
    
    user.isActive = false;
    await user.save();
    
    res.json({
      success: true,
      message: `User ${user.username} has been banned`,
      user: {
        id: user._id,
        username: user.username,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ban user',
      error: error.message,
    });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    user.isActive = true;
    await user.save();
    
    res.json({
      success: true,
      message: `User ${user.username} has been unbanned`,
      user: {
        id: user._id,
        username: user.username,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unban user',
      error: error.message,
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, admin, or moderator',
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    if (user.username === ADMIN_USERNAME && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change admin role for the primary admin',
      });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: `User ${user.username} role updated to ${role}`,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message,
    });
  }
};

exports.getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.find().sort({ key: 1 });
    
    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings',
      error: error.message,
    });
  }
};

exports.updateSystemSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'Value is required',
      });
    }
    
    const numericKeys = ['deployment_price_sol', 'transaction_fee_percent', 'market_creation_cost_sol', 'bonding_curve_graduation_threshold'];
    if (numericKeys.includes(key)) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return res.status(400).json({
          success: false,
          message: 'Value must be a positive number',
        });
      }
    }
    
    const setting = await SystemSettings.setSetting(
      key, 
      value, 
      description || '', 
      req.user.userId
    );
    
    res.json({
      success: true,
      message: `System setting ${key} updated successfully`,
      setting,
    });
  } catch (error) {
    console.error('Error updating system setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system setting',
      error: error.message,
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const bannedUsers = await User.countDocuments({ isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    const recentUsers = await User.find()
      .select('username createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const settings = await SystemSettings.find();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        bannedUsers,
        adminUsers,
      },
      recentUsers,
      currentSettings: settingsMap,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
};
