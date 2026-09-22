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

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      deliveredViaSmtp = Boolean(data.deliveredViaSmtp);
      senderEmail = data.senderEmail;
      smtpError = data.smtpError || (res.ok ? undefined : (data.error || `HTTP ${res.status}`));
      serverMessage = data.message || data.error || '';
      if (data.otp) {
        fallbackOtp = data.otp;
      }
    } else {
      const rawText = await res.text();
      smtpError = `Server responded with HTTP ${res.status}: ${rawText.slice(0, 80)}`;
      serverMessage = `Backend returned status ${res.status}`;
      console.warn('[Email Dispatcher] Non-JSON response from /api/send-otp:', res.status, rawText);
    }
  } catch (err: any) {
    console.warn('[Email Dispatcher] API send-otp network error:', err);
    smtpError = err?.message || 'Network error connecting to backend email dispatcher';
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

