'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, User, ArrowRight, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { usePageTransition } from '@/components/TransitionProvider';


function BrandMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500">
      <span className="text-sm font-bold text-[#010102] tracking-tight select-none">IQ</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { triggerTransition } = usePageTransition();

  const [emailExpanded, setEmailExpanded] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Something went wrong. Please try again.');
        setLoading(false);
      } else {
        // Auto-sign in then transition to dashboard
        await signIn('credentials', { email, password, redirect: false });
        triggerTransition('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-base text-content-primary px-4">
      {/* Back to home */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>
      </div>

      <div className="w-full max-w-[340px]">
        {/* Logo */}
        <div className="flex justify-center mb-7">
          <BrandMark />
        </div>

        {/* Heading */}
        <h1 className="text-xl font-medium text-center text-content-primary mb-1 tracking-tight">
          Create your workspace
        </h1>
        <p className="text-center text-content-muted text-sm mb-7">
          Start cleaning investor data in minutes
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs leading-snug">{error}</p>
          </div>
        )}

        {/* Button stack */}
        <div className="space-y-2.5">
          {/* Continue with Google */}
          <button
            id="register-google-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full bg-emerald-500 text-sm font-semibold text-[#010102] hover:bg-emerald-400 transition-colors disabled:opacity-60"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Continue with email — expands inline */}
          <div className={`border border-hairline bg-surface-200 transition-all duration-200 ${emailExpanded ? 'rounded-2xl' : 'rounded-[20px] overflow-hidden'}`}>
            <button
              id="register-email-toggle"
              onClick={() => setEmailExpanded((v) => !v)}
              className={`w-full flex items-center justify-between gap-2.5 py-2.5 px-4 text-sm font-medium text-content-primary hover:bg-surface-300 transition-colors ${emailExpanded ? 'rounded-t-2xl' : 'rounded-[20px]'}`}
            >
              <span className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-content-secondary" />
                Continue with email
              </span>
              <ChevronDown
                className={`w-4 h-4 text-content-muted transition-transform duration-200 ${
                  emailExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {emailExpanded && (
              <form
                onSubmit={handleRegister}
                className="px-4 pb-4 pt-1 space-y-3 border-t border-hairline"
              >
                <div>
                  <label className="block text-[11px] font-medium text-content-secondary mb-1">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                      placeholder="John Doe"
                      className="w-full rounded-lg border border-hairline bg-surface-base pl-9 pr-3 py-2 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-content-secondary mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-hairline bg-surface-base pl-9 pr-3 py-2 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-content-secondary mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                    <input
                      id="register-password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-lg border border-hairline bg-surface-base pl-9 pr-3 py-2 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-[#010102] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>



        </div>

        {/* Legal */}
        <p className="mt-6 text-center text-[11px] text-content-muted leading-relaxed">
          By signing up, you agree to our{' '}
          <a href="#" className="font-semibold text-content-secondary hover:text-content-primary transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-semibold text-content-secondary hover:text-content-primary transition-colors">
            Data Processing Agreement
          </a>
          .
        </p>

        {/* Sign in link */}
        <p className="mt-4 text-center text-xs text-content-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-content-primary hover:text-white transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
