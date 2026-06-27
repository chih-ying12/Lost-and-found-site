// main.js - Deploy this to Back4App Cloud Code

// =============================================
// 1. Set up your email provider (e.g., SendGrid)
//    Replace with your own API key or SMTP config.
// =============================================
const sendgrid = require('sendgrid')('YOUR_SENDGRID_API_KEY'); // <-- Replace with your key
// Or use other email libraries. For testing, you can log the code.

// =============================================
// Cloud Function: sendVerificationCode
// =============================================
Parse.Cloud.define("sendVerificationCode", async (request) => {
  const email = request.params.email;
  
  // Validate email domain
  if (!email || !email.toLowerCase().endsWith('@school.edu.sg')) {
    throw new Error('Only @school.edu.sg emails are allowed.');
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Save code to a new class "EmailVerification"
  const EmailVerification = Parse.Object.extend("EmailVerification");
  const record = new EmailVerification();
  record.set("email", email);
  record.set("code", code);
  record.set("expiresAt", expiresAt);
  await record.save(null, { useMasterKey: true });

  // Send email (using SendGrid as example)
  const mailData = {
    to: email,
    from: 'noreply@yourdomain.com', // <-- Change to your verified sender
    subject: 'Your Lost & Found Verification Code',
    text: `Your verification code is: ${code}. It expires in 15 minutes.`
  };
  
  try {
    await sendgrid.send(mailData);
  } catch (emailError) {
    console.error('Email send failed:', emailError);
    // If email fails, we still return success? Better to let the user know.
    // For robust systems, delete the saved record if email fails.
    await record.destroy({ useMasterKey: true });
    throw new Error('Could not send email. Please check your email address.');
  }

  return { success: true, message: 'Code sent to your email.' };
});

// =============================================
// Cloud Function: verifyCode
// =============================================
Parse.Cloud.define("verifyCode", async (request) => {
  const email = request.params.email;
  const code = request.params.code;

  if (!email || !code) {
    throw new Error('Email and code are required.');
  }

  const query = new Parse.Query("EmailVerification");
  query.equalTo("email", email);
  query.equalTo("code", code);
  query.greaterThan("expiresAt", new Date()); // not expired

  const result = await query.first({ useMasterKey: true });
  if (!result) {
    throw new Error('Invalid or expired verification code.');
  }

  // Delete the record so it cannot be reused
  await result.destroy({ useMasterKey: true });

  return { success: true };
});
