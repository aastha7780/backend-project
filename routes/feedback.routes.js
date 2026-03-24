const router = require("express").Router();
const { createFeedback } = require("../controllers/feedback.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/create", verifyToken, createFeedback);

module.exports = router;