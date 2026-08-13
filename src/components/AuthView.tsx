import React, { useState } from 'react';
import { api } from '../api';

interface AuthViewProps {
  onAuthSuccess: (user: any) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user or homeowner
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await api.login({ email, password });
      } else {
        user = await api.register({ name, email, password, role });
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 p-8 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-[0_10px_30px_rgba(79,70,229,0.05)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#3525cd]/5 rounded-full -mr-16 -mt-16 blur-xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4f46e5]/5 rounded-full -ml-16 -mb-16 blur-xl" />

      <div className="relative z-10 text-center mb-6">
        <h2 className="text-3xl font-extrabold text-[#191c1e] tracking-tight">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-sm text-[#777587] mt-1.5">
          {isLogin
            ? 'Sign in to access your dashboard, bookings, and listings'
            : 'Join UrbanRent to browse, list, and book properties'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#777587]">
                person
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c7c4d8]/50 focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none text-sm transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#777587]">
              mail
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.rivera@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c7c4d8]/50 focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#777587]">
              lock
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c7c4d8]/50 focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none text-sm transition-all"
            />
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-2 px-4 rounded-xl border font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${role === 'user'
                  ? 'border-[#3525cd] bg-[#3525cd]/5 text-[#3525cd]'
                  : 'border-[#c7c4d8]/50 bg-white text-[#777587] hover:bg-gray-50'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">search</span>
                Rent a Home
              </button>
              <button
                type="button"
                onClick={() => setRole('homeowner')}
                className={`py-2 px-4 rounded-xl border font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${role === 'homeowner'
                  ? 'border-[#3525cd] bg-[#3525cd]/5 text-[#3525cd]'
                  : 'border-[#c7c4d8]/50 bg-white text-[#777587] hover:bg-gray-50'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">real_estate_agent</span>
                Post a House
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-2 rounded-xl bg-[#3525cd] hover:bg-[#2c1eb5] text-white font-bold text-sm shadow-[0_4px_15px_rgba(53,37,205,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isLogin ? 'Sign In' : 'Sign Up'}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-[#c7c4d8]/20 text-center">
        <button
          onClick={handleToggleMode}
          className="text-xs font-semibold text-[#3525cd] hover:underline"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
};
