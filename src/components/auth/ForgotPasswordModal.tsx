import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, KeyRound, Lock, CheckCircle2, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
  onBackToLogin?: () => void;
  initialCode?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onBackToLogin,
  initialCode = ''
}) => {
  const handleGoToLogin = onSwitchToLogin || onBackToLogin || onClose;
  const { forgotPassword, verifyOtpAndResetPassword } = useAuth();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(initialCode);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{ deliveredViaSmtp: boolean; fallbackOtp?: string; senderEmail?: string; smtpError?: string } | null>(null);

  // Update otp if prop changes
  useEffect(() => {
    if (initialCode) {
      setOtp(initialCode);
      if (step === 'request') {
        setStep('verify');
      }
    }
  }, [initialCode, step]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setLoading(false);
      if (res.success) {
        setStep('verify');
        setDeliveryInfo({
          deliveredViaSmtp: Boolean(res.deliveredViaSmtp),
          fallbackOtp: res.fallbackOtp,
          senderEmail: res.senderEmail,
          smtpError: res.smtpError
        });
        if (res.deliveredViaSmtp) {
          setSuccess(`A 6-digit verification code has been dispatched to ${email.trim()}. Please check your email inbox and spam folder.`);
        }
      } else {
        setError(res.error || 'Failed to dispatch OTP.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to dispatch OTP.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp.trim()) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = verifyOtpAndResetPassword(email.trim(), otp.trim(), newPassword);
      setLoading(false);
      if (res.success) {
        setSuccess('Password reset successfully! You can now log in with your new credentials.');
        setTimeout(() => {
          handleGoToLogin();
        }, 1800);
      } else {
        setError(res.error || 'Invalid verification code. Please check your email and try again.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reset Account Password</h2>
            <p className="text-xs text-slate-500">Secure Email Verification Flow</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                A 6-digit one-time password will be sent to this email address.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              {loading ? 'Generating OTP...' : 'Send Verification OTP'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleGoToLogin}
                className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {deliveryInfo && deliveryInfo.deliveredViaSmtp && (
              <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200/90 text-blue-950 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-900">Verification Email Dispatched</div>
                    <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
                      We sent the 6-digit code to <strong>{email}</strong> from <span className="font-mono text-blue-950 font-semibold">{deliveryInfo.senderEmail || 'notificationsplrs@gmail.com'}</span>.
                    </p>
                    <div className="text-amber-900 bg-amber-100/90 border border-amber-300/60 rounded-lg p-2 text-[11px] mt-2 leading-relaxed">
                      ⚠️ <strong>Email not arriving in your inbox?</strong> Automated emails frequently land in your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder. Please check those folders.
                    </div>
                  </div>
                </div>

                <details className="text-[11px] text-blue-900 pt-0.5">
                  <summary className="cursor-pointer text-blue-700 font-semibold hover:underline">
                    Still can't find it? Click to reveal code immediately
                  </summary>
                  <div className="mt-2 p-2.5 bg-white rounded-lg border border-blue-200 text-xs">
                    <p className="text-slate-600 text-[11px] mb-2">
                      To prevent you from being blocked, here is your one-time verification code:
                    </p>
                    {deliveryInfo.fallbackOtp && (
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                        <span className="font-mono text-base font-bold tracking-widest text-slate-900">
                          {deliveryInfo.fallbackOtp}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (deliveryInfo.fallbackOtp) setOtp(deliveryInfo.fallbackOtp);
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Autofill Code
                        </button>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {deliveryInfo && !deliveryInfo.deliveredViaSmtp && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-900">
                      {deliveryInfo.smtpError ? 'Email Delivery Failed' : 'Mail Server (SMTP) Not Detected'}
                    </div>
                    <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                      {deliveryInfo.smtpError ? (
                        <>Backend error: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px] text-amber-900">{deliveryInfo.smtpError}</code></>
                      ) : (
                        <>Could not reach mail service on this environment. For uninterrupted testing, your verification code is ready below:</>
                      )}
                    </p>
                  </div>
                </div>

                {deliveryInfo.fallbackOtp && (
                  <div className="flex items-center justify-between bg-white/90 border border-amber-200 rounded-lg px-3 py-2">
                    <span className="font-mono text-base font-bold tracking-widest text-slate-900">
                      {deliveryInfo.fallbackOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (deliveryInfo.fallbackOtp) setOtp(deliveryInfo.fallbackOtp);
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded text-[11px] transition-colors cursor-pointer"
                    >
                      Autofill Code
                    </button>
                  </div>
                )}

                <details className="text-[11px] text-amber-900 pt-0.5">
                  <summary className="cursor-pointer text-amber-800 font-medium hover:underline">
                    How to enable real Gmail delivery?
                  </summary>
                  <div className="mt-1.5 p-2 bg-amber-100/70 rounded text-[10.5px] leading-relaxed text-amber-950">
                    In project Settings &rarr; Environment variables, add:
                    <ul className="list-disc pl-4 mt-1 font-mono text-[10px] space-y-0.5">
                      <li>SMTP_HOST=smtp.gmail.com</li>
                      <li>SMTP_USER=your-email@gmail.com</li>
                      <li>SMTP_PASS=your-google-app-password (16 letters)</li>
                    </ul>
                  </div>
                </details>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  6-Digit Verification OTP
                </label>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRequestOtp}
                  className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="••••••"
                className="w-full text-center text-xl font-mono font-bold tracking-widest py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-300 shadow-xs transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              {loading ? 'Verifying...' : 'Reset Password'}
            </button>

            <div className="flex justify-between items-center pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-slate-500 hover:text-slate-700"
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={handleGoToLogin}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
