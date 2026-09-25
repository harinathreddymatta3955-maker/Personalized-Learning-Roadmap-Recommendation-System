import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = (
    process.env.SMTP_USER ||
    process.env.smtp_user ||
    process.env.SMTP_USERNAME ||
    process.env.smtp_username ||
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER
  )?.trim();

  const pass = (
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.smtp_pass ||
    process.env.smtp_password ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.EMAIL_PASS
  )?.trim();

  const hasUser = Boolean(user);
  const hasPass = Boolean(pass);
  const isConfigured = hasUser && hasPass;
  const host = process.env.SMTP_HOST || (user?.includes('@gmail.com') ? 'smtp.gmail.com' : '');

  return res.status(200).json({
    configured: isConfigured,
    hasSmtpUser: hasUser,
    hasSmtpPass: hasPass,
    host: isConfigured ? host : null,
    user: isConfigured && user ? `${user.slice(0, 3)}***@***` : null
  });
}
