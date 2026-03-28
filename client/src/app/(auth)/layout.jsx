// Server component — no 'use client' needed (no hooks, no browser APIs)
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* ═══ LEFT PANEL — rich gradient with depth ═══ */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-mesh-hero noise-overlay items-center justify-center p-12 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-16 left-16 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px] animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-float" style={{animationDelay:'2s'}} />

        <div className="relative z-10 max-w-sm text-center">
          <img src="/images/logo/syllabrix-logo-white.png" alt="SyllabriX Network" className="h-24 mx-auto mb-8 object-contain drop-shadow-lg animate-fade-up" />

          <h2 className="text-white text-3xl font-extrabold tracking-tight mb-3 animate-fade-up stagger-2">
            Connect. Learn. Grow.
          </h2>
          <p className="text-blue-200/70 text-base leading-relaxed mb-10 animate-fade-up stagger-3">
            India&apos;s complete education ecosystem for students, teachers, and institutes.
          </p>

          {/* Feature pills */}
          <div className="space-y-3 animate-fade-up stagger-4">
            {[
              { icon: '🧪', text: '1000+ Professions to Explore' },
              { icon: '🧠', text: 'AI-Powered Learning & Prep' },
              { icon: '🛡️', text: 'Safe for Ages 5+' },
            ].map((f, i) => (
              <div key={i} className="glass-dark rounded-xl px-5 py-3 flex items-center gap-3 text-left">
                <span className="text-xl">{f.icon}</span>
                <span className="text-blue-100/90 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — white, clean, form ═══ */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <img src="/images/logo/syllabrix-logo.png" alt="SyllabriX" className="h-16 mx-auto object-contain" />
            <p className="text-gray-400 text-sm mt-2">Connect. Learn. Grow.</p>
          </div>
          <div className="animate-fade-up">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
