const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'smartsantosh1928@gmail.com',
    pass: 'nmszpjolcjeuveqc',
  },
});

const sendMail = (to, subject, templateName, emailData) => new Promise((resolve, reject) => {
  const templatePath = path.join(__dirname, '..', 'emailTemplates', `${templateName}.hbs`);
  const templateFile = fs.readFileSync(templatePath, 'utf8');
  // const templateFile = fs.readFileSync(`../emailTemplates/${templateName}.hbs`, 'utf8');
  const compiledTemplate = handlebars.compile(templateFile);
  const htmlToSend = compiledTemplate(emailData);

  const mailOptions = {
    from: 'smartsantosh1928@gmail.com',
    to,
    subject,
    html: htmlToSend,
  }

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
      reject(error);
      } else {
      resolve(info);
      }
  });
});

module.exports = sendMail 