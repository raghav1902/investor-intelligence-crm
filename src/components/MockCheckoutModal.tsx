'use client';

import React, { useState } from 'react';
import { X, CreditCard, Lock, ShieldCheck, Loader2 } from 'lucide-react';

interface MockCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MockCheckoutModal({ isOpen, onClose, onSuccess }: MockCheckoutModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/.{1,4}/g);
    setCardNumber(matches ? matches.join(' ') : value);
  };

  // Format Expiry (adds slash after 2 digits)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  // Handle CVC change
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvc(value);
  };

  const getCardType = () => {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'Mastercard';
    return 'Generic';
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardHolder.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      setError('Please enter a valid 3-digit CVC code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmMock: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete mock transaction.');
      }

      // Simulate a small network delay for realistic visual experience
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1500);

    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-[#0f1011] border border-[#23252a] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#23252a]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h2 className="text-md font-medium text-[#d0d6e0]">Secure Checkout (Test Mode)</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-[#8a8f98] hover:text-[#d0d6e0] transition-colors rounded-lg hover:bg-[#141516]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Developer Sandbox Warning Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-3 text-xs text-amber-400/90 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong>Developer Mode Active:</strong> Stripe keys are missing in your <code>.env</code>. You can fill in any fake details to simulate a successful Premium upgrade.
          </div>
        </div>

        <div className="p-5">
          {/* Card Preview Graphic */}
          <div className="relative h-44 w-full bg-gradient-to-tr from-[#16222F] to-[#363B4E] rounded-xl p-5 text-white shadow-lg overflow-hidden mb-6 select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent)]" />
            
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-semibold tracking-wider opacity-60">PREMIUM SUBSCRIPTION</span>
              <span className="text-xs font-bold italic opacity-85 text-emerald-400">
                {getCardType() === 'Visa' ? 'VISA' : getCardType() === 'Mastercard' ? 'MASTERCARD' : 'CARD'}
              </span>
            </div>

            {/* Chip Graphic */}
            <div className="mt-4 w-10 h-7 bg-amber-400/20 border border-amber-400/30 rounded-md flex items-center justify-center opacity-80">
              <div className="grid grid-cols-3 gap-0.5 w-6 h-4">
                <div className="border-[0.5px] border-amber-400/30"></div>
                <div className="border-[0.5px] border-amber-400/30"></div>
                <div className="border-[0.5px] border-amber-400/30"></div>
                <div className="border-[0.5px] border-amber-400/30"></div>
                <div className="border-[0.5px] border-amber-400/30"></div>
                <div className="border-[0.5px] border-amber-400/30"></div>
              </div>
            </div>

            <div className="mt-5 text-md font-mono tracking-widest text-[#d0d6e0] min-h-[1.5rem] relative z-10">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>

            <div className="mt-4 flex justify-between items-end relative z-10">
              <div>
                <span className="block text-[9px] uppercase tracking-wider opacity-45">Card Holder</span>
                <span className="text-xs font-mono font-medium truncate max-w-[180px] block text-[#d0d6e0]">
                  {cardHolder || 'CARDHOLDER NAME'}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider opacity-45">Expires</span>
                <span className="text-xs font-mono font-medium text-[#d0d6e0]">
                  {expiry || 'MM/YY'}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePay} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-[#8a8f98] mb-1.5 font-medium">Cardholder Name</label>
              <input
                type="text"
                placeholder="Sarah Jenkins"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                disabled={loading}
                className="w-full rounded-lg border border-[#23252a] bg-[#0a0a0c] px-3 py-2.5 text-sm text-[#d0d6e0] placeholder-[#62666d] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[#8a8f98] mb-1.5 font-medium">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  disabled={loading}
                  className="w-full rounded-lg border border-[#23252a] bg-[#0a0a0c] pl-10 pr-3 py-2.5 text-sm text-[#d0d6e0] placeholder-[#62666d] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                  required
                />
                <CreditCard className="w-4 h-4 text-[#62666d] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8a8f98] mb-1.5 font-medium">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  disabled={loading}
                  className="w-full text-center rounded-lg border border-[#23252a] bg-[#0a0a0c] px-3 py-2.5 text-sm text-[#d0d6e0] placeholder-[#62666d] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#8a8f98] mb-1.5 font-medium">CVC</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cvc}
                  onChange={handleCvcChange}
                  disabled={loading}
                  className="w-full text-center rounded-lg border border-[#23252a] bg-[#0a0a0c] px-3 py-2.5 text-sm text-[#d0d6e0] placeholder-[#62666d] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#23252a] flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-[#d0d6e0] bg-[#141516] border border-[#23252a] rounded-lg hover:bg-[#23252a] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-[#010102] bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  'Pay ₹999 / month'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
