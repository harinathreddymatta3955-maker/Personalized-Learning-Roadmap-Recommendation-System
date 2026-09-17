import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, KeyRound, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

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

  // Update otp if prop changes
  React.useEffect(() => {
    if (initialCode) {
      setOtp(initialCode);
      if (step === 'request') {
        setStep('verify');
      }
    }
  }, [initialCode]);

  if (!isOpen) return null;

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = forgotPassword(email.trim());
      setLoading(false);
      if (res.success) {
        setStep('verify');
        setSuccess(`A 6-digit verification code has been sent to ${email.trim()}. Please check your email inbox and spam folder.`);
      } else {
        setError(res.error || 'Failed to dispatch OTP.');
      }
    }, 400);
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6-Digit Verification OTP
              </label>
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
