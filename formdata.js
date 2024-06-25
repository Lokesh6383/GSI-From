const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const path = require('path');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Set up database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', 
  database: 'form_sub', 
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Validation function
const validateFormData = (data, file) => {
  const { name, email, phone, designation, message } = data;
  const errors = [];

  if (!name || typeof name !== 'string') errors.push('Name is required and must be a string.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email is required.');
  if (!phone || !/^\+?[0-9]{10,15}$/.test(phone)) errors.push('A valid phone number is required.');
  if (!designation || typeof designation !== 'string') errors.push('Designation is required and must be a string.');
  if (!message || typeof message !== 'string') errors.push('Message is required and must be a string.');
  if (!file) errors.push('Resume file is required.');

  return errors;
};

app.post('/submit-form', upload.single('resume'), (req, res) => {
  const { name, email, phone, designation, message } = req.body;
  const resume = req.file;

  const errors = validateFormData(req.body, resume);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Save form data to the database
  const resumePath = path.join(__dirname, resume.path);
  const query = 'INSERT INTO submissions (name, email, phone, designation, message, resume_path) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [name, email, phone, designation, message, resumePath], (err, result) => {
    if (err) {
      return res.status(500).send('Error saving to database');
    }

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: 'donlokesh24@gmail.com',
      subject: 'New Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nDesignation: ${designation}\nMessage: ${message}`,
      attachments: [
        {
          filename: resume.originalname,
          path: resume.path
        }
      ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send('Error sending email');
      }
      res.status(200).send('Form submitted successfully');
    });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
