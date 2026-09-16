import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { COMMON_SKILLS_LIST } from '../../data/seedData';
import { X, User as UserIcon, Mail, Lock, Sparkles, Check } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDismissible?: boolean;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  isDismissible = true,
  onSwitchToLogin
}) => {
  const { register } = useAuth();
  const domains = storageService.getDomains();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [domainId, setDomainId] = useState(domains[0]?.id || 'domain-aiml');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'Git']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = register(name, email, password, confirmPassword, domainId, selectedSkills);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Registration failed.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
        {isDismissible && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create Learner Account</h2>
            <p className="text-xs text-slate-500">Generate your personalized learning roadmap</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Reed"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                  required
                />
              </div>
            </div>

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
                  placeholder="jordan@example.com"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Primary Target Domain
            </label>
            <select
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              className="w-full py-2.5 px-3 text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs"
            >
              {domains.map(d => (
                <option key={d.id} value={d.id} className="text-slate-900 font-medium">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Skills You Already Know (For Skill Gap Analysis)
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedSkills.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
              {COMMON_SKILLS_LIST.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Account...' : 'Complete Registration & Generate Roadmap'}
          </button>

          <div className="text-center pt-1 text-xs text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
