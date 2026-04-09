'use client';
import { useState } from 'react';
import { BadgeCheck, ExternalLink, TrendingUp, Star } from 'lucide-react';

const CERTS = [
  {
    category: 'SAP',
    items: [
      { name: 'SAP Certified Associate — SAP BTP', provider: 'SAP', level: 'Associate', value: '↑ ₹3–5 LPA', demand: 'Very high', url: 'https://training.sap.com/certification' },
      { name: 'SAP Certified Associate — Integration Suite', provider: 'SAP', level: 'Associate', value: '↑ ₹3–4 LPA', demand: 'High', url: 'https://training.sap.com/certification' },
      { name: 'SAP Certified Professional — ABAP Cloud', provider: 'SAP', level: 'Professional', value: '↑ ₹4–6 LPA', demand: 'High', url: 'https://training.sap.com/certification' },
      { name: 'SAP Certified Associate — S/4HANA', provider: 'SAP', level: 'Associate', value: '↑ ₹2–4 LPA', demand: 'Medium', url: 'https://training.sap.com/certification' },
    ],
  },
  {
    category: 'Cloud',
    items: [
      { name: 'AWS Solutions Architect Associate', provider: 'Amazon', level: 'Associate', value: '↑ ₹4–8 LPA', demand: 'Very high', url: 'https://aws.amazon.com/certification' },
      { name: 'Google Cloud Professional Engineer', provider: 'Google', level: 'Professional', value: '↑ ₹5–10 LPA', demand: 'High', url: 'https://cloud.google.com/certification' },
      { name: 'Microsoft Azure Administrator AZ-104', provider: 'Microsoft', level: 'Associate', value: '↑ ₹3–6 LPA', demand: 'High', url: 'https://learn.microsoft.com/certifications' },
      { name: 'Certified Kubernetes Administrator (CKA)', provider: 'CNCF', level: 'Professional', value: '↑ ₹5–9 LPA', demand: 'High', url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka' },
    ],
  },
  {
    category: 'Data & AI',
    items: [
      { name: 'Google Professional ML Engineer', provider: 'Google', level: 'Professional', value: '↑ ₹6–12 LPA', demand: 'Very high', url: 'https://cloud.google.com/certification/machine-learning-engineer' },
      { name: 'IBM Data Science Professional', provider: 'IBM/Coursera', level: 'Foundation', value: '↑ ₹2–4 LPA', demand: 'Medium', url: 'https://www.coursera.org/professional-certificates/ibm-data-science' },
      { name: 'TensorFlow Developer Certificate', provider: 'Google', level: 'Foundation', value: '↑ ₹2–4 LPA', demand: 'Medium', url: 'https://www.tensorflow.org/certificate' },
      { name: 'Databricks Certified Associate Developer', provider: 'Databricks', level: 'Associate', value: '↑ ₹3–5 LPA', demand: 'High', url: 'https://www.databricks.com/learn/certification' },
    ],
  },
  {
    category: 'Project & Agile',
    items: [
      { name: 'PMP — Project Management Professional', provider: 'PMI', level: 'Professional', value: '↑ ₹3–6 LPA', demand: 'High', url: 'https://www.pmi.org/certifications/project-management-pmp' },
      { name: 'Certified ScrumMaster (CSM)', provider: 'Scrum Alliance', level: 'Foundation', value: '↑ ₹2–4 LPA', demand: 'Medium', url: 'https://www.scrumalliance.org/get-certified/scrum-master-track/certified-scrummaster' },
      { name: 'SAFe Agilist (SA)', provider: 'Scaled Agile', level: 'Foundation', value: '↑ ₹2–3 LPA', demand: 'Medium', url: 'https://scaledagile.com/training/courses/leading-safe' },
    ],
  },
];

const DEMAND_BADGE = {
  'Very high': 'bg-green-50 text-green-700',
  'High':      'bg-blue-50 text-blue-700',
  'Medium':    'bg-gray-100 text-gray-600',
};

const LEVEL_BADGE = {
  'Professional': 'bg-purple-100 text-purple-700',
  'Associate':    'bg-indigo-50 text-indigo-700',
  'Foundation':   'bg-gray-100 text-gray-500',
};

export default function CertificationsPage() {
  const [search, setSearch] = useState('');

  const filtered = search
    ? CERTS.map(c => ({
        ...c,
        items: c.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.provider.toLowerCase().includes(search.toLowerCase())),
      })).filter(c => c.items.length > 0)
    : CERTS;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BadgeCheck size={20} className="text-purple-600" /> Certification Roadmap
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">High-value certifications for Indian tech professionals — 2026</p>
      </div>

      {/* Stats banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-purple-700">+35%</p>
          <p className="text-[11px] text-purple-600">avg salary uplift</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-700">15</p>
          <p className="text-[11px] text-blue-600">top certifications</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-700">2–6mo</p>
          <p className="text-[11px] text-green-600">avg prep time</p>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search certifications..."
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
      />

      {filtered.map(cat => (
        <div key={cat.category} className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{cat.category}</p>
          {cat.items.map((cert, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-gray-800">{cert.name}</p>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-2">{cert.provider}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${LEVEL_BADGE[cert.level] || LEVEL_BADGE.Foundation}`}>
                      {cert.level}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DEMAND_BADGE[cert.demand] || DEMAND_BADGE.Medium}`}>
                      {cert.demand} demand
                    </span>
                    <span className="text-[11px] font-semibold text-green-600 flex items-center gap-0.5">
                      <TrendingUp size={10} /> {cert.value}
                    </span>
                  </div>
                </div>
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-100 transition-colors flex-shrink-0"
                >
                  Learn more <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ))}

      <p className="text-[11px] text-gray-400 text-center pb-4">
        Salary impact estimates based on Indian market data Q1 2026. Individual results vary.
      </p>
    </div>
  );
}
