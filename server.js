const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage (can be replaced with database or file)
const applications = [];
const contacts = [];

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle Apply Now form
app.post('/apply', upload.single('resume'), (req, res) => {
  const { name, email, job, message } = req.body;
  const resume = req.file ? req.file.filename : null;

  if (!name || !email || !job || !message) {
    return res.status(400).send('Missing application data!');
  }

  applications.push({ name, email, job, message, resume });
  res.redirect('/application-success');
});

// Handle Contact Us form
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('Missing contact form data!');
  }

  contacts.push({ name, email, message });
  res.redirect('/contact-success');
});

// Success pages
app.get('/application-success', (req, res) => {
  res.send('<h1>Application Submitted Successfully!</h1><a href="/">Back to Home</a>');
});

app.get('/contact-success', (req, res) => {
  res.send('<h1>Thank you for contacting us!</h1><a href="/">Back to Home</a>');
});

// Applications Page
app.get('/applications', (req, res) => {
  let html = `
    <h1>Submitted Applications</h1>
    <ul>
      ${applications
        .map(
          (a) => `
        <li>
          <strong>Name:</strong> ${a.name}<br />
          <strong>Email:</strong> ${a.email}<br />
          <strong>Job:</strong> ${a.job}<br />
          <strong>Message:</strong> ${a.message}<br />
          <strong>Resume:</strong> ${a.resume || 'No File'}
        </li><hr>`
        )
        .join('')}
    </ul>
    <a href="/">← Back to Home</a>
  `;
  res.send(html);
});

// Contacts Page
app.get('/contacts', (req, res) => {
  let html = `
    <h1>Contact Submissions</h1>
    <ul>
      ${contacts
        .map(
          (c) => `
        <li>
          <strong>Name:</strong> ${c.name}<br />
          <strong>Email:</strong> ${c.email}<br />
          <strong>Message:</strong> ${c.message}
        </li><hr>`
        )
        .join('')}
    </ul>
    <a href="/">← Back to Home</a>
  `;
  res.send(html);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
