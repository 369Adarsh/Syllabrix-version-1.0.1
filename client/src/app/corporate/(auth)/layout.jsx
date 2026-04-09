// Corporate Auth Layout — completely separate visual identity from student auth
import Image from 'next/image';
import Link from 'next/link';

export default function CorporateAuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* ═══ LEFT PANEL — dark enterprise branding ═══ */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533a1b 100%)' }}>

        {/* Decorative elements */}
        <div className="absolute top-16 left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'24px 24px'}} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 max-w-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Image src="/images/logo/syllabrix-logo-white.png" alt="Syllabrix" width={200} height={56} className="h-16 w-auto object-contain" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6">
            Enterprise L&D
          </div>

          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-3">
            Workforce Capability System
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">
            AI-powered learning & development platform for corporate training, compliance, and upskilling.
          </p>

          {/* Enterprise feature pills */}
          <div className="space-y-3">
            {[
              { icon: '🧠', text: 'AI Skill Gap Analysis & Content Generation' },
              { icon: '📊', text: 'Kirkpatrick L1→L4 Impact Measurement' },
              { icon: '🔒', text: 'Enterprise SSO, RBAC & Compliance' },
              { icon: '🏢', text: 'Multi-Tenant Architecture' },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3 text-left">
                <span className="text-lg flex-shrink-0">{f.icon}</span>
                <span className="text-gray-300 text-xs font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-white/10">
            <p className="text-gray-500 text-xs">
              Looking for the student platform?{' '}
              <Link href="/sign-in" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                Sign in here →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — clean white form area ═══ */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-10 text-center">
            <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={160} height={48} className="h-12 mx-auto object-contain" />
            <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase">
              Enterprise L&D
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
