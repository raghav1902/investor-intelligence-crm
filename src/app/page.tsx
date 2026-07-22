'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Upload, FileText, Fingerprint, Download, ChevronRight } from 'lucide-react';
import { usePageTransition } from '@/components/TransitionProvider';

const FadeInText = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const RevealLine = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0.2, filter: 'blur(4px)' }}
    whileInView={{ opacity: 1, filter: 'blur(0px)' }}
    viewport={{ once: false, margin: "-40% 0px -40% 0px" }}
    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    className="py-12"
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const { isExiting, triggerTransition } = usePageTransition();

  const orb1Color = useTransform(scrollYProgress, [0, 0.5, 1], ['rgba(6, 78, 59, 0.1)', 'rgba(30, 58, 138, 0.1)', 'rgba(88, 28, 135, 0.1)']);
  const orb2Color = useTransform(scrollYProgress, [0, 0.5, 1], ['rgba(49, 46, 129, 0.1)', 'rgba(88, 28, 135, 0.1)', 'rgba(6, 78, 59, 0.1)']);

  return (
    <motion.div
      animate={isExiting ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative bg-[#0a0a0f] text-white selection:bg-white/20 overflow-x-hidden w-full font-sans"
    >
      
      {/* Global Noise Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
        
        {/* Subtle glowing orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ backgroundColor: orb1Color }}
          className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ backgroundColor: orb2Color }}
          className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10">
        {/* 1. HERO SECTION */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-thin tracking-wider mb-6 leading-tight">
              Clean data.<br className="hidden md:block" /> Remembered.
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-base md:text-lg text-slate-400 font-light tracking-wide uppercase"
            >
              AI-native investor intelligence.
            </motion.p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="absolute bottom-12 flex flex-col items-center gap-3 text-slate-500 font-light text-sm uppercase tracking-widest"
          >
            Scroll
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4 opacity-50" />
            </motion.div>
          </motion.div>
        </section>

        {/* 2. PROBLEM STATEMENT */}
        <section className="py-[30vh] px-6 min-h-[150vh] flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl w-full flex flex-col gap-[20vh]">
            <RevealLine>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-thin text-slate-300 tracking-wider">
                Every duplicate record.
              </h2>
            </RevealLine>
            <RevealLine>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-thin text-slate-300 tracking-wider">
                Every mismatched name.
              </h2>
            </RevealLine>
            <RevealLine>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-thin text-slate-300 tracking-wider">
                Every stray PDF.
              </h2>
            </RevealLine>
            <RevealLine>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-thin text-white tracking-wider">
                Resolved — automatically.
              </h2>
            </RevealLine>
          </div>
        </section>

        {/* 3. PIPELINE VISUAL */}
        <section className="min-h-screen flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
            
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-px bg-surface-200 -translate-y-1/2 -z-10 overflow-hidden">
              <motion.div 
                className="w-1/3 h-full bg-emerald-500/20"
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Connecting Line (Mobile) */}
            <div className="md:hidden absolute left-1/2 top-10 bottom-10 w-px bg-surface-200 -translate-x-1/2 -z-10 overflow-hidden">
              <motion.div 
                className="h-1/3 w-full bg-emerald-500/20"
                animate={{ y: ['-100%', '300%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {[
              { icon: Upload, label: "Upload" },
              { icon: FileText, label: "Extract" },
              { icon: Fingerprint, label: "Deduplicate" },
              { icon: Download, label: "Export" }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="flex flex-col items-center gap-4 bg-[#0a0a0f] p-4 rounded-2xl"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center relative group">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-500" />
                  <step.icon className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-white transition-colors duration-500" strokeWidth={1} />
                  
                  {/* Glowing dot */}
                  <div className="absolute -inset-1 rounded-full border border-white/5 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                </div>
                <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{step.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. FEATURE REVEALS */}
        <section className="py-[20vh] px-6 min-h-screen flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl w-full flex flex-col gap-[45vh]">
            <FadeInText>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-thin tracking-wider text-white">
                Gemini Vision reads every page.
              </h3>
            </FadeInText>
            <FadeInText>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-thin tracking-wider text-white">
                Hash-bucket matching, instantly.
              </h3>
            </FadeInText>
            <FadeInText>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-thin tracking-wider text-white">
                Your workspace. Isolated. Yours.
              </h3>
            </FadeInText>
          </div>
        </section>

        {/* 5. FINAL CTA */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-thin tracking-wider mb-12">
              See it for yourself.
            </h2>
            <button
              id="landing-try-demo-btn"
              onClick={() => triggerTransition('/dashboard?demo=true')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-sm font-medium tracking-widest uppercase text-[#010102] bg-emerald-500 border border-emerald-500 rounded-full overflow-hidden hover:bg-emerald-400 transition-colors duration-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                Try the Demo
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </motion.div>
        </section>

        {/* 6. FOOTER */}
        <footer className="w-full border-t border-white/5 py-8 px-6 flex flex-col md:flex-row items-center justify-between text-xs font-light tracking-widest uppercase text-slate-600">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <span className="font-medium tracking-widest text-slate-400">Investor</span>
            <span className="font-thin tracking-widest text-slate-500">IQ</span>
            <span className="ml-2 font-thin text-[10px]">© 2026</span>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-300 transition-colors">GitHub</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Docs</a>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </motion.div>
  );
}
