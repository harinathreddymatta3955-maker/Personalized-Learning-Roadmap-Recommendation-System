import type { IncomingMessage, ServerResponse } from 'http';
import nodemailer from 'nodemailer';

export async function handleSendOtpRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', (chunk: Buffer | string) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body || '{}');
      const { email, otp } = data;

      if (!email || !otp) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Email and OTP are required' }));
        return;
      }

      console.log(`[Email Service] Handling 6-digit OTP request for address: ${email}`);

      const host = process.env.SMTP_HOST || (process.env.SMTP_USER?.includes('@gmail.com') ? 'smtp.gmail.com' : '');
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const from = process.env.SMTP_FROM || (user ? `"CO-ENGINEER Security" <${user}>` : '"CO-ENGINEER" <no-reply@coengineer.local>');

      if (host && user && pass) {
        try {
          const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          });

          await transporter.sendMail({
            from,
            to: email,
            subject: 'Your CO-ENGINEER Verification Code',
            text: `Your password reset verification code is: ${otp}. This code is valid for 10 minutes.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">CO-ENGINEER Security Verification</h2>
                <p style="color: #475569; font-size: 14px; line-height: 1.5;">
                  We received a request to reset your password for your CO-ENGINEER account.
                </p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                  <div style="font-size: 12px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">One-Time Password (OTP)</div>
                  <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; font-family: monospace;">${otp}</div>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
                  This one-time passcode is strictly confidential and expires in <strong>10 minutes</strong>. Do not share this code with anyone.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 11px;">
                  If you did not request this code, you can safely ignore this email.
                </p>
              </div>
            `,
          });
          console.log(`[Email Service] OTP successfully delivered via SMTP to ${email}`);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            deliveredViaSmtp: true,
            senderEmail: user,
            otp,
            message: `Verification code successfully dispatched to ${email} from ${user}. Please check your inbox and spam folder.`
          }));
          return;
        } catch (sendErr: any) {
          console.error('[Email Service] SMTP dispatch failure:', sendErr);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            deliveredViaSmtp: false,
            smtpError: sendErr?.message || 'Failed to connect to SMTP server',
            otp,
            message: `SMTP delivery failed (${sendErr?.message || 'connection error'}). Fallback verification code provided for testing.`
          }));
          return;
        }
      } else {
        console.log(`[Email Service] Note: SMTP credentials not set in .env. Providing fallback OTP.`);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          deliveredViaSmtp: false,
          otp,
          message: `SMTP credentials are not configured in settings. To receive real emails in your inbox, configure SMTP_USER and SMTP_PASS.`
        }));
        return;
      }
    } catch (err: any) {
      console.error('[Email Service] Error in sendOtpHandler:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Failed to process OTP request.',
        details: err?.message
      }));
    }
  });
}

export function handleSmtpStatusRequest(req: IncomingMessage, res: ServerResponse) {
  const isConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const host = process.env.SMTP_HOST || (process.env.SMTP_USER?.includes('@gmail.com') ? 'smtp.gmail.com' : '');
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    configured: isConfigured,
    host: isConfigured ? host : null,
    user: isConfigured ? (process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***@***` : null) : null
  }));
}

