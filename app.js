const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const checkOutRoutes = require("./routes/checkOut.routes");

const app = express();

// ✅ CORS FIX (IMPORTANT)
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local frontend
      "https://your-frontend.vercel.app", // Vercel
      "https://your-frontend.netlify.app" // Netlify
    ],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/checkout", checkOutRoutes);

// Test route
app.get("/", (req, res) => {
  res.status(200).send("Music Cart Backend Running");
});

module.exports = app;