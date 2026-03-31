'use client';

import { useState, useTransition } from 'react';
import { loginAction } from './actions';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-gray px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="logo text-2xl">PLATES.AE</span>
          <p className="text-gray-500 text-sm mt-3">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-primary-red px-6 py-4 flex items-center gap-3">
            <Lock size={20} className="text-white" />
            <h1 className="text-white font-bold text-lg tracking-tight">Admin Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  required
                  autoFocus
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary-red focus:ring-2 focus:ring-primary-red/10 transition font-medium"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary-red text-white py-3 rounded-lg font-bold text-sm hover:bg-[#aa1111] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} PLATES.AE
        </p>
      </div>
    </div>
  );
}
