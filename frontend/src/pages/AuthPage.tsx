import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsDemoUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center p-6 text-[#e2e2e2]">
      <div className="w-full max-w-md bg-[#1b1b1b] border border-[#262626] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] border border-[#353535] flex items-center justify-center font-bold text-lg text-white">
            <span className="material-symbols-outlined text-xl fill">token</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">CareerOS</h1>
            <p className="text-[11px] font-mono text-[#8e9192] uppercase tracking-wider mt-1">
              AI Career Intelligence Platform
            </p>
          </div>
        </div>

        {/* Mode Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            {isRegister ? 'Create your Account' : 'Sign in to CareerOS'}
          </h2>
          <p className="text-xs text-[#8e9192] mt-1">
            {isRegister
              ? 'Start tracking your career pipeline with AI intelligence.'
              : 'Enter your credentials to access your isolated workspace.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#93000a]/20 border border-[#93000a]/40 text-[#ffb4ab] text-xs font-mono rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3.5 py-2.5 text-sm text-[#e2e2e2] placeholder:text-[#8e9192]/60 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3.5 py-2.5 text-sm text-[#e2e2e2] placeholder:text-[#8e9192]/60 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 rounded-lg text-xs font-mono font-medium mt-2 shadow-lg"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#262626]"></div>
          <span className="text-[11px] font-mono text-[#8e9192] uppercase">or continue with</span>
          <div className="h-px flex-1 bg-[#262626]"></div>
        </div>

        {/* Social / Google Sign-In */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#131313] hover:bg-[#2a2a2a] border border-[#262626] rounded-lg text-xs font-mono text-white flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            Sign in with Google
          </button>

          <button
            onClick={loginAsDemoUser}
            className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-[#c6c6c7] hover:text-white transition-all text-center"
          >
            ⚡ Quick Live Workspace Demo
          </button>
        </div>

        {/* Switch Register / Login */}
        <div className="mt-6 text-center text-xs text-[#8e9192]">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => { setIsRegister(false); setError(null); }}
                className="text-white underline hover:opacity-80 font-medium"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => { setIsRegister(true); setError(null); }}
                className="text-white underline hover:opacity-80 font-medium"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
