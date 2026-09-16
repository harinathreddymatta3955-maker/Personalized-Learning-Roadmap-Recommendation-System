import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  LogIn, 
  Sparkles, 
  Shield, 
  UserCheck, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft, 
  RefreshCw,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword?: () => void;
  appliedOtp?: string;
  onClearAppliedOtp?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgotPassword,
  appliedOtp = '',
  onClearAppliedOtp
}) => {
  const { 
    login, 
    forgotPassword, 
    verifyOtpAndLogin, 
    verifyOtpAndResetPassword, 
    lastDispatchedEmailOTP 
  } = useAuth();

  // Mode: 'password' (standard login) or 'forgot_password_otp' (OTP verification near login)
  const [authMode, setAuthMode] = useState<'password' | 'forgot_password_otp'>('password');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP & Reset Password fields
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [wantResetPassword, setWantResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync applied OTP from external helper (e.g. SimulatedEmailModal Autofill)
  useEffect(() => {
    if (appliedOtp && isOpen) {
      setOtp(appliedOtp);
      setAuthMode('forgot_password_otp');
      setOtpSent(true);
      setError(null);
      if (onClearAppliedOtp) {
        onClearAppliedOtp();
      }
    }
  }, [appliedOtp, isOpen, onClearAppliedOtp]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset state when modal is closed or opened
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Standard Password Login submission
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email.trim(), password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Login failed. Please check your credentials or use Forgot Password.');
      }
    }, 300);
  };

  // Trigger OTP dispatch for Forgot Password
  const triggerSendOtp = (targetEmail?: string) => {
    const emailToUse = (targetEmail || email).trim();
    if (!emailToUse) {
      setError('Please enter your registered email address first.');
      setAuthMode('forgot_password_otp');
      setOtpSent(false);
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    setTimeout(() => {
      const res = forgotPassword(emailToUse);
      setLoading(false);
      if (res.success) {
        setAuthMode('forgot_password_otp');
        setOtpSent(true);
        setResendCooldown(30);
        setSuccess(`Verification OTP sent to ${emailToUse}. Check your inbox or the simulation card!`);
      } else {
        setError(res.error || 'Failed to dispatch OTP. Ensure the email is registered.');
      }
    }, 350);
  };

  // Click handler when user clicks "Forgot password?"
  const handleForgotPasswordClick = () => {
    setError(null);
    setSuccess(null);
    if (email.trim()) {
      // Auto-send OTP to the email already filled in
      triggerSendOtp(email.trim());
    } else {
      // Switch to OTP view and prompt for email
      setAuthMode('forgot_password_otp');
      setOtpSent(false);
    }
  };

  // Verify OTP and complete login / reset
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setError('Please enter the full 6-digit OTP verification code.');
      return;
    }

    if (wantResetPassword) {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      if (wantResetPassword) {
        const res = verifyOtpAndResetPassword(email.trim(), cleanOtp, newPassword);
        if (res.success) {
          // Password reset succeeded, now log in
          const loginRes = login(email.trim(), newPassword);
          setLoading(false);
          if (loginRes.success) {
            setSuccess('Password reset and verified! Logging in...');
            setTimeout(() => {
              onClose();
            }, 800);
          } else {
            setSuccess('Password updated successfully! Please sign in with your new password.');
            setAuthMode('password');
            setPassword(newPassword);
          }
        } else {
          setLoading(false);
          setError(res.error || 'OTP verification failed.');
        }
      } else {
        // Direct OTP login
        const res = verifyOtpAndLogin(email.trim(), cleanOtp);
        setLoading(false);
        if (res.success) {
          setSuccess('OTP verified successfully! Logging you in...');
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setError(res.error || 'Invalid or expired OTP code.');
        }
      }
    }, 400);
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            {authMode === 'password' ? (
              <LogIn className="w-5 h-5" />
            ) : (
              <KeyRound className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {authMode === 'password' ? 'Sign in to CO-ENGINEER' : 'Password Recovery & OTP Verification'}
            </h2>
            <p className="text-xs text-slate-500">
              {authMode === 'password'
                ? 'Access your personalized learning & recommendation system'
                : 'Verify registered email OTP right beside your login'}
            </p>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'password'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (email.trim() && !otpSent) {
                triggerSendOtp(email.trim());
              } else {
                setAuthMode('forgot_password_otp');
                setError(null);
                setSuccess(null);
              }
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'forgot_password_otp'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Forgot Password / OTP</span>
          </button>
        </div>

        {/* Quick Demo Pre-fill helper */}
        <div className="mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick Demo Accounts
            </span>
            <span className="text-[10px] font-normal text-slate-400">1-Click Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('alex@example.com', 'password123')}
              className="px-2 py-1.5 text-left rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-xs text-slate-700 hover:bg-blue-50/50 transition-colors shadow-2xs"
            >
              <div className="font-semibold text-blue-900 flex items-center gap-1 text-[11px]">
                <UserCheck className="w-3 h-3 text-blue-600" />
                Learner Alex
              </div>
              <div className="text-[10px] text-slate-500 truncate">alex@example.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@plrrs.edu', 'admin123')}
              className="px-2 py-1.5 text-left rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-xs text-slate-700 hover:bg-indigo-50/50 transition-colors shadow-2xs"
            >
              <div className="font-semibold text-indigo-900 flex items-center gap-1 text-[11px]">
                <Shield className="w-3 h-3 text-indigo-600" />
                Admin Sarah
              </div>
              <div className="text-[10px] text-slate-500 truncate">admin@plrrs.edu</div>
            </button>
          </div>
        </div>

        {/* Alerts / Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* MODE 1: STANDARD PASSWORD SIGN IN                                      */}
        {/* ===================================================================== */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {/* FORGOT PASSWORD OPTION - Explicitly kept and enhanced */}
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            {/* Quick action to get OTP directly */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="w-full py-2 px-3 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Forgot password? Get OTP to registered email & verify</span>
              </button>
            </div>

            <div className="text-center pt-2 text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Create an Account
              </button>
            </div>
          </form>
        )}

        {/* ===================================================================== */}
        {/* MODE 2: FORGOT PASSWORD & OTP VERIFICATION NEAR LOGIN PAGE             */}
        {/* ===================================================================== */}
        {authMode === 'forgot_password_otp' && (
          <div className="space-y-4">
            {/* Step A: If OTP has not been dispatched yet */}
            {!otpSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerSendOtp();
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter Registered Email Address
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
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    A 6-digit one-time password (OTP) will be dispatched to your registered mail.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    'Dispatching OTP...'
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Send OTP to Registered Mail</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step B: OTP Verification & Password Reset right here */
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                {/* Registered email confirmation */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-slate-500">Sent to:</span>
                    <span className="font-semibold text-slate-800 truncate">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setError(null);
                    }}
                    className="text-[11px] text-blue-600 hover:underline shrink-0 font-medium cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Quick Autofill hint if dispatched OTP matches */}
                {lastDispatchedEmailOTP && lastDispatchedEmailOTP.email.toLowerCase() === email.toLowerCase() && (
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Received OTP: <strong className="font-mono text-blue-900">{lastDispatchedEmailOTP.otp}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(lastDispatchedEmailOTP.otp);
                      }}
                      className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold cursor-pointer shadow-2xs"
                    >
                      Autofill
                    </button>
                  </div>
                )}

                {/* 6-Digit OTP Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={() => triggerSendOtp(email)}
                      className="text-[11px] text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full pl-10 pr-3 py-2.5 text-xl font-mono tracking-widest text-center text-slate-900 placeholder:text-slate-300 font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Optional: Reset password checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantResetPassword}
                      onChange={(e) => setWantResetPassword(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>I also want to set a new password</span>
                  </label>
                </div>

                {/* New Password inputs (if checkbox checked) */}
                {wantResetPassword && (
                  <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        New Password (min. 6 characters)
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full pl-8 pr-8 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
                          required={wantResetPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
                          required={wantResetPassword}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Action Button */}
                <button
                  type="submit"
                  disabled={loading || otp.trim().length < 6}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    'Verifying OTP...'
                  ) : wantResetPassword ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify OTP & Update Password</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify OTP & Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Return to standard password sign-in */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Password Sign In</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
