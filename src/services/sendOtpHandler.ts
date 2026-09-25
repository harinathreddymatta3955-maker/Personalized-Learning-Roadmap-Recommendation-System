import type { IncomingMessage, ServerResponse } from 'http';
import nodemailer from 'nodemailer';

export interface SendOtpResult {
  success: boolean;
  deliveredViaSmtp: boolean;
  senderEmail?: string;
  otp?: string;
  message: string;
  smtpError?: string;
}

/**
 * Direct function to dispatch OTP via SMTP using nodemailer.
 * Supports Gmail auto-configuration and sanitizes spaces in app passwords.
 */
export async function sendOtpDirect(email: string, otp: string): Promise<SendOtpResult> {
  const user = (
    process.env.SMTP_USER ||
    process.env.smtp_user ||
    process.env.SMTP_USERNAME ||
    process.env.smtp_username ||
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER
  )?.trim();

  const rawPass = (
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.smtp_pass ||
    process.env.smtp_password ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.EMAIL_PASS
  );
  const pass = rawPass ? rawPass.replace(/\s+/g, '').trim() : undefined;

  const host = (
    process.env.SMTP_HOST ||
    process.env.smtp_host ||
    (user?.includes('@gmail.com') ? 'smtp.gmail.com' : '')
  )?.trim();

  const port = Number(process.env.SMTP_PORT || process.env.smtp_port) || 587;
  const from = process.env.SMTP_FROM || (user ? `"CO-ENGINEER Security" <${user}>` : '"CO-ENGINEER" <no-reply@coengineer.local>');

  if (user && pass) {
    try {
      const isGmail = host === 'smtp.gmail.com' || user.includes('@gmail.com');
      
      const mailOptions = {
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
      };

      let sendError: any = null;

      // Primary attempt
      try {
        const primaryTransporter = isGmail
          ? nodemailer.createTransport({
              service: 'gmail',
              auth: { user, pass },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 15000,
            })
          : nodemailer.createTransport({
              host,
              port,
              secure: port === 465,
              auth: { user, pass },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 15000,
            });

        await primaryTransporter.sendMail(mailOptions);
        console.log(`[Email Service] OTP successfully delivered via SMTP to ${email}`);
      } catch (err: any) {
        sendError = err;
        console.warn('[Email Service] Primary SMTP attempt failed:', err?.message);

        // Fallback attempt for Gmail via port 587 STARTTLS
        if (isGmail) {
          try {
            console.log('[Email Service] Attempting fallback via smtp.gmail.com:587 STARTTLS...');
            const fallbackTransporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              requireTLS: true,
              auth: { user, pass },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 15000,
            });
            await fallbackTransporter.sendMail(mailOptions);
            sendError = null;
            console.log(`[Email Service] OTP successfully delivered via fallback port 587 to ${email}`);
          } catch (retryErr: any) {
            sendError = retryErr;
            console.error('[Email Service] Fallback SMTP attempt failed:', retryErr?.message);
          }
        }
      }

      if (sendError) {
        throw sendError;
      }

      return {
        success: true,
        deliveredViaSmtp: true,
        senderEmail: user,
        otp,
        message: `Verification code successfully dispatched to ${email} from ${user}. Please check your inbox and spam folder.`
      };
    } catch (sendErr: any) {
      console.error('[Email Service] SMTP dispatch failure:', sendErr);
      let descriptiveError = sendErr?.message || 'Failed to connect to SMTP server';
      if (descriptiveError.includes('535') || descriptiveError.includes('Username and Password not accepted')) {
        descriptiveError = 'Gmail authentication failed (535). Please verify that 2-Step Verification is active and you are using a 16-character Google App Password (not your personal account password).';
      } else if (descriptiveError.includes('ETIMEDOUT') || descriptiveError.includes('ESOCKET')) {
        descriptiveError = 'Connection to Gmail SMTP timed out. Check network restrictions or try again.';
      }

      return {
        success: true,
        deliveredViaSmtp: false,
        smtpError: descriptiveError,
        otp,
        message: `SMTP delivery failed (${descriptiveError}). Fallback verification code provided for testing.`
      };
    }
  } else {
    console.log('[Email Service] Note: SMTP credentials not configured in settings.');
    return {
      success: true,
      deliveredViaSmtp: false,
      otp,
      message: 'SMTP credentials are not configured in settings. To receive real emails in your inbox, configure SMTP_USER and SMTP_PASS.'
    };
  }
}

export async function handleSendOtpRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Handle case where body was already parsed (e.g. express.json())
  const expressBody = (req as any).body;
  if (expressBody && typeof expressBody === 'object' && Object.keys(expressBody).length > 0) {
    const { email, otp } = expressBody;
    if (!email || !otp) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Email and OTP are required' }));
      return;
    }
    const result = await sendOtpDirect(email, otp);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
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
      const result = await sendOtpDirect(email, otp);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result));
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


