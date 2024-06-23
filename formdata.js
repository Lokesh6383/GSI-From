const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/submit-form', upload.single('resume'), (req, res) => {
    const { name, email, phone, designation, message } = req.body;
    const resume = req.file;

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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
