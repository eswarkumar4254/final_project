const express = require("express");
const router = express.Router();

// Home route
router.get("/", (req, res) => {
  res.render("home"); // Render the home view, ensure home.ejs or home.pug exists
});

// Error route (if needed)
router.get("/error", (req, res) => {
  res.render("error"); // Render the error view, ensure error.ejs or error.pug exists
});

module.exports = router;

