const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const url = require('url');
const fetch = require('node-fetch'); // For making API requests
const connectDB = require('./config/db');
require('dotenv').config();  // Load environment variables

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '.', 'public')));

// Session configuration
app.use(session({
  secret: 'yourSecretKey', // Use a more secure secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true for HTTPS
}));

// Set view engine and views directory
const templatePath = path.join(__dirname, 'views');
app.set('views', templatePath);
app.set('view engine', 'pug'); // Change 'ejs' to your desired template engine (e.g., 'hbs', 'pug')

// Middleware to check if the user is logged in
function checkAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Sample login route
app.post('/login', async (req, res) => {
  try {
    const user = await collection.findOne({ email: req.body.email });
    if (user && user.password === req.body.password) {
      req.session.isAuthenticated = true;
      req.session.userName = user.name;
      res.redirect('/userdashboard'); // Redirect to dashboard
    } else {
      res.render('error', { message: "Invalid email or password. Please try again." });
    }
  } catch (error) {
    res.render('error', { message: "An error occurred. Please try again later." });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Could not log out. Please try again.");
    }
    res.redirect('/login');
  });
});

// Protected route
app.get('/dashboard', checkAuth, (req, res) => {
  res.render("user/user", { userName: req.session.userName });
});

// Signup route
app.post("signup", async (req, res) => {
  try {
    const existingUser = await collection.findOne({ email: req.body.email });
    if (existingUser) {
      res.render("error", {
        statusCode: 409,
        message: "Email already exists. Please use another email."
      });
    } else {
      const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        income: req.body.income,
        age: req.body.age,
        phonenumber: req.body.phonenumber,
        occupation: req.body.occupation
      };
      await collection.insertMany([data]);
      res.render("success", { userName: req.body.name });
    }
  } catch (error) {
    res.render("error", {
      statusCode: 500,
      message: "An internal error occurred. Please try again later."
    });
  }
});

// News API route - Fetch news based on category or search query
app.get('/api/news', async (req, res) => {
  const { category = 'general', query = '' } = req.query;
  let url;

  // Construct the API URL based on query or category
  if (query) {
    url = `http://api.mediastack.com/v1/news?access_key=${process.env.API_KEY}&countries=in&keywords=${encodeURIComponent(query)}`;
  } else {
    url = `http://api.mediastack.com/v1/news?access_key=${process.env.API_KEY}&countries=in&categories=${category}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      return res.status(404).json({ error: 'No articles found' });
    }

    // Send back the articles array
    res.json(data.data); // Assuming articles are stored in 'data'
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// News page - Show news based on category
app.get('/news', checkAuth, async (req, res) => {
  const category = req.query.category || 'general'; // Default category
  const query = req.query.query || ''; // Default search query

  const url = query
    ? `http://api.mediastack.com/v1/news?access_key=${process.env.API_KEY}&countries=in&keywords=${encodeURIComponent(query)}`
    : `http://api.mediastack.com/v1/news?access_key=${process.env.API_KEY}&countries=in&categories=${category}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      return res.render('error', { message: 'No articles found' });
    }

    res.render('news', { articles: data.data, category });
  } catch (error) {
    res.render('error', { message: 'An error occurred while fetching news.' });
  }
});

// Routes for rendering pages
app.get("/", (req, res) => {
  res.render("home", {
    isAuthenticated: req.session.isAuthenticated || false,
    userName: req.session.userName || null,
  });
});

app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/services", (req, res) => res.render("services"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/aboutus", (req, res) => res.render("aboutus"));
app.get("/traceexpense", (req, res) => res.render("user/traceexpense.pug"));

// User dashboard
app.get('userdashboard', checkAuth, async (req, res) => {
  try {
    const user = await collection.findOne({ name: req.session.userName });
    if (user) {
      res.render('user/userdashboard', { user });
    } else {
      res.send("User not found");
    }
  } catch (error) {
    res.send("An error occurred. Please try again.");
  }
});

// General Middleware
app.use((req, res, next) => {
  try {
    res.render(url.parse(req.url, true).pathname.substring(1));
  } catch (error) {
    const err = new Error('Error rendering the page');
    err.status = 500;
    return next(err);
  }
});

// Error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).render('error', { error: err.message || 'An error occurred' });
});

// Use environment variable for port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port @http://localhost:${PORT}`));
