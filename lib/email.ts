import nodemailer from "nodemailer";

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send verification email for registration
export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
  role: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@internmatch.com",
      to: email,
      subject: "Verify Your InternMatch Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">InternMatch</h1>
            <p style="color: #6b7280; margin: 5px 0;">Welcome to the future of internship matching</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for signing up as a ${role}! To complete your registration, please verify your email address using the code below:
            </p>
            
            <div style="background: white; border: 2px dashed #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                ${verificationCode}
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              This code will expire in 24 hours. If you didn't create this account, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 InternMatch. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

// Send welcome email after verification
export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const isStudent = role === "student";
    const welcomeMessage = isStudent
      ? "You're all set to discover amazing internship opportunities!"
      : "You're ready to find the perfect interns for your company!";

    const nextSteps = isStudent
      ? `
        <li>Complete your profile with skills and experiences</li>
        <li>Upload your resume for better matching</li>
        <li>Browse and apply to internship opportunities</li>
        <li>Track your application status</li>
      `
      : `
        <li>Set up your company profile</li>
        <li>Post your first internship opportunity</li>
        <li>Review and manage applications</li>
        <li>Connect with talented students</li>
      `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@internmatch.com",
      to: email,
      subject: `Welcome to InternMatch, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">🎉 Welcome to InternMatch!</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; color: white; margin: 20px 0;">
            <h2 style="margin-top: 0; color: white;">Hello ${name}!</h2>
            <p style="font-size: 18px; margin-bottom: 0; opacity: 0.95;">
              ${welcomeMessage}
            </p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Get Started:</h3>
            <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
              ${nextSteps}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Need help? Reply to this email or visit our help center.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © 2024 InternMatch. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@internmatch.com",
      to: email,
      subject: "Reset Your InternMatch Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">InternMatch</h1>
            <p style="color: #6b7280; margin: 5px 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 25px; margin: 20px 0;">
            <h2 style="color: #dc2626; margin-top: 0;">🔐 Password Reset</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              You requested a password reset for your InternMatch account. Use the verification code below to reset your password:
            </p>
            
            <div style="background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <div style="font-size: 28px; font-weight: bold; color: #dc2626; letter-spacing: 3px; font-family: 'Courier New', monospace;">
                ${resetCode}
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                ⚠️ <strong>Important:</strong> This code will expire in 15 minutes for security reasons.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Need help? Contact our support team.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © 2024 InternMatch. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// Email configuration validation
export function validateEmailConfig(): boolean {
  const requiredEnvVars = [
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      return false;
    }
  }

  return true;
}

// Send application notification to company when student applies
export async function sendApplicationNotificationToCompany(
  companyEmail: string,
  companyName: string,
  studentName: string,
  jobTitle: string,
  jobId: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@internmatch.com",
      to: companyEmail,
      subject: `New Application for ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">InternMatch</h1>
            <p style="color: #6b7280; margin: 5px 0;">New Application Received</p>
          </div>
          
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 25px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">🎉 New Application!</h2>
            <p style="color: #1e3a8a; line-height: 1.6; font-size: 16px;">
              You have received a new application for the position of <strong>${jobTitle}</strong>.
            </p>
            
            <div style="background: white; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <div style="margin-bottom: 15px;">
                <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 5px;">Applicant Name:</span>
                <span style="color: #1f2937; font-size: 18px; font-weight: 600;">${studentName}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 5px;">Position:</span>
                <span style="color: #1f2937; font-size: 16px;">${jobTitle}</span>
              </div>
              
              <div>
                <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 5px;">Company:</span>
                <span style="color: #1f2937; font-size: 16px;">${companyName}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/dashboard/jobs/${jobId}/candidates" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Application
            </a>
          </div>
          
          <div style="background: #f9fafb; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              💡 <strong>Tip:</strong> Review the application promptly to ensure you don't miss out on great candidates!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification. Please log in to your dashboard to manage applications.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © 2024 InternMatch. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send application notification to company:", error);
    return false;
  }
}

