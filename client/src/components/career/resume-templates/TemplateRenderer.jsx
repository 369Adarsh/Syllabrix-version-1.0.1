// TemplateRenderer — renders any of the 30 resume templates from a config object.
// All templates output a 210mm × 297mm (A4) white container suitable for html2canvas → PDF.

import React from 'react';

// ── Shared helpers ────────────────────────────────────────────────────────────

const SKILL_LEVELS = { expert: 95, advanced: 80, intermediate: 60, beginner: 40 };

const skillPct = (s) => SKILL_LEVELS[s?.level?.toLowerCase()] ?? 65;

const initials = (name = '') =>
  name.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '';

// ── Section heading styles per layout ────────────────────────────────────────
const SectionHeading = ({ label, color, variant = 'line' }) => {
  if (variant === 'line') return (
    <div className="flex items-center gap-3 mb-3">
      <h3 style={{ color, fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </h3>
      <div style={{ flex: 1, height: '1px', backgroundColor: color, opacity: 0.3 }} />
    </div>
  );
  if (variant === 'block') return (
    <div style={{ backgroundColor: color, padding: '3px 8px', marginBottom: '10px', display: 'inline-block' }}>
      <h3 style={{ color: '#fff', fontSize: '8px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        {label}
      </h3>
    </div>
  );
  if (variant === 'underline') return (
    <div style={{ marginBottom: '10px' }}>
      <h3 style={{ color, fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: `2px solid ${color}`, paddingBottom: '3px', display: 'inline-block' }}>
        {label}
      </h3>
    </div>
  );
  return null;
};

// ── Experience item ───────────────────────────────────────────────────────────
const ExpItem = ({ item, accent, compact = false }) => (
  <div style={{ marginBottom: compact ? '10px' : '14px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
      <div>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
          {item.role || item.title || 'Role'}
        </div>
        <div style={{ fontSize: '9px', fontWeight: 700, color: accent, marginTop: '1px' }}>
          {item.company || item.company_name || ''}
        </div>
      </div>
      <div style={{ fontSize: '8px', color: '#9CA3AF', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '8px', marginTop: '1px' }}>
        {item.period || ''}
      </div>
    </div>
    {item.description && (
      <p style={{ fontSize: '8.5px', color: '#4B5563', lineHeight: 1.5, marginTop: '3px' }}>
        {item.description}
      </p>
    )}
    {Array.isArray(item.bullets) && item.bullets.slice(0, 3).map((b, i) => (
      <div key={i} style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
        <span style={{ color: accent, marginTop: '1px', fontSize: '8px' }}>▸</span>
        <span style={{ fontSize: '8px', color: '#4B5563', lineHeight: 1.4 }}>{b}</span>
      </div>
    ))}
  </div>
);

// ── Skill pill ────────────────────────────────────────────────────────────────
const SkillBar = ({ skill, accent, onDark = false }) => (
  <div style={{ marginBottom: '6px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
      <span style={{ fontSize: '8px', fontWeight: 700, color: onDark ? '#F1F5F9' : '#374151' }}>
        {skill.name || skill}
      </span>
      <span style={{ fontSize: '7px', color: onDark ? '#94A3B8' : '#9CA3AF' }}>
        {skill.level || 'intermediate'}
      </span>
    </div>
    <div style={{ height: '3px', backgroundColor: onDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${skillPct(skill)}%`, backgroundColor: accent, borderRadius: '2px' }} />
    </div>
  </div>
);

const SkillPill = ({ skill, bg, text }) => (
  <span style={{
    display: 'inline-block', margin: '2px', padding: '2px 7px',
    backgroundColor: bg, color: text, borderRadius: '4px',
    fontSize: '7.5px', fontWeight: 700,
  }}>
    {skill.name || skill}
  </span>
);

// ── Contact row ───────────────────────────────────────────────────────────────
const ContactRow = ({ icon, value, color }) => (
  value ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
      <span style={{ fontSize: '8px', color }}>{icon}</span>
      <span style={{ fontSize: '8px', color: '#374151', wordBreak: 'break-all' }}>{value}</span>
    </div>
  ) : null
);

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT 1 — CLASSIC
// Full-width name header with colour underline, stacked sections
// ═══════════════════════════════════════════════════════════════════════════════
function ClassicLayout({ data, t }) {
  const c = t.colors;
  const { name, role, email, phone, city, bio, workHistory, skills, certifications } = data;

  return (
    <div style={{ width: '210mm', minHeight: '297mm', backgroundColor: c.bg, fontFamily: 'sans-serif', padding: '14mm 16mm', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ borderBottom: `4px solid ${c.primary}`, paddingBottom: '8px', marginBottom: '14px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: c.primary, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0 }}>
          {name}
        </h1>
        <div style={{ fontSize: '11px', fontWeight: 700, color: c.accent, letterSpacing: '0.08em', marginTop: '3px' }}>
          {role}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
          {email && <span style={{ fontSize: '8px', color: c.muted }}>✉ {email}</span>}
          {phone && <span style={{ fontSize: '8px', color: c.muted }}>✆ {phone}</span>}
          {city  && <span style={{ fontSize: '8px', color: c.muted }}>⌖ {city}</span>}
        </div>
      </div>

      {/* Summary */}
      {bio && (
        <div style={{ marginBottom: '14px' }}>
          <SectionHeading label="Summary" color={c.primary} variant="line" />
          <p style={{ fontSize: '9px', color: '#374151', lineHeight: 1.6 }}>{bio}</p>
        </div>
      )}

      {/* Two column: Experience left, Skills right */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Experience */}
        <div style={{ flex: 2 }}>
          <SectionHeading label="Experience" color={c.primary} variant="line" />
          {workHistory?.slice(0, 4).map((item, i) => (
            <ExpItem key={i} item={item} accent={c.accent} />
          ))}
        </div>

        {/* Right column */}
        <div style={{ flex: 1 }}>
          {/* Skills */}
          <div style={{ marginBottom: '14px' }}>
            <SectionHeading label="Skills" color={c.primary} variant="line" />
            {skills?.slice(0, 8).map((s, i) => (
              <SkillBar key={i} skill={s} accent={c.accent} />
            ))}
          </div>

          {/* Certifications */}
          {certifications?.length > 0 && (
            <div>
              <SectionHeading label="Certifications" color={c.primary} variant="line" />
              {certifications.slice(0, 4).map((cert, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#111827' }}>{cert.title}</div>
                  <div style={{ fontSize: '7.5px', color: c.muted }}>{cert.issuer}{cert.issue_date ? ` · ${formatDate(cert.issue_date)}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT 2 — SIDEBAR LEFT
// Dark sidebar (contact + skills + certs), white main (name + exp)
// ═══════════════════════════════════════════════════════════════════════════════
function SidebarLeftLayout({ data, t }) {
  const c = t.colors;
  const { name, role, email, phone, city, bio, workHistory, skills, certifications, initials: ini } = data;

  return (
    <div style={{ width: '210mm', minHeight: '297mm', backgroundColor: c.bg, fontFamily: 'sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '70mm', backgroundColor: c.sidebar, padding: '14mm 10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {/* Avatar */}
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '22px', fontWeight: 900, color: 'rgba(255,255,255,0.6)' }}>{ini}</span>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '7.5px', fontWeight: 900, color: c.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: '4px' }}>
            Contact
          </div>
          {email && <div style={{ fontSize: '8px', color: c.sidebarMuted, marginBottom: '5px', wordBreak: 'break-all' }}>✉ {email}</div>}
          {phone && <div style={{ fontSize: '8px', color: c.sidebarMuted, marginBottom: '5px' }}>✆ {phone}</div>}
          {city  && <div style={{ fontSize: '8px', color: c.sidebarMuted, marginBottom: '5px' }}>⌖ {city}</div>}
        </div>

        {/* Skills */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '7.5px', fontWeight: 900, color: c.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: '4px' }}>
            Skills
          </div>
          {skills?.slice(0, 9).map((s, i) => (
            <SkillBar key={i} skill={s} accent={c.accent} onDark />
          ))}
        </div>

        {/* Certifications */}
        {certifications?.length > 0 && (
          <div>
            <div style={{ fontSize: '7.5px', fontWeight: 900, color: c.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: '4px' }}>
              Certifications
            </div>
            {certifications.slice(0, 4).map((cert, i) => (
              <div key={i} style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: '8px', fontWeight: 700, color: c.sidebarText }}>{cert.title}</div>
                <div style={{ fontSize: '7px', color: c.sidebarMuted }}>{cert.issuer}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '14mm 12mm 14mm 10mm', boxSizing: 'border-box' }}>
        {/* Name + Role */}
        <div style={{ marginBottom: '14px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', letterSpacing: '-0.3px', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>
            {name}
          </h1>
          <div style={{ fontSize: '10px', fontWeight: 700, color: c.accent, marginTop: '4px', letterSpacing: '0.05em' }}>
            {role}
          </div>
          {bio && (
            <p style={{ fontSize: '8.5px', color: '#6B7280', lineHeight: 1.5, marginTop: '8px', borderLeft: `2px solid ${c.accent}`, paddingLeft: '8px' }}>
              {bio.slice(0, 220)}
            </p>
          )}
        </div>

        {/* Experience */}
        <div>
          <SectionHeading label="Experience" color={c.accent} variant="underline" />
          {workHistory?.slice(0, 5).map((item, i) => (
            <ExpItem key={i} item={item} accent={c.accent} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT 3 — SIDEBAR RIGHT
// White main content, light-coloured right sidebar
// ═══════════════════════════════════════════════════════════════════════════════
function SidebarRightLayout({ data, t }) {
  const c = t.colors;
  const { name, role, email, phone, city, bio, workHistory, skills, certifications } = data;

  return (
    <div style={{ width: '210mm', minHeight: '297mm', backgroundColor: c.bg, fontFamily: 'sans-serif', display: 'flex' }}>
      {/* Main */}
      <div style={{ flex: 1, padding: '14mm 10mm 14mm 14mm', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ marginBottom: '14px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', letterSpacing: '-0.3px', textTransform: 'uppercase', margin: 0 }}>
            {name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{ width: '32px', height: '3px', backgroundColor: c.accent, borderRadius: '2px' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: c.primary }}>{role}</span>
          </div>
        </div>

        {/* Summary */}
        {bio && (
          <div style={{ marginBottom: '12px' }}>
            <SectionHeading label="Profile" color={c.primary} variant="line" />
            <p style={{ fontSize: '8.5px', color: '#4B5563', lineHeight: 1.6 }}>{bio.slice(0, 250)}</p>
          </div>
        )}

        {/* Experience */}
        <SectionHeading label="Work Experience" color={c.primary} variant="line" />
        {workHistory?.slice(0, 5).map((item, i) => (
          <ExpItem key={i} item={item} accent={c.accent} />
        ))}
      </div>

      {/* Sidebar */}
      <div style={{ width: '68mm', backgroundColor: c.sidebar, borderLeft: `1px solid ${c.sidebarBorder}`, padding: '14mm 10mm', boxSizing: 'border-box' }}>
        {/* Contact */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '7.5px', fontWeight: 900, color: c.primary, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Contact</div>
          {email && <div style={{ fontSize: '8px', color: c.sidebarText, marginBottom: '5px', wordBreak: 'break-all' }}>✉ {email}</div>}
          {phone && <div style={{ fontSize: '8px', color: c.sidebarText, marginBottom: '5px' }}>✆ {phone}</div>}
          {city  && <div style={{ fontSize: '8px', color: c.sidebarText, marginBottom: '5px' }}>⌖ {city}</div>}
        </div>

        {/* Skills */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '7.5px', fontWeight: 900, color: c.primary, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {skills?.slice(0, 10).map((s, i) => (
              <SkillPill key={i} skill={s} bg={`${c.accent}20`} text={c.sidebarText} />
            ))}
          </div>
        </div>

        {/* Certs */}
        {certifications?.length > 0 && (
          <div>
            <div style={{ fontSize: '7.5px', fontWeight: 900, color: c.primary, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Certifications</div>
            {certifications.slice(0, 5).map((cert, i) => (
              <div key={i} style={{ marginBottom: '7px', padding: '5px 7px', backgroundColor: `${c.accent}15`, borderRadius: '6px', borderLeft: `2px solid ${c.accent}` }}>
                <div style={{ fontSize: '8px', fontWeight: 700, color: c.sidebarText }}>{cert.title}</div>
                <div style={{ fontSize: '7px', color: c.primary, marginTop: '1px' }}>{cert.issuer}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT 4 — MINIMAL
// Clean all-white, typographic hierarchy, thin rules only
// ═══════════════════════════════════════════════════════════════════════════════
function MinimalLayout({ data, t }) {
  const c = t.colors;
  const { name, role, email, phone, city, bio, workHistory, skills, certifications } = data;

  return (
    <div style={{ width: '210mm', minHeight: '297mm', backgroundColor: c.bg, fontFamily: 'Georgia, serif', padding: '16mm 18mm', boxSizing: 'border-box' }}>
      {/* Name */}
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: c.text, letterSpacing: '-0.5px', margin: 0, lineHeight: 1 }}>
          {name}
        </h1>
        <div style={{ fontSize: '11px', color: c.primary, fontStyle: 'italic', marginTop: '4px' }}>{role}</div>
        <div style={{ height: '1px', backgroundColor: c.rule, marginTop: '10px' }} />
        <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
          {email && <span style={{ fontSize: '8px', color: c.muted, fontFamily: 'sans-serif' }}>{email}</span>}
          {phone && <span style={{ fontSize: '8px', color: c.muted, fontFamily: 'sans-serif' }}>{phone}</span>}
          {city  && <span style={{ fontSize: '8px', color: c.muted, fontFamily: 'sans-serif' }}>{city}</span>}
        </div>
      </div>

      {/* Summary */}
      {bio && (
        <div style={{ marginBottom: '14px' }}>
          <p style={{ fontSize: '9.5px', color: '#4B5563', lineHeight: 1.7, fontStyle: 'italic' }}>{bio.slice(0, 280)}</p>
          <div style={{ height: '1px', backgroundColor: c.rule, marginTop: '12px' }} />
        </div>
      )}

      {/* Three column: exp | skills | certs */}
      <div style={{ display: 'flex', gap: '14px' }}>
        {/* Experience */}
        <div style={{ flex: 3 }}>
          <div style={{ fontSize: '8px', fontWeight: 700, color: c.primary, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'sans-serif' }}>
            Experience
          </div>
          {workHistory?.slice(0, 5).map((item, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: c.text, lineHeight: 1.2 }}>{item.role || item.title}</div>
              <div style={{ fontSize: '8.5px', color: c.primary, marginTop: '1px' }}>{item.company}</div>
              <div style={{ fontSize: '7.5px', color: c.muted, marginTop: '1px', fontStyle: 'italic' }}>{item.period}</div>
              {item.description && (
                <p style={{ fontSize: '8.5px', color: '#6B7280', lineHeight: 1.5, marginTop: '3px' }}>{item.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Skills + Certs */}
        <div style={{ flex: 1.2, borderLeft: `1px solid ${c.rule}`, paddingLeft: '12px' }}>
          <div style={{ fontSize: '8px', fontWeight: 700, color: c.primary, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'sans-serif' }}>
            Skills
          </div>
          {skills?.slice(0, 8).map((s, i) => (
            <div key={i} style={{ fontSize: '8.5px', color: c.text, marginBottom: '5px', paddingLeft: '8px', borderLeft: `2px solid ${c.accent}20` }}>
              {s.name || s}
            </div>
          ))}

          {certifications?.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '8px', fontWeight: 700, color: c.primary, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'sans-serif' }}>
                Certifications
              </div>
              {certifications.slice(0, 4).map((cert, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '8.5px', fontWeight: 600, color: c.text }}>{cert.title}</div>
                  <div style={{ fontSize: '7.5px', color: c.muted, fontStyle: 'italic' }}>{cert.issuer}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT 5 — TWO COLUMN
// Equal-split columns: left (summary + exp), right (skills + certs + contact)
// ═══════════════════════════════════════════════════════════════════════════════
function TwoColLayout({ data, t }) {
  const c = t.colors;
  const { name, role, email, phone, city, bio, workHistory, skills, certifications } = data;

  return (
    <div style={{ width: '210mm', minHeight: '297mm', backgroundColor: c.bg, fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      {/* Header bar */}
      <div style={{ backgroundColor: c.left, borderBottom: `3px solid ${c.primary}`, padding: '12mm 14mm 10mm', boxSizing: 'border-box' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: c.primary, textTransform: 'uppercase', margin: 0, letterSpacing: '-0.3px' }}>
          {name}
        </h1>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151', marginTop: '3px' }}>{role}</div>
        <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
          {email && <span style={{ fontSize: '8px', color: '#6B7280' }}>✉ {email}</span>}
          {phone && <span style={{ fontSize: '8px', color: '#6B7280' }}>✆ {phone}</span>}
          {city  && <span style={{ fontSize: '8px', color: '#6B7280' }}>⌖ {city}</span>}
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left */}
        <div style={{ flex: 1.6, padding: '12mm 10mm 12mm 14mm', boxSizing: 'border-box' }}>
          {bio && (
            <div style={{ marginBottom: '12px' }}>
              <SectionHeading label="Profile Summary" color={c.primary} variant="line" />
              <p style={{ fontSize: '8.5px', color: '#4B5563', lineHeight: 1.6 }}>{bio.slice(0, 220)}</p>
            </div>
          )}
          <SectionHeading label="Work Experience" color={c.primary} variant="line" />
          {workHistory?.slice(0, 4).map((item, i) => (
            <ExpItem key={i} item={item} accent={c.accent} />
          ))}
        </div>

        {/* Right */}
        <div style={{ flex: 1, backgroundColor: c.left, padding: '12mm 12mm 12mm 10mm', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '14px' }}>
            <SectionHeading label="Core Skills" color={c.primary} variant="line" />
            {skills?.slice(0, 8).map((s, i) => (
              <SkillBar key={i} skill={s} accent={c.accent} />
            ))}
          </div>

          {certifications?.length > 0 && (
            <div>
              <SectionHeading label="Certifications" color={c.primary} variant="line" />
              {certifications.slice(0, 5).map((cert, i) => (
                <div key={i} style={{ marginBottom: '7px', padding: '5px 7px', backgroundColor: '#ffffff', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '8.5px', fontWeight: 700, color: c.primary }}>{cert.title}</div>
                  <div style={{ fontSize: '7.5px', color: '#6B7280' }}>{cert.issuer}{cert.issue_date ? ` · ${formatDate(cert.issue_date)}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT 6 — BOLD HEADER
// Full-bleed colour header block, clean white body
// ═══════════════════════════════════════════════════════════════════════════════
function BoldHeaderLayout({ data, t }) {
  const c = t.colors;
  const { name, role, email, phone, city, bio, workHistory, skills, certifications } = data;

  return (
    <div style={{ width: '210mm', minHeight: '297mm', backgroundColor: c.bg, fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      {/* Big header */}
      <div style={{ backgroundColor: c.header, padding: '12mm 16mm 10mm', boxSizing: 'border-box' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: c.headerText, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>
          {name}
        </h1>
        <div style={{ fontSize: '12px', fontWeight: 600, color: `${c.headerText}cc`, marginTop: '4px', letterSpacing: '0.05em' }}>{role}</div>
        <div style={{ display: 'flex', gap: '14px', marginTop: '10px', flexWrap: 'wrap' }}>
          {email && <span style={{ fontSize: '8px', color: `${c.headerText}99` }}>✉ {email}</span>}
          {phone && <span style={{ fontSize: '8px', color: `${c.headerText}99` }}>✆ {phone}</span>}
          {city  && <span style={{ fontSize: '8px', color: `${c.headerText}99` }}>⌖ {city}</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', gap: '0' }}>
        {/* Main */}
        <div style={{ flex: 2, padding: '12mm 10mm 12mm 16mm', boxSizing: 'border-box' }}>
          {bio && (
            <div style={{ marginBottom: '12px' }}>
              <SectionHeading label="About" color={c.accent} variant="block" />
              <p style={{ fontSize: '8.5px', color: '#4B5563', lineHeight: 1.6, marginTop: '6px' }}>{bio.slice(0, 220)}</p>
            </div>
          )}
          <SectionHeading label="Experience" color={c.accent} variant="block" />
          <div style={{ marginTop: '6px' }}>
            {workHistory?.slice(0, 5).map((item, i) => (
              <ExpItem key={i} item={item} accent={c.accent} compact />
            ))}
          </div>
        </div>

        {/* Side */}
        <div style={{ flex: 1, padding: '12mm 14mm 12mm 10mm', boxSizing: 'border-box', borderLeft: `1px solid ${c.rule}` }}>
          <div style={{ marginBottom: '14px' }}>
            <SectionHeading label="Skills" color={c.accent} variant="block" />
            <div style={{ marginTop: '6px' }}>
              {skills?.slice(0, 8).map((s, i) => (
                <SkillBar key={i} skill={s} accent={c.accent} />
              ))}
            </div>
          </div>

          {certifications?.length > 0 && (
            <div>
              <SectionHeading label="Certifications" color={c.accent} variant="block" />
              <div style={{ marginTop: '6px' }}>
                {certifications.slice(0, 4).map((cert, i) => (
                  <div key={i} style={{ marginBottom: '7px' }}>
                    <div style={{ fontSize: '8.5px', fontWeight: 700, color: c.accent }}>{cert.title}</div>
                    <div style={{ fontSize: '7.5px', color: '#9CA3AF' }}>{cert.issuer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — picks correct layout, normalises data
// ═══════════════════════════════════════════════════════════════════════════════
export default function TemplateRenderer({ template, user, profile, workHistory, skills, certifications, optimizedText }) {
  if (!template) return null;

  const name  = user?.full_name || user?.username || 'Your Name';
  const email = user?.email || '';
  const phone = user?.phone || '';
  const city  = [user?.city, user?.state].filter(Boolean).join(', ') || '';
  const role  = profile?.current_role || profile?.designation || '';
  const bio   = optimizedText || user?.bio || '';

  const data = {
    name, email, phone, city, role, bio,
    initials: initials(name),
    workHistory: workHistory || [],
    skills: skills || [],
    certifications: certifications || [],
  };

  const props = { data, t: template };

  switch (template.layout) {
    case 'sidebar-left':  return <SidebarLeftLayout  {...props} />;
    case 'sidebar-right': return <SidebarRightLayout {...props} />;
    case 'minimal':       return <MinimalLayout      {...props} />;
    case 'two-col':       return <TwoColLayout       {...props} />;
    case 'bold-header':   return <BoldHeaderLayout   {...props} />;
    case 'classic':
    default:              return <ClassicLayout      {...props} />;
  }
}
