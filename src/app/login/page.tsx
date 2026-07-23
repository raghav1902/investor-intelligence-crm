'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, ArrowRight, AlertCircle, Loader2, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { usePageTransition } from '@/components/TransitionProvider';

// Minimal IQ monogram mark — consistent across auth pages
function BrandMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500">
      <span className="text-sm font-bold text-[#010102] tracking-tight select-none">IQ</span>
    </div>
  );
}

// Google icon SVG
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

export default function LoginPage() {
  const router = useRouter();
  const { triggerTransition } = usePageTransition();
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      } else {
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
          Log in to InvestorIQ
        </h1>
        <p className="text-center text-content-muted text-sm mb-7">
          Your investor intelligence workspace
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
            id="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full bg-emerald-500 text-sm font-semibold text-[#010102] hover:bg-emerald-400 transition-colors disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Continue with email — expands inline */}
          <div className={`border border-hairline bg-surface-200 transition-all duration-200 ${emailExpanded ? 'rounded-2xl' : 'rounded-full overflow-hidden'}`}>
            <button
              id="login-email-toggle"
              onClick={() => setEmailExpanded((v) => !v)}
              className={`w-full flex items-center justify-between gap-2.5 py-2.5 px-4 text-sm font-medium text-content-primary hover:bg-surface-300 transition-colors ${emailExpanded ? 'rounded-t-2xl' : 'rounded-full'}`}
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

            {/* Inline expandable form */}
            {emailExpanded && (
              <form
                onSubmit={handleCredentialsLogin}
                className="px-4 pb-4 pt-3 space-y-3 border-t border-hairline"
              >
                <div>
                  <label className="block text-[11px] font-medium text-content-secondary mb-1">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    placeholder="you@company.com"
                    className="w-full rounded-lg border border-hairline bg-surface-base px-3 py-2 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-medium text-content-secondary">
                      Password
                    </label>
                    <a href="#" className="text-[11px] text-content-muted hover:text-content-primary transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-hairline bg-surface-base px-3 py-2 pr-10 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-[#010102] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Log In
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer link */}
        <p className="mt-8 text-center text-xs text-content-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-content-primary hover:text-white transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
