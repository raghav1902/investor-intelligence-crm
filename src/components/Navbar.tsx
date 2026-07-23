'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Loader2, Zap, Menu, Settings, LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface NavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenUpload: () => void;
  onRefresh: () => void;
  onRunMatch: () => void;
  isRefreshing: boolean;
  isMatching: boolean;
  onExport: () => void;
}

export default function Navbar({
  isSidebarOpen,
  onToggleSidebar,
  onOpenUpload,
  onRefresh,
  onRunMatch,
  isRefreshing,
  isMatching,
  onExport,
}: NavbarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const [subStatus, setSubStatus] = useState<{ plan: string } | null>(null);

  useEffect(() => {
    fetch('/api/subscription/status', {
      headers: { 'x-workspace-id': typeof window !== 'undefined' ? localStorage.getItem('workspaceId') || '' : '' }
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.plan) setSubStatus(data);
    })
    .catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
    onExport();
  };

  // Build initials for avatar fallback
  const name = session?.user?.name ?? '';
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#23252a] bg-[#0a0a0c] transition-colors duration-300">
      <div className="mx-auto flex h-14 w-full max-w-[99%] items-center justify-between px-4 sm:px-6">
        {/* Left Section: Menu Toggle & Title */}
        <div className="flex items-center gap-3 min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex rounded-lg p-2 text-[#8a8f98] hover:bg-[#141516] hover:text-[#d0d6e0] transition border border-[#23252a] shrink-0"
              title="Expand Left Sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-[#8a8f98] hover:bg-[#141516] hover:text-[#d0d6e0] transition border border-[#23252a] md:hidden shrink-0"
            title="Toggle Menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-medium text-[#d0d6e0] tracking-tight truncate">
              Investor Contacts Directory
            </h1>
            <p className="text-xs text-[#62666d] font-normal hidden sm:block truncate">
              AI-powered OCR verification &amp; deduplication engine
            </p>
          </div>
        </div>

        {/* Right Section: Primary Actions + Avatar */}
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center rounded-lg border border-[#23252a] bg-[#0f1011] p-2 text-[#8a8f98] hover:bg-[#141516] hover:text-[#d0d6e0] transition-all duration-200 disabled:opacity-60"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 transition-transform ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          <div className="w-px h-5 bg-[#23252a] mx-0.5 hidden sm:block" />

          {/* Run Dedup */}
          <button
            onClick={onRunMatch}
            disabled={isMatching}
            className="inline-flex items-center gap-2 rounded-lg border border-[#23252a] bg-surface-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-[#d0d6e0] hover:bg-surface-300 active:scale-95 transition-all duration-200 disabled:opacity-50"
            title="Run Auto-Clean & Deduplication Engine"
          >
            {isMatching ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            ) : (
              <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500" />
            )}
            <span className="hidden sm:inline">{isMatching ? 'Processing...' : 'Run Dedup'}</span>
          </button>

          {/* Upload */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-transparent px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-[#d0d6e0] hover:bg-[#141516] transition-all duration-200 border border-[#23252a]"
          >
            <Upload className="h-4 w-4 text-[#8a8f98]" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-[#010102] hover:bg-emerald-400 active:scale-95 transition-all duration-200 disabled:opacity-70"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>

          <div className="w-px h-5 bg-[#23252a] mx-0.5 hidden sm:block" />

          {/* Auth state conditional */}
          {status === 'authenticated' ? (
            /* ── AUTHENTICATED — avatar dropdown ── */
            <div className="flex items-center gap-4">
              {subStatus?.plan === 'free' ? (
                <Link
                  href="/pricing"
                  className="text-[11px] font-bold text-[#010102] uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 rounded-full transition-colors hidden sm:block"
                >
                  Upgrade
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="text-xs font-medium text-[#8a8f98] hover:text-[#d0d6e0] transition-colors hidden sm:block"
                >
                  Pricing
                </Link>
              )}
              <div className="relative" ref={dropdownRef}>
              <button
                id="navbar-avatar-btn"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                title="Account"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </button>

              {dropdownOpen && (
                <div
                  id="navbar-account-dropdown"
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#23252a] bg-[#0f1011] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {session?.user && (
                    <div className="px-4 py-3 border-b border-[#23252a]">
                      <p className="text-xs font-medium text-[#d0d6e0] truncate">
                        {session.user.name || 'Account'}
                      </p>
                      <p className="text-[11px] text-[#62666d] truncate mt-0.5">
                        {session.user.email}
                      </p>
                    </div>
                  )}

                  <div className="p-1">
                    <Link
                      href="/settings"
                      id="navbar-settings-link"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-[#d0d6e0] hover:bg-[#141516] transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-[#8a8f98]" />
                      Settings
                    </Link>

                    <div className="my-1 border-t border-[#23252a]" />

                    <button
                      id="navbar-signout-btn"
                      onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/login' }); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-[#d0d6e0] hover:bg-[#141516] hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5 text-[#8a8f98]" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          ) : (
            /* ── GUEST / DEMO — Log in + Sign up buttons ── */
            <div className="flex items-center gap-2 sm:gap-4">
              {subStatus?.plan === 'free' ? (
                <Link
                  href="/pricing"
                  className="text-[11px] font-bold text-[#010102] uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 rounded-full transition-colors hidden sm:block"
                >
                  Upgrade
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="text-xs font-medium text-[#8a8f98] hover:text-[#d0d6e0] transition-colors hidden sm:block"
                >
                  Pricing
                </Link>
              )}
              <Link
                href="/login"
                id="navbar-login-btn"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#8a8f98] hover:text-[#d0d6e0] hover:bg-[#141516] rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                id="navbar-signup-btn"
                className="inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-[#010102] hover:bg-emerald-400 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
