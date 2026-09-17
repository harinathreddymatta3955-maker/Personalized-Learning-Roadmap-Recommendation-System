import { auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export interface DispatchOtpResult {
  success: boolean;
  deliveredViaSmtp: boolean;
  message: string;
  fallbackOtp?: string;
  senderEmail?: string;
  smtpError?: string;
}

export async function checkSmtpStatus(): Promise<{ configured: boolean; host: string | null; user: string | null }> {
  try {
    const res = await fetch('/api/smtp-status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback if endpoint unavailable
  }
  return { configured: false, host: null, user: null };
}

/**
 * Dispatches a password reset OTP and reset request to the user's provided email.
 * 1. Posts to /api/send-otp which sends the 6-digit OTP via SMTP (if configured).
 * 2. Attempts Firebase Auth sendPasswordResetEmail to trigger official password reset email.
 * 3. Returns accurate delivery status so the UI can provide transparent testing codes if SMTP is not set.
 */
export async function dispatchOtpEmail(email: string, otp: string): Promise<DispatchOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  let deliveredViaSmtp = false;
  let smtpError: string | undefined;
  let serverMessage = '';
  let fallbackOtp: string | undefined = otp;

  let senderEmail: string | undefined;

  // 1. Send via backend API route
  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: cleanEmail, otp }),
    });

    if (res.ok) {
      const data = await res.json();
      deliveredViaSmtp = Boolean(data.deliveredViaSmtp);
      senderEmail = data.senderEmail;
      smtpError = data.smtpError;
      serverMessage = data.message || '';
      if (data.otp) {
        fallbackOtp = data.otp;
      }
    }
  } catch (err: any) {
    console.warn('[Email Dispatcher] Local API send-otp error:', err);
    smtpError = err?.message;
  }

  // 2. Also attempt Firebase Auth reset email if account is linked
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch {
    // Non-fatal if Firebase Auth email provider is restricted
  }

  if (deliveredViaSmtp) {
    return {
      success: true,
      deliveredViaSmtp: true,
      senderEmail,
      fallbackOtp,
      message: `Verification code successfully dispatched to ${cleanEmail}. Please check your inbox and spam folder.`,
    };
  }

  return {
    success: true,
    deliveredViaSmtp: false,
    senderEmail,
    smtpError,
    fallbackOtp,
    message: serverMessage || `SMTP Mail server is not configured in settings. For testing, your verification code is ready.`,
  };
}

