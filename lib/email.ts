import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
export const emailTemplates = {
  verification: (verificationCode: string, role: string) => ({
    subject: "Verify Your Account - Intern Match",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Intern Match!</h2>
        <p>Thank you for registering as a ${role}. Please verify your email address using the code below:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${verificationCode}</h1>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">© 2024 Intern Match. All rights reserved.</p>
      </div>
    `,
  }),

  // Update the passwordReset template in lib/email.ts
  passwordReset: (resetToken: string) => ({
    subject: "Reset Your Password - Intern Match",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}" 
             style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset My Password
          </a>
        </div>
        
        <p><strong>This link will expire in 15 minutes.</strong></p>
        <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">© 2024 Intern Match. All rights reserved.</p>
      </div>
    `,
  }),

  welcome: (firstName: string, role: string) => ({
    subject: "Welcome to Intern Match!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${firstName}!</h2>
        <p>Your ${role} account has been successfully verified. You can now access all features of Intern Match.</p>
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #28a745; margin: 0;">What's next?</h3>
          <ul style="color: #333;">
            ${
              role === "student"
                ? `
              <li>Complete your profile</li>
              <li>Upload your resume</li>
              <li>Browse available internships</li>
              <li>Apply to positions that match your skills</li>
            `
                : `
              <li>Complete your company profile</li>
              <li>Post internship opportunities</li>
              <li>Review applications</li>
              <li>Connect with talented students</li>
            `
            }
          </ul>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">© 2024 Intern Match. All rights reserved.</p>
      </div>
    `,
  }),
};

// Email sending functions
export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
  role: string
): Promise<boolean> {
  // Check if email configuration is set up
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    !process.env.EMAIL_FROM
  ) {
    console.error(
      "Email configuration is missing. Required env vars: EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM"
    );
    return false;
  }

  const template = emailTemplates.verification(verificationCode, role);

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: template.subject,
    html: template.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully:", {
      messageId: info.messageId,
      to: email,
      code: verificationCode,
    });
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetCode: string
): Promise<boolean> {
  const template = emailTemplates.passwordReset(resetCode);

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: template.subject,
    html: template.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  role: string
): Promise<boolean> {
  const template = emailTemplates.welcome(firstName, role);

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: template.subject,
    html: template.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

// Generic email sender
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
