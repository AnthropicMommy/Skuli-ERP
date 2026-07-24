import { Resend } from "resend";

let resend: Resend;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const FROM = "Skuli <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://skuli.vercel.app";

export async function sendStaffInviteEmail({
  to,
  name,
  schoolName,
  staffId,
  token,
}: {
  to: string;
  name: string;
  schoolName: string;
  staffId: string;
  token: string;
}) {
  const inviteUrl = `${APP_URL}/invite/${token}`;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `You've been invited to ${schoolName} on Skuli`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px; color: #111;">
        <div style="text-align: center; margin-bottom: 32px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;">
            <path d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"/>
          </svg>
          <span style="font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Skuli</span>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Welcome to ${schoolName}</h1>
        <p style="font-size: 14px; color: #555; margin-bottom: 24px;">Hi ${name},</p>
        <p style="font-size: 14px; color: #555; margin-bottom: 24px;">You've been invited to join <strong>${schoolName}</strong> on Skuli.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #64748b; margin: 0 0 4px 0;">Your Staff ID</p>
          <p style="font-size: 18px; font-weight: 600; margin: 0; letter-spacing: 1px;">${staffId}</p>
        </div>
        <a href="${inviteUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">Set Up Your Account</a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">This link expires in 48 hours. If you didn't expect this invite, you can safely ignore this email.</p>
      </body>
      </html>
    `,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
  schoolName,
  role,
}: {
  to: string;
  name: string;
  schoolName: string;
  role: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Welcome to ${schoolName} on Skuli!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px; color: #111;">
        <div style="text-align: center; margin-bottom: 32px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;">
            <path d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"/>
          </svg>
          <span style="font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Skuli</span>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Welcome aboard, ${name}! 🎉</h1>
        <p style="font-size: 14px; color: #555; margin-bottom: 24px;">You're now part of <strong>${schoolName}</strong> on Skuli as a <strong>${role.replace(/_/g, " ").toLowerCase()}</strong>.</p>
        <p style="font-size: 14px; color: #555; margin-bottom: 24px;">You can now sign in to access your dashboard, manage classes, and more.</p>
        <a href="${APP_URL}/login" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">Go to Skuli</a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">If you have any questions, contact your school administrator.</p>
      </body>
      </html>
    `,
  });
}

export async function sendParentWelcomeEmail({
  to,
  parentName,
  studentName,
  schoolName,
}: {
  to: string;
  parentName: string;
  studentName: string;
  schoolName: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${studentName} has been enrolled at ${schoolName} on Skuli`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px; color: #111;">
        <div style="text-align: center; margin-bottom: 32px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;">
            <path d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"/>
          </svg>
          <span style="font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Skuli</span>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Your child has been enrolled</h1>
        <p style="font-size: 14px; color: #555; margin-bottom: 24px;">Hi ${parentName},</p>
        <p style="font-size: 14px; color: #555; margin-bottom: 24px;"><strong>${studentName}</strong> has been enrolled at <strong>${schoolName}</strong> on Skuli.</p>
        <p style="font-size: 14px; color: #555; margin-bottom: 24px;">You can now track their attendance, exam results, and more through the parent portal.</p>
        <a href="${APP_URL}/portal/login" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">Go to Parent Portal</a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">If you have any questions, contact ${schoolName} directly.</p>
      </body>
      </html>
    `,
  });
}
