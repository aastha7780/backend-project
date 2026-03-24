const Feedback = require("../models/feedback.model");

const createFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;
    const userId = req.user;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }

    const feedback = new Feedback({
      type,
      message,
      userId,
    });

    await feedback.save();

    return res.status(201).json({
      success: true,
      message: "Feedback successfully saved",
      feedback,
    });
  } catch (error) {
    console.error("createFeedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createFeedback,
};