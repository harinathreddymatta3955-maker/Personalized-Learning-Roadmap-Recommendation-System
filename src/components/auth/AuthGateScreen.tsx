import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Compass, 
  BookOpen, 
  Target, 
  ArrowRight,
  ShieldCheck,
  Brain,
  KeyRound,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface AuthGateScreenProps {
  onSuccess?: () => void;
}

export const AuthGateScreen: React.FC<AuthGateScreenProps> = ({ onSuccess }) => {
  const { login, register, forgotPassword, verifyOtpAndResetPassword } = useAuth();
  const domains = storageService.getDomains();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpDomainId, setSignUpDomainId] = useState(domains[0]?.id || 'domain-aiml');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot password & reset state
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{ deliveredViaSmtp: boolean; fallbackOtp?: string; senderEmail?: string; smtpError?: string } | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!signInEmail.trim() || !signInPassword) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(signInEmail.trim(), signInPassword);
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 350);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = register(
        signUpName.trim(),
        signUpEmail.trim(),
        signUpPassword,
        signUpConfirmPassword,
        signUpDomainId,
        ['Python', 'Fundamentals']
      );
      setLoading(false);
      if (res.success) {
        setSuccess('Account created successfully! Welcome to CO-ENGINEER.');
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Registration failed. An account with this email may already exist.');
      }
    }, 400);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      setLoading(false);
      if (res.success) {
        setForgotStep('verify');
        setDeliveryInfo({
          deliveredViaSmtp: Boolean(res.deliveredViaSmtp),
          fallbackOtp: res.fallbackOtp,
          senderEmail: res.senderEmail,
          smtpError: res.smtpError
        });
        if (res.deliveredViaSmtp) {
          setSuccess(`Verification code sent to ${forgotEmail.trim()}. Please check your email inbox and spam folder.`);
        }
      } else {
        setError(res.error || 'Unable to locate account with that email.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Error dispatching verification code.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!resetOtp.trim()) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    if (resetNewPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = verifyOtpAndResetPassword(forgotEmail.trim(), resetOtp.trim(), resetNewPassword);
      setLoading(false);
      if (res.success) {
        setSuccess('Password reset successfully! You can now sign in with your new password.');
        setSignInEmail(forgotEmail.trim());
        setSignInPassword('');
        setTimeout(() => {
          setMode('signin');
          setForgotStep('request');
          setResetOtp('');
          setResetNewPassword('');
          setResetConfirmPassword('');
        }, 1500);
      } else {
        setError(res.error || 'Invalid or expired OTP code. Please check your email and try again.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-center items-center relative overflow-hidden px-4 py-8">
      {/* Dynamic ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-blue-600/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[20%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero / Brand showcase */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left pr-0 lg:pr-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/25 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Personalized Learning & Recommendation System</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              CO-ENGINEER <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">PLRRS</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Sign in to unlock personalized skill roadmaps, adaptive quizzes, curated resources, and AI-grounded learning trajectories.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                <Compass className="w-4 h-4" />
              </div>
              <div className="font-semibold text-xs text-white">Dynamic Roadmaps</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Customized to your experience level</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                <Target className="w-4 h-4" />
              </div>
              <div className="font-semibold text-xs text-white">Skill Verification</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Interactive concept quizzes & tasks</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                <Brain className="w-4 h-4" />
              </div>
              <div className="font-semibold text-xs text-white">AI Recommendations</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Context-aware next steps & tools</div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Secure Authentication
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>Encrypted Session</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>Role-Based Access</span>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            {/* Header Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-950/70 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </button>
            </div>

            {/* Error & Success alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setForgotEmail(signInEmail);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In to Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Domain
                  </label>
                  <select
                    value={signUpDomainId}
                    onChange={(e) => setSignUpDomainId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {domains.map(d => (
                      <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="Re-enter"
                        className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Register & Start Learning'}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD / OTP VERIFICATION FORM */}
            {mode === 'forgot' && forgotStep === 'request' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    <span>Enter your registered email to receive a 6-digit verification code.</span>
                  </div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            )}

            {mode === 'forgot' && forgotStep === 'verify' && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                {deliveryInfo && deliveryInfo.deliveredViaSmtp && (
                  <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-200 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-blue-300">Verification Email Dispatched</div>
                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                          Sent to <strong className="text-white">{forgotEmail}</strong> from <span className="font-mono text-blue-300">{deliveryInfo.senderEmail || 'notificationsplrs@gmail.com'}</span>.
                        </p>
                        <div className="text-amber-200 bg-amber-950/60 border border-amber-500/40 rounded-lg p-2 text-[11px] mt-2 leading-relaxed">
                          ⚠️ <strong>Email not appearing in Inbox?</strong> Check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder.
                        </div>
                      </div>
                    </div>

                    <details className="text-[11px] text-blue-300 pt-0.5">
                      <summary className="cursor-pointer text-blue-400 font-semibold hover:underline">
                        Still can't find it? Click to reveal code immediately
                      </summary>
                      <div className="mt-2 p-2.5 bg-slate-900/90 rounded-lg border border-blue-500/20 text-xs">
                        <p className="text-slate-400 text-[11px] mb-2">
                          To keep you moving forward, here is your verification code:
                        </p>
                        {deliveryInfo.fallbackOtp && (
                          <div className="flex items-center justify-between bg-slate-950 border border-blue-500/30 rounded-lg px-3 py-1.5">
                            <span className="font-mono text-base font-bold tracking-widest text-blue-300">
                              {deliveryInfo.fallbackOtp}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (deliveryInfo.fallbackOtp) setResetOtp(deliveryInfo.fallbackOtp);
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-[11px] transition-colors cursor-pointer"
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
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-amber-300">
                          {deliveryInfo.smtpError ? 'SMTP Delivery Alert' : 'Mail Server (SMTP) Not Configured'}
                        </div>
                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                          {deliveryInfo.smtpError ? (
                            <>Delivery notice: <span className="text-amber-200 font-medium">{deliveryInfo.smtpError}</span></>
                          ) : (
                            <>Real email delivery to external inboxes requires SMTP credentials in Settings. For testing now, your verification code is:</>
                          )}
                        </p>
                      </div>
                    </div>

                    {deliveryInfo.fallbackOtp && (
                      <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/30 rounded-lg px-3 py-1.5">
                        <span className="font-mono text-sm font-bold tracking-widest text-amber-300">
                          {deliveryInfo.fallbackOtp}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (deliveryInfo.fallbackOtp) setResetOtp(deliveryInfo.fallbackOtp);
                          }}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-medium rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Autofill Code
                        </button>
                      </div>
                    )}

                    <details className="text-[10.5px] text-slate-400 pt-0.5">
                      <summary className="cursor-pointer text-amber-400 font-medium hover:underline">
                        How to enable real Gmail delivery?
                      </summary>
                      <div className="mt-1.5 p-2 bg-slate-900/80 rounded text-[10px] leading-relaxed text-slate-300">
                        In project Settings &rarr; Environment variables, add:
                        <ul className="list-disc pl-4 mt-1 font-mono text-[9.5px] space-y-0.5 text-amber-300/80">
                          <li>SMTP_HOST=smtp.gmail.com</li>
                          <li>SMTP_USER=your-email@gmail.com</li>
                          <li>SMTP_PASS=your-google-app-password</li>
                        </ul>
                      </div>
                    </details>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-slate-400">Sent to: </span>
                    <strong className="text-white">{forgotEmail}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[11px] text-blue-400 hover:underline shrink-0 font-medium cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={(e) => handleForgotPassword(e)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>Resend OTP</span>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="Enter 6-digit code from email"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white tracking-widest font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setForgotStep('request');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Resetting...' : 'Reset & Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
