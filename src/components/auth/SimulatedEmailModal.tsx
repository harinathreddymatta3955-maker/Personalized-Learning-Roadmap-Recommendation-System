import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, X, Check, Copy, ArrowRight } from 'lucide-react';

interface SimulatedEmailModalProps {
  onApplyOtp?: (code: string) => void;
}

export const SimulatedEmailModal: React.FC<SimulatedEmailModalProps> = ({ onApplyOtp }) => {
  const { lastDispatchedEmailOTP, clearDispatchedEmailOTP } = useAuth();
  const [copied, setCopied] = React.useState(false);

  if (!lastDispatchedEmailOTP) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(lastDispatchedEmailOTP.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyOtp) {
      onApplyOtp(lastDispatchedEmailOTP.otp);
    }
    clearDispatchedEmailOTP();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-700">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Gmail SMTP Simulation</span>
              <p className="text-sm font-bold text-white">Password Reset OTP Dispatched</p>
            </div>
          </div>
          <button
            onClick={clearDispatchedEmailOTP}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-2 text-xs text-slate-300">
          <p><span className="text-slate-500">From:</span> CO-ENGINEER Security &lt;auth-service@gmail.smtp&gt;</p>
          <p><span className="text-slate-500">To:</span> {lastDispatchedEmailOTP.email}</p>
          <p><span className="text-slate-500">Subject:</span> Your CO-ENGINEER One-Time Verification Code</p>
          
          <div className="my-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">6-Digit Verification Code:</div>
              <div className="text-2xl font-mono font-bold tracking-widest text-emerald-400">
                {lastDispatchedEmailOTP.otp}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {onApplyOtp && (
                <button
                  onClick={handleApply}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Autofill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Valid for 10 minutes. Enter this code into the Forgot Password form to reset your password.
          </p>
        </div>
      </div>
    </div>
  );
};
