'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, ChevronLeft, ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How does InvestorIQ's AI use my data?",
    answer: "Uploaded PDFs and Excel files are processed only to extract and structure your investor contact data. Your files and extracted data stay isolated to your workspace and are never used to train AI models or shared with other users."
  },
  {
    question: "Where can I view my invoices?",
    answer: "Go to Settings → Plan & Subscription → Manage Billing to view and download past invoices."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit and debit cards. Additional payment methods may be added in the future."
  },
  {
    question: "What is a \"scan\"?",
    answer: "A scan is a single file (PDF, image, or Excel workbook) processed through our OCR and extraction pipeline. Each file you upload for extraction counts as one scan against your plan's limit."
  },
  {
    question: "What happens when I exceed the 5-scan limit on the Free plan?",
    answer: "You'll be prompted to upgrade to Premium for unlimited scans. Your existing extracted contacts remain accessible — only new scans are paused until you upgrade or your limit resets."
  },
  {
    question: "Do you offer student or nonprofit discounts?",
    answer: "Not currently, but we're evaluating this for the future. Contact us if you'd like to be notified."
  },
  {
    question: "What do \"Verified & Clean,\" \"Needs Verification,\" and \"Critical Issues\" mean?",
    answer: "These are data quality statuses assigned during deduplication. \"Verified & Clean\" means the record has no conflicts, \"Needs Verification\" means minor inconsistencies were flagged, and \"Critical Issues\" means required fields (like email) are missing or conflicting."
  },
  {
    question: "How is the price of the Premium plan calculated?",
    answer: "Premium is a flat monthly rate per workspace — ₹999/month — with no per-seat or per-scan charges."
  },
  {
    question: "What happens when I upgrade or downgrade my plan?",
    answer: "Upgrades take effect immediately, unlocking unlimited scans and Gemini Vision OCR right away. Downgrades take effect at the end of your current billing cycle — you'll keep Premium access until then."
  },
  {
    question: "How do I cancel my paid plan?",
    answer: "Go to Settings → Plan & Subscription and click \"Cancel Plan.\" You'll retain Premium access until the end of your current billing period."
  },
  {
    question: "What happens if my payment isn't processed correctly (e.g. expired card)?",
    answer: "We'll retry the charge and notify you by email. If payment continues to fail, your account will revert to the Free plan until billing is resolved."
  },
  {
    question: "Can I change my payment method?",
    answer: "Yes, update your card anytime from Settings → Plan & Subscription → Manage Billing."
  },
  {
    question: "Do you offer refunds?",
    answer: "We don't offer refunds for partial billing periods, but you can cancel anytime to avoid future charges."
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-[#23252a]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-[15px] font-medium text-[#d0d6e0] transition-colors">{question}</span>
        <div className={`transform transition-transform duration-200 shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-emerald-500' : 'text-[#8a8f98] group-hover:text-[#d0d6e0]'} transition-colors`} />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-[#8a8f98] text-[15px] leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#d0d6e0] font-sans selection:bg-emerald-500 selection:text-emerald-200">
      
      {/* Back Navigation */}
      <nav className="p-6">
        <button onClick={() => router.back()} className="inline-flex items-center text-xs font-medium text-[#8a8f98] hover:text-[#d0d6e0] transition-colors gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-4 text-[#d0d6e0]">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[#8a8f98] font-light max-w-xl mx-auto">
            Choose the plan that fits your data cleanup needs.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-24 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-[#0f1011] border border-[#23252a] rounded-2xl p-8 flex flex-col transition-all hover:bg-[#141516]">
            <h3 className="text-lg font-medium text-[#d0d6e0] mb-2">Free</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-semibold text-[#d0d6e0]">₹0</span>
            </div>
            <p className="text-sm text-[#8a8f98] pb-6 border-b border-[#23252a] mb-6 min-h-[3rem]">
              Free for everyone
            </p>
            
            <ul className="flex-1 space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>5 scans total</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Basic OCR (Tesseract.js) — single image cards only (.png, .jpg, .webp)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>5 Excel exports</span>
              </li>
            </ul>

            <Link href="/register" className="w-full py-3 px-4 rounded-lg bg-[#141516] border border-[#23252a] text-[#d0d6e0] text-sm font-medium text-center hover:bg-[#ebecf0] transition-colors">
              Get Started
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-[#141516] border border-emerald-500 rounded-2xl p-8 flex flex-col shadow-[0_0_0_1px_rgba(16,185,129,0.1)] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-[#010102] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              Recommended
            </div>
            
            <h3 className="text-lg font-medium text-[#d0d6e0] mb-2">Premium</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-semibold text-[#d0d6e0]">₹999</span>
              <span className="text-sm text-[#8a8f98]">/month</span>
            </div>
            <p className="text-sm text-[#8a8f98] pb-6 border-b border-[#23252a] mb-6 min-h-[3rem]">
              For unlimited investor data cleanup
            </p>
            
            <ul className="flex-1 space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm text-[#d0d6e0] font-medium">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>All Free features, plus:</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Unlimited scans — PDFs, images, and Excel sheets</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Gemini 2.0 Flash Vision OCR — high-accuracy multi-page PDF processing</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Advanced duplicate detection with Gemini Vision auto-flagging</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Excel export (Premium-only feature)</span>
              </li>
            </ul>

            <Link href="#" className="w-full py-3 px-4 rounded-lg bg-emerald-500 text-[#010102] text-sm font-medium text-center hover:bg-emerald-500/80 transition-colors">
              Upgrade Now
            </Link>
          </div>
        </div>

        {/* Detailed Feature Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium tracking-tight mb-8 text-[#d0d6e0]">Compare Features</h2>
          
          <div className="w-full overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="py-4 px-4 font-medium text-sm text-[#8a8f98] border-b border-[#23252a] w-1/2">Features</th>
                  <th className="py-4 px-4 font-medium text-sm text-[#8a8f98] border-b border-[#23252a] w-1/4 text-center">Free</th>
                  <th className="py-4 px-4 font-medium text-sm text-emerald-500 border-b border-[#23252a] w-1/4 text-center">Premium</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Section: Scanning */}
                <tr>
                  <td colSpan={3} className="py-6 px-4 font-medium text-xs text-[#8a8f98] uppercase tracking-widest bg-[#141516]">Scanning</td>
                </tr>
                <tr className="border-b border-[#23252a]/50 hover:bg-[#141516] transition-colors">
                  <td className="py-4 px-4 text-[#8a8f98]">Scan limit</td>
                  <td className="py-4 px-4 text-center text-[#8a8f98]">5</td>
                  <td className="py-4 px-4 text-center text-[#d0d6e0]">Unlimited</td>
                </tr>
                <tr className="border-b border-[#23252a]/50 hover:bg-[#141516] transition-colors">
                  <td className="py-4 px-4 text-[#8a8f98]">Supported file types</td>
                  <td className="py-4 px-4 text-center text-[#8a8f98]">Image only</td>
                  <td className="py-4 px-4 text-center text-[#d0d6e0]">PDF, Image, Excel</td>
                </tr>

                {/* Section: OCR Engine */}
                <tr>
                  <td colSpan={3} className="py-6 px-4 font-medium text-xs text-[#8a8f98] uppercase tracking-widest bg-[#141516]">OCR Engine</td>
                </tr>
                <tr className="border-b border-[#23252a]/50 hover:bg-[#141516] transition-colors">
                  <td className="py-4 px-4 text-[#8a8f98]">Basic OCR (Tesseract.js)</td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#23252a]/50 hover:bg-[#141516] transition-colors">
                  <td className="py-4 px-4 text-[#8a8f98]">Gemini 2.0 Flash Vision</td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-[#8a8f98] mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                </tr>

                {/* Section: Deduplication */}
                <tr>
                  <td colSpan={3} className="py-6 px-4 font-medium text-xs text-[#8a8f98] uppercase tracking-widest bg-[#141516]">Deduplication</td>
                </tr>
                <tr className="border-b border-[#23252a]/50 hover:bg-[#141516] transition-colors">
                  <td className="py-4 px-4 text-[#8a8f98]">Basic matching</td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#23252a]/50 hover:bg-[#141516] transition-colors">
                  <td className="py-4 px-4 text-[#8a8f98]">Advanced AI-flagged clusters</td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-[#8a8f98] mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                </tr>

                {/* Section: Export */}
                <tr>
                  <td colSpan={3} className="py-6 px-4 font-medium text-xs text-[#8a8f98] uppercase tracking-widest bg-[#141516]">Export</td>
                </tr>
                <tr className="border-b border-[#23252a]/50 hover:bg-[#141516] transition-colors">
                  <td className="py-4 px-4 text-[#8a8f98]">Excel export</td>
                  <td className="py-4 px-4 text-center text-[#8a8f98]">5 total</td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-32">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-medium tracking-tight mb-4 text-[#d0d6e0]">
              Questions and Answers
            </h2>
          </div>
          
          <div className="border-t border-[#23252a]">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="text-center mt-12 pt-8">
            <p className="text-sm text-[#8a8f98]">
              Have more questions? Contact us at{' '}
              <a href="mailto:support@investoriq.com" className="text-[#d0d6e0] hover:text-emerald-500/80 transition-colors underline underline-offset-4">
                support@investoriq.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
