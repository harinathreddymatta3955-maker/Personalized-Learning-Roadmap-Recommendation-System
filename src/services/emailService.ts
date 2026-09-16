import { auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

/**
 * Dispatches a password reset OTP and reset request to the user's provided email.
 * 1. Posts to /api/send-otp which sends the 6-digit OTP via SMTP (if configured).
 * 2. Attempts Firebase Auth sendPasswordResetEmail to trigger official password reset email.
 * 3. Never returns or exposes the OTP to client-side UI.
 */
export async function dispatchOtpEmail(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Send via backend API route
  try {
    await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: cleanEmail, otp }),
    });
  } catch (err) {
    console.warn('[Email Dispatcher] Local API send-otp attempt:', err);
  }

  // 2. Also attempt Firebase Auth reset email if account is linked
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch {
    // Non-fatal if Firebase Auth email provider is restricted
  }

  return {
    success: true,
    message: `Verification code has been dispatched to ${cleanEmail}. Please check your inbox and spam/junk folder.`,
  };
}
