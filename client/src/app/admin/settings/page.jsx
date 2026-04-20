'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Shield, Bell, KeyRound, Eye, EyeOff,
  CheckCircle, AlertTriangle, Smartphone, Copy,
  ChevronRight, Loader2, Lock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';

const TABS = [
  { key: 'profile',       label: 'Admin Profile',    icon: User },
  { key: '2fa',           label: 'Two-Factor Auth',  icon: Shield },
  { key: 'notifications', label: 'Alert Preferences', icon: Bell },
];

function Section({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-gray-900 font-bold text-sm">{title}</h3>
        {description && <p className="text-gray-400 text-[11px] mt-0.5">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className={`text-gray-700 text-sm ${mono ? 'font-mono' : 'font-medium'}`}>{value || '—'}</p>
    </div>
  );
}

function ProfileTab({ user }) {
  const roleColors = {
    super_admin:     'bg-indigo-100 text-indigo-700 border-indigo-200',
    moderator:       'bg-blue-100 text-blue-700 border-blue-200',
    finance_manager: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    analyst:         'bg-amber-100 text-amber-700 border-amber-200',
  };

  const perms = {
    super_admin: [
      'Full database read/write via Data Workbench',
      'Raw SQL execution via Query Console',
      'User ban/unban and email verification',
      'Content moderation and report resolution',
      'Financial data and revenue analytics',
      'Audit log access and admin management',
      'SyllaTrace IT diagnostics console',
    ],
    moderator: [
      'User ban/unban and email verification',
      'Content moderation and report resolution',
      'Support ticket management',
      'Academic library management',
    ],
    finance_manager: [
      'Financial data and revenue analytics',
      'Report extraction and exports',
    ],
    analyst: [
      'Read-only user data and activity',
      'Content reports (view only)',
      'Financial analytics (view only)',
      'Audit log access',
    ],
  };

  return (
    <div className="space-y-5">
      <Section title="Identity" description="Your admin account details. Contact a super admin to change these.">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg shadow-indigo-200">
            {user?.full_name?.[0] || 'A'}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 flex-1">
            <Field label="Full Name"    value={user?.full_name} />
            <Field label="Username"     value={`@${user?.username}`} mono />
            <Field label="Email"        value={user?.email} />
            <Field label="Syllabrix ID" value={user?.syllabrix_id} mono />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Admin Role</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider ${roleColors[user?.admin_role] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {user?.admin_role?.replace(/_/g, ' ') || 'Unknown'}
              </span>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Account Status</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-emerald-500" />
                <span className="text-emerald-600 text-[11px] font-bold">Active &amp; Verified</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Access Permissions" description="What this admin role can do across the platform.">
        <ul className="space-y-2">
          {(perms[user?.admin_role] || ['No permissions defined']).map((p, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-600 text-[11px]">
              <CheckCircle size={12} className="text-emerald-500 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function TwoFATab({ user }) {
  const [step, setStep] = useState('idle');
  const [qrData, setQrData] = useState(null);
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.setup2FA();
      setQrData(res.data.qr_code);
      setSecret(res.data.secret);
      setStep('setup');
    } catch (e) {
      toast.error('2FA setup failed: ' + (e.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (token.length !== 6) return toast.error('Enter the 6-digit code from your authenticator app');
    setLoading(true);
    try {
      await adminAPI.verify2FA(token);
      setStep('done');
      toast.success('Two-factor authentication enabled successfully');
    } catch (e) {
      toast.error('Invalid code: ' + (e.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };

  const copySecret = () => { navigator.clipboard.writeText(secret); toast.success('Secret copied'); };
  const is2FAEnabled = user?.is_2fa_enabled;

  return (
    <div className="space-y-5">
      <Section title="Two-Factor Authentication" description="Add a second layer of protection to your admin account using a TOTP authenticator app.">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            is2FAEnabled || step === 'done' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <Shield size={20} className={is2FAEnabled || step === 'done' ? 'text-emerald-600' : 'text-amber-600'} />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm">
              {is2FAEnabled || step === 'done' ? '2FA is Enabled' : '2FA is Not Enabled'}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {is2FAEnabled || step === 'done'
                ? 'Your account is protected with two-factor authentication.'
                : 'Your account is only protected by password. Enable 2FA to secure admin access.'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'idle' && !is2FAEnabled && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs leading-relaxed">
                  Admin accounts with database access are high-value targets. Two-factor authentication is strongly recommended.
                </p>
              </div>
              <button onClick={handleSetup} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md shadow-indigo-200">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Smartphone size={15} />}
                Set Up Authenticator App
              </button>
            </motion.div>
          )}

          {step === 'idle' && is2FAEnabled && (
            <motion.div key="already" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle size={15} /> Two-factor authentication is active on this account.
              </div>
            </motion.div>
          )}

          {step === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {qrData && (
                  <div className="bg-white border border-gray-200 p-3 rounded-xl shrink-0 shadow-sm">
                    <img src={qrData} alt="2FA QR Code" className="w-40 h-40" />
                  </div>
                )}
                <div className="space-y-3 flex-1">
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, or 1Password).
                  </p>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                    <code className="text-indigo-600 font-mono text-sm flex-1 tracking-widest">
                      {showSecret ? secret : '•'.repeat(secret.length)}
                    </code>
                    <button onClick={() => setShowSecret(v => !v)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={copySecret} className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <button onClick={() => setStep('verify')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all">
                    <ChevronRight size={15} /> I've scanned the code
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-gray-500 text-xs">Enter the 6-digit code currently shown in your authenticator app to confirm setup.</p>
              <div className="flex items-center gap-3">
                <input
                  type="text" inputMode="numeric" maxLength={6} value={token}
                  onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-36 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 font-mono text-xl tracking-[0.4em] text-center focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button onClick={handleVerify} disabled={loading || token.length !== 6}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-md">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  Verify &amp; Enable
                </button>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-emerald-700 font-bold text-sm">2FA Enabled Successfully</p>
                  <p className="text-emerald-600/70 text-xs mt-0.5">Your admin account is now protected with two-factor authentication.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      <Section title="Session Security" description="Information about your current admin session.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Session Token', content: <div className="flex items-center gap-2"><Lock size={12} className="text-indigo-500 shrink-0" /><span className="text-gray-500 text-[10px] font-mono">JWT — Encrypted</span></div> },
            { label: '2FA Status', content: is2FAEnabled || step === 'done'
              ? <div className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500" /><span className="text-emerald-600 text-[10px] font-bold">Enabled</span></div>
              : <div className="flex items-center gap-2"><AlertTriangle size={12} className="text-amber-500" /><span className="text-amber-600 text-[10px] font-bold">Not Enabled</span></div>
            },
            { label: 'Role', content: <div className="flex items-center gap-2"><Shield size={12} className="text-indigo-500 shrink-0" /><span className="text-indigo-600 text-[10px] font-bold capitalize">{user?.admin_role?.replace(/_/g, ' ') || '—'}</span></div> },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{item.label}</p>
              {item.content}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    urgent_reports: true, new_users: true, open_tickets: true,
    system_errors: true, browser_notifs: false, sound_alerts: true,
  });

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const PREF_ITEMS = [
    { key: 'urgent_reports',  label: 'Urgent Moderation Reports',  desc: 'Real-time alerts for newly flagged content requiring action' },
    { key: 'new_users',       label: 'New User Registrations',      desc: 'Daily digest of new signups and account stats' },
    { key: 'open_tickets',    label: 'Open Support Tickets',        desc: 'Alerts when new tickets are raised or escalated' },
    { key: 'system_errors',   label: 'System Error Alerts',         desc: '5xx server errors streamed via SyllaTrace' },
    { key: 'browser_notifs',  label: 'Browser Notifications',       desc: 'Native OS push notifications (requires permission)' },
    { key: 'sound_alerts',    label: 'Sound Alerts',                desc: 'Audio ping when urgent events arrive' },
  ];

  return (
    <div className="space-y-5">
      <Section title="Alert Preferences" description="Control which events trigger notifications in the admin dashboard.">
        <div className="space-y-3">
          {PREF_ITEMS.map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-gray-800 text-sm font-medium">{item.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative rounded-full border transition-all duration-200 shrink-0 ${
                  prefs[item.key] ? 'bg-indigo-500 border-indigo-500' : 'bg-gray-200 border-gray-300'
                }`}
                style={{ width: 40, height: 22 }}
              >
                <span className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200 ${
                  prefs[item.key] ? 'left-[20px]' : 'left-[2px]'
                }`} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-gray-300 text-[10px] mt-4">
          Preferences are saved locally per browser session. Admin-wide notification rules are managed at the system level.
        </p>
      </Section>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center">
          <Shield size={18} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-gray-900 font-bold text-lg leading-tight">Admin Settings</h2>
          <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest">Profile · Security · Preferences</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex-1 justify-center ${
              tab === t.key
                ? 'bg-white text-indigo-700 border border-indigo-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {tab === 'profile'       && <ProfileTab user={user} />}
          {tab === '2fa'           && <TwoFATab user={user} />}
          {tab === 'notifications' && <NotificationsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
