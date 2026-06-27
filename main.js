// main.js – Deploy to Back4App
// Email credentials read from environment variables (set in Back4App Dashboard)

const nodemailer = require('nodemailer');

// ============================================================
// READ CREDENTIALS FROM ENVIRONMENT VARIABLES
//   Go to Back4App Dashboard → Cloud Code → Settings → Environment Variables
//   Add two variables:
//     EMAIL_USER = your-email@gmail.com
//     EMAIL_PASS = your-16-char-app-password
// ============================================================
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❌ Email environment variables not set!');
  // The functions will throw an error if used without config.
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// ============================================================
// sendVerificationCode
// ============================================================
Parse.Cloud.define("sendVerificationCode", async (request) => {
  const email = request.params.email;
  
  const allowedDomains = ["@students.edu.sg", "@moe.edu.sg"];
  if (!email || !allowedDomains.some(domain => email.toLowerCase().endsWith(domain))) {
    throw new Error('Only @students.edu.sg or @moe.edu.sg emails are allowed.');
  }

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email service not configured. Please contact the administrator.');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const EmailVerification = Parse.Object.extend("EmailVerification");
  const record = new EmailVerification();
  record.set("email", email);
  record.set("code", code);
  record.set("expiresAt", expiresAt);
  await record.save(null, { useMasterKey: true });

  try {
    await transporter.sendMail({
      from: `"Lost & Found" <${EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your Verification Code for Lost & Found',
      text: `Your code is: ${code}\nExpires in 15 minutes.`,
      html: `<p>Your code is: <strong>${code}</strong></p><p>Expires in <strong>15 minutes</strong>.</p>`
    });
  } catch (err) {
    await record.destroy({ useMasterKey: true });
    throw new Error('Failed to send email. Please try again.');
  }

  return { success: true };
});

// ============================================================
// verifyCode
// ============================================================
Parse.Cloud.define("verifyCode", async (request) => {
  const { email, code } = request.params;
  if (!email || !code) throw new Error('Email and code required.');
  const query = new Parse.Query("EmailVerification");
  query.equalTo("email", email);
  query.equalTo("code", code);
  query.greaterThan("expiresAt", new Date());
  const result = await query.first({ useMasterKey: true });
  if (!result) throw new Error('Invalid or expired code.');
  await result.destroy({ useMasterKey: true });
  return { success: true };
});

// ============================================================
// getAllUsers – returns all users (without sensitive data)
// ============================================================
Parse.Cloud.define("getAllUsers", async (request) => {
  const query = new Parse.Query(Parse.User);
  query.select(["username", "email", "ezlink", "createdAt", "updatedAt"]);
  const users = await query.find({ useMasterKey: true });
  return users.map(user => ({
    id: user.id,
    username: user.get("username"),
    email: user.get("email"),
    ezlink: user.get("ezlink"),
    createdAt: user.get("createdAt"),
    updatedAt: user.get("updatedAt")
  }));
});
