require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const validUrl = require('valid-url');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

let urlDatabase = {};
let idCounter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  if (!validUrl.isWebUri(originalUrl)) {
    return res.json({ error: 'invalid URL' });
  }
  const parsedUrl = new URL(originalUrl);
  dns.lookup(parsedUrl.hostname, (err, address, family) => {
    if (err) {
      return res.json({ error: 'invalid URL' });
    }
    const shortId = idCounter++;
    urlDatabase[shortId] = originalUrl;
    res.json({
      original_url: originalUrl,
      short_url: shortId
    });
  });
});
app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortId = req.params.shorturl;

  if (urlDatabase[shortId]) {
    res.redirect(urlDatabase[shortId]);
  } else {
    res.json({ error: 'No short URL found for this code' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
