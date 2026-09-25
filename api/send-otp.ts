import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendOtpDirect } from '../src/services/sendOtpHandler.ts';

export const maxDuration = 30;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // Keep as string if parsing fails
      }
    }

    const { email, otp } = (body && typeof body === 'object') ? body : {};

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const result = await sendOtpDirect(String(email), String(otp));
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[API Send OTP] Internal error:', err);
    return res.status(500).json({
      error: 'Failed to dispatch verification email.',
      details: err?.message
    });
  }
}
