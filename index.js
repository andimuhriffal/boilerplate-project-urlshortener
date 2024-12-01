require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const validUrl = require('valid-url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

// In-memory storage for URLs
let urlDatabase = {};
let idCounter = 1;

// Serve the homepage
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Basic API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST request to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate the URL format
  if (!validUrl.isWebUri(originalUrl)) {
    return res.json({ error: 'invalid URL' });
  }

  // Extract the domain and check if it exists using DNS
  const parsedUrl = new URL(originalUrl);
  dns.lookup(parsedUrl.hostname, (err, address, family) => {
    if (err) {
      return res.json({ error: 'invalid URL' });
    }

    // Generate a unique ID for the shortened URL
    const shortId = idCounter++;
    urlDatabase[shortId] = originalUrl;

    // Respond with the shortened URL
    res.json({
      original_url: originalUrl,
      short_url: shortId
    });
  });
});

// GET request to redirect using the shortened URL
app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortId = req.params.shorturl;

  if (urlDatabase[shortId]) {
    res.redirect(urlDatabase[shortId]);
  } else {
    res.json({ error: 'No short URL found for this code' });
  }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
