const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, contactNumber, password } = req.body;

    if (!fullName || !email || !contactNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      contactNumber,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          contactNumber: user.contactNumber,
        },
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, email, contactNumber } = req.body;

    if (req.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this user",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email: email?.toLowerCase(),
        contactNumber,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("updateUserDetails error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getOneUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this user",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getOneUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserDetails,
  getOneUser,
};