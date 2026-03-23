'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentsAPI } from '@/lib/api/payments.api';
import Link from 'next/link';
import {
  Award, Download, ExternalLink, Loader2, QrCode, CheckCircle,
  Shield, Star, Calendar, FileText, ArrowLeft, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_STYLES = {
  skill_completion: { bg: 'from-blue-500 to-indigo-600', label: 'Skill', emoji: '💡' },
  course_completion: { bg: 'from-emerald-500 to-teal-600', label: 'Course', emoji: '📚' },
  quiz_achievement: { bg: 'from-purple-500 to-fuchsia-600', label: 'Quiz', emoji: '🧠' },
  experience_lab: { bg: 'from-amber-500 to-orange-600', label: 'Experience', emoji: '🔬' },
  mentorship: { bg: 'from-rose-500 to-pink-600', label: 'Mentorship', emoji: '🤝' },
  streak_milestone: { bg: 'from-orange-500 to-red-600', label: 'Streak', emoji: '🔥' },
};

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI.getMyCertificates()
      .then(r => setCertificates(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExportPDF = (cert) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${cert.title} — Syllabrix Certificate</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc}
    .cert{width:800px;padding:60px;background:white;border:3px solid #4F46E5;border-radius:16px;text-align:center;position:relative;overflow:hidden}
    .cert::before{content:'';position:absolute;top:0;left:0;right:0;height:8px;background:linear-gradient(90deg,#4F46E5,#7C3AED,#EC4899)}
    .logo{font-size:28px;font-weight:800;color:#4F46E5;letter-spacing:-0.5px;margin-bottom:6px}
    .subtitle{font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:30px}
    h1{font-size:14px;color:#64748b;margin-bottom:8px}
    .name{font-size:32px;font-weight:800;color:#1e293b;margin-bottom:6px}
    .title{font-size:20px;color:#4F46E5;font-weight:700;margin:20px 0 10px}
    .desc{font-size:14px;color:#64748b;max-width:500px;margin:0 auto 20px}
    .skills{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:16px 0}
    .skill{background:#EEF2FF;color:#4F46E5;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600}
    .score{font-size:40px;font-weight:800;color:#059669;margin:10px 0}
    .grade{font-size:16px;color:#059669;font-weight:700;margin-bottom:20px}
    .qr{margin:24px auto;padding:16px;background:#f8fafc;border-radius:12px;display:inline-block}
    .qr-code{font-family:monospace;font-size:14px;font-weight:700;color:#4F46E5;letter-spacing:0.1em}
    .verify{font-size:11px;color:#94a3b8;margin-top:6px}
    .date{font-size:12px;color:#94a3b8;margin-top:20px}
    .footer{margin-top:20px;font-size:10px;color:#cbd5e1}
    @media print{body{background:white}.cert{border:2px solid #4F46E5;box-shadow:none}}</style></head><body>
    <div class="cert">
      <div class="logo">SyllabriX</div>
      <div class="subtitle">Certificate of Achievement</div>
      <h1>This is to certify that</h1>
      <div class="name">${user?.username || 'Student'}</div>
      <div class="title">${cert.title}</div>
      ${cert.description ? `<div class="desc">${cert.description}</div>` : ''}
      ${cert.skills?.length ? `<div class="skills">${cert.skills.map(s => `<span class="skill">${s}</span>`).join('')}</div>` : ''}
      ${cert.score ? `<div class="score">${cert.score}%</div>` : ''}
      ${cert.grade ? `<div class="grade">Grade: ${cert.grade}</div>` : ''}
      <div class="qr">
        <div class="qr-code">${cert.qr_code}</div>
        <div class="verify">Verify at: ${cert.verification_url}</div>
      </div>
      <div class="date">Issued: ${new Date(cert.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div class="footer">Syllabrix — India's Education Ecosystem · syllabrix.com</div>
    </div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
            <Award size={24} className="text-amber-200" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Skills Passport & Certificates</h1>
            <p className="text-amber-200/70 text-sm mt-0.5">QR-verified certificates for school admissions, scholarships & more</p>
          </div>
          <Link href="/pricing" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-sm">
            <Star size={13} /> Upgrade for Unlimited
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center"><Loader2 size={28} className="animate-spin text-amber-500 mx-auto" /></div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4"><Award size={36} className="text-amber-400" /></div>
          <h2 className="font-bold text-lg text-gray-700 mb-2">No Certificates Yet</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-5">Complete quizzes, experience lab activities, or mentorship sessions to earn your first certificate. Each one is QR-verified and shareable!</p>
          <div className="flex justify-center gap-3">
            <Link href="/prep/daily-quiz" className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all">Take a Quiz</Link>
            <Link href="/experience-lab" className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">Experience Lab</Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certificates.map(cert => {
            const style = TYPE_STYLES[cert.certificate_type] || TYPE_STYLES.skill_completion;
            return (
              <div key={cert.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <span className="text-lg">{style.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{cert.title}</h3>
                    <p className="text-[10px] text-gray-400 capitalize">{style.label} · {new Date(cert.issued_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  {cert.grade && <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{cert.grade}</span>}
                </div>
                {cert.description && <p className="text-[12px] text-gray-500 mb-3 line-clamp-2">{cert.description}</p>}
                {cert.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {cert.skills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold">{s}</span>)}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <QrCode size={12} /> <span className="font-mono">{cert.qr_code}</span>
                    {cert.verified_count > 0 && <span>· {cert.verified_count} verifications</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { navigator.clipboard.writeText(cert.verification_url); toast.success('Link copied!'); }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Copy link"><ExternalLink size={14} className="text-gray-400" /></button>
                    <button onClick={() => handleExportPDF(cert)}
                      className="p-2 rounded-lg hover:bg-amber-50 transition-colors" title="Download PDF"><Download size={14} className="text-amber-500" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
