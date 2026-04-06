// controller/userController.js
import User from '../model/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users (Admin & Agent can view, Visitor cannot)
// @route   GET /api/users
// @access  Admin, Agent
export const getUsers = async (req, res) => {
  try {
    // Check if user has access (Admin or Agent)
    if (req.user.role === 'visitor') {
      return res.status(403).json({ 
        message: 'Access denied. Visitors cannot view users.' 
      });
    }

    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Admin, Agent
export const getUserById = async (req, res) => {
  try {
    // Check if user has access (Admin or Agent)
    if (req.user.role === 'visitor') {
      return res.status(403).json({ 
        message: 'Access denied. Visitors cannot view user details.' 
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new user (Only Admin)
// @route   POST /api/users
// @access  Admin only
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user is Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only admins can create users.' 
      });
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role: role || 'visitor' });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update user (Only Admin)
// @route   PUT /api/users/:id
// @access  Admin only


// @desc    Delete user (Only Admin)
// @route   DELETE /api/users/:id
// @access  Admin only
export const deleteUser = async (req, res) => {
  try {
    // Check if user is Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only admins can delete users.' 
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.deleteOne();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private (any logged in user)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const getCounsellors = async (req, res) => {
  try {
    // Check if user has access (Admin or Agent)
    if (req.user.role === 'visitor') {
      return res.status(403).json({ 
        message: 'Access denied. Visitors cannot view counsellors.' 
      });
    }

    // Find users with role 'agent' and department 'counselling'
    const counsellors = await User.find({ 
      role: 'agent',
      isActive: true
    }).select('name email phone department specialization');

    res.status(200).json(counsellors);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update current user's own profile
// @route   PUT /api/users/me
// @access  Private
// controller/userController.js - FIXED updateUser
// controller/userController.js - FIXED updateUser
export const updateUser = async (req, res) => {
  const { name, email, role, password } = req.body;

  try {
    // Check if user is Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only admins can update users.' 
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    
    // FIXED: Only update role if it's a valid enum value
    if (role && ['admin', 'agent', 'viewer'].includes(role)) {
      user.role = role;
    } else if (role && role === 'visitor') {
      // Map 'visitor' from frontend to 'viewer' in backend
      user.role = 'viewer';
    }
    
    // FIXED: Only update password if provided and valid
    if (password && password.trim().length > 0) {
      // Set password directly - pre('save') middleware will hash it
      user.password = password;
    }

    // Save the user (triggers pre('save') middleware)
    await user.save();

    // Return user without password
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
// FIXED updateCurrentUser
export const updateCurrentUser = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (password) {
      // DON'T hash here! Just set the raw password
      user.password = password;
    }

    await user.save(); // pre('save') middleware handles hashing

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};