// Send acceptance email to student (for hired/shortlisted/interviewed status)
export async function sendApplicationAcceptanceEmail(
  studentEmail: string,
  studentName: string,
  companyName: string,
  jobTitle: string,
  status: "shortlisted" | "interviewed" | "hired",
  jobId?: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const statusMessages: Record<
      string,
      { title: string; message: string; color: string; emoji: string }
    > = {
      shortlisted: {
        title: "You've Been Shortlisted! 🎉",
        message:
          "Congratulations! Your application has been shortlisted. The company is interested in learning more about you.",
        color: "#f59e0b",
        emoji: "⭐",
      },
      interviewed: {
        title: "Interview Scheduled! 📅",
        message:
          "Great news! The company wants to interview you. Prepare yourself for this exciting opportunity.",
        color: "#8b5cf6",
        emoji: "🤝",
      },
      hired: {
        title: "Congratulations! You're Hired! 🎊",
        message:
          "Amazing news! The company has selected you for the position. Welcome to your new role!",
        color: "#10b981",
        emoji: "🎉",
      },
    };

    const statusInfo = statusMessages[status];
    const nextSteps =
      status === "hired"
        ? `
        <li>Check your email for onboarding details</li>
        <li>Review the job requirements and expectations</li>
        <li>Prepare for your first day</li>
        <li>Connect with your new team members</li>
      `
        : status === "interviewed"
          ? `
        <li>Review the job description and company profile</li>
        <li>Prepare answers to common interview questions</li>
        <li>Research the company and its values</li>
        <li>Prepare questions to ask the interviewer</li>
      `
          : `
        <li>Review your application and resume</li>
        <li>Prepare for potential interview questions</li>
        <li>Research the company in detail</li>
        <li>Stay updated on your application status</li>
      `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@internmatch.com",
      to: studentEmail,
      subject: statusInfo.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">InternMatch</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, ${statusInfo.color}15 0%, ${statusInfo.color}05 100%); border: 2px solid ${statusInfo.color}; border-radius: 12px; padding: 30px; margin: 20px 0;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 48px; margin-bottom: 10px;">${statusInfo.emoji}</div>
              <h2 style="color: ${statusInfo.color}; margin: 0;">${statusInfo.title}</h2>
            </div>
            
            <p style="color: #1f2937; font-size: 18px; line-height: 1.6; text-align: center; margin-bottom: 25px;">
              Hello ${studentName}!
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; text-align: center;">
              ${statusInfo.message}
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <div style="margin-bottom: 15px;">
                <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 5px;">Position:</span>
                <span style="color: #1f2937; font-size: 18px; font-weight: 600;">${jobTitle}</span>
              </div>
              
              <div>
                <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 5px;">Company:</span>
                <span style="color: #1f2937; font-size: 16px;">${companyName}</span>
              </div>
            </div>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Next Steps:</h3>
            <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
              ${nextSteps}
            </ul>
          </div>
          
          ${
            jobId
              ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/dashboard/jobs/${jobId}" 
               style="background: ${statusInfo.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Job Details
            </a>
          </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              We're here to support you on your internship journey. Good luck!
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © 2024 InternMatch. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send acceptance email to student:", error);
    return false;
  }
}

// Send rejection email to student
export async function sendApplicationRejectionEmail(
  studentEmail: string,
  studentName: string,
  companyName: string,
  jobTitle: string,
  _jobId?: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@internmatch.com",
      to: studentEmail,
      subject: `Update on Your Application for ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">InternMatch</h1>
            <p style="color: #6b7280; margin: 5px 0;">Application Update</p>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 25px; margin: 20px 0;">
            <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
              Hello ${studentName},
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              After careful consideration, we regret to inform you that we have decided to move forward with other candidates for this position.
            </p>
            
            <div style="background: white; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <div style="margin-bottom: 15px;">
                <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 5px;">Position:</span>
                <span style="color: #1f2937; font-size: 16px;">${jobTitle}</span>
              </div>
              
              <div>
                <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 5px;">Company:</span>
                <span style="color: #1f2937; font-size: 16px;">${companyName}</span>
              </div>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin-top: 20px;">
              We appreciate the time and effort you invested in your application. Don't be discouraged—this is just one opportunity, and many others await you!
            </p>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 25px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">💪 Keep Going!</h3>
            <ul style="color: #0c4a6e; line-height: 1.8; padding-left: 20px; margin-bottom: 0;">
              <li>Continue exploring other opportunities on InternMatch</li>
              <li>Refine your resume and cover letter based on feedback</li>
              <li>Build your skills through projects and learning</li>
              <li>Stay positive and persistent—your perfect match is out there!</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/dashboard/jobs" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Browse More Jobs
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              We're here to support your internship journey. Keep applying and don't give up!
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © 2024 InternMatch. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send rejection email to student:", error);
    return false;
  }
}

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email server connection verified successfully");
    return true;
  } catch (error) {
    console.error("Email server connection failed:", error);
    return false;
  }
}
