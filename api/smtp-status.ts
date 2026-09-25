import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasUser = Boolean(process.env.SMTP_USER && process.env.SMTP_USER.trim());
  const hasPass = Boolean(process.env.SMTP_PASS && process.env.SMTP_PASS.trim());
  const isConfigured = hasUser && hasPass;
  const host = process.env.SMTP_HOST || (process.env.SMTP_USER?.includes('@gmail.com') ? 'smtp.gmail.com' : '');

  return res.status(200).json({
    configured: isConfigured,
    hasSmtpUser: hasUser,
    hasSmtpPass: hasPass,
    host: isConfigured ? host : null,
    user: isConfigured && process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***@***` : null
  });
}
