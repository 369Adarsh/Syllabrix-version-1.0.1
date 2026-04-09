'use client';
import { CalendarDays, MapPin, ExternalLink, Users, Laptop } from 'lucide-react';

const EVENTS = [
  {
    name: 'SAP TechEd India 2026',
    type: 'Conference',
    date: 'May 2026',
    location: 'Bangalore',
    mode: 'In-person',
    audience: 'SAP professionals',
    url: 'https://events.sap.com',
    highlight: true,
  },
  {
    name: 'AWS re:Invent India Road Show',
    type: 'Summit',
    date: 'June 2026',
    location: 'Mumbai · Delhi · Bangalore',
    mode: 'In-person',
    audience: 'Cloud developers',
    url: 'https://aws.amazon.com/events',
  },
  {
    name: 'Google Cloud Next India',
    type: 'Conference',
    date: 'July 2026',
    location: 'Hyderabad',
    mode: 'Hybrid',
    audience: 'Cloud & AI engineers',
    url: 'https://cloud.withgoogle.com/next',
  },
  {
    name: 'Microsoft Build India',
    type: 'Conference',
    date: 'Aug 2026',
    location: 'Bangalore',
    mode: 'Hybrid',
    audience: '.NET, Azure, Power Platform',
    url: 'https://build.microsoft.com',
  },
  {
    name: 'KubeCon India',
    type: 'Conference',
    date: 'Sep 2026',
    location: 'Pune',
    mode: 'In-person',
    audience: 'DevOps, Platform engineers',
    url: 'https://events.linuxfoundation.org',
  },
  {
    name: 'Nasscom Technology Conference',
    type: 'Industry event',
    date: 'Oct 2026',
    location: 'Delhi NCR',
    mode: 'In-person',
    audience: 'Tech leaders, startups',
    url: 'https://nasscom.in/events',
    highlight: true,
  },
  {
    name: 'PyData India',
    type: 'Meetup/Conference',
    date: 'Nov 2026',
    location: 'Bangalore',
    mode: 'Hybrid',
    audience: 'Data scientists, ML engineers',
    url: 'https://pydata.org',
  },
  {
    name: 'React India',
    type: 'Conference',
    date: 'Oct 2026',
    location: 'Goa',
    mode: 'In-person',
    audience: 'Frontend developers',
    url: 'https://reactindia.io',
  },
  {
    name: 'SAP Inside Track India',
    type: 'Community event',
    date: 'Monthly',
    location: 'Various cities',
    mode: 'Hybrid',
    audience: 'SAP community',
    url: 'https://sapinsidetrack.com',
  },
  {
    name: 'Agile India',
    type: 'Conference',
    date: 'Mar 2026',
    location: 'Bangalore',
    mode: 'In-person',
    audience: 'Agile practitioners, PMs',
    url: 'https://agileindia.org',
  },
];

const ONLINE = [
  { name: 'SAP Learning Hub — Live Sessions', freq: 'Weekly', url: 'https://training.sap.com/learninghub', desc: 'SAP BTP, ABAP, Integration Suite hands-on labs' },
  { name: 'AWS Skill Builder Live', freq: 'Daily', url: 'https://skillbuilder.aws', desc: 'Free cloud labs with certification prep' },
  { name: 'Google Cloud Innovators Summit (Virtual)', freq: 'Quarterly', url: 'https://cloud.google.com/innovators', desc: 'Free access with Cloud Innovators membership' },
  { name: 'Microsoft Learn Live', freq: 'Weekly', url: 'https://learn.microsoft.com/live', desc: 'Free instructor-led training sessions' },
];

const MODE_STYLES = {
  'In-person': 'bg-purple-50 text-purple-700',
  'Hybrid':    'bg-blue-50 text-blue-700',
  'Virtual':   'bg-green-50 text-green-700',
};

export default function EventsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays size={20} className="text-purple-600" /> Events & Networking
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Upcoming tech conferences, summits, and networking events — India 2026</p>
      </div>

      {/* In-person events */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Conferences & Summits</p>
        {EVENTS.map((ev, i) => (
          <div
            key={i}
            className={`bg-white border rounded-xl p-4 hover:border-purple-200 transition-colors ${ev.highlight ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-semibold text-gray-800">{ev.name}</p>
                  {ev.highlight && (
                    <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">Featured</span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><CalendarDays size={10} />{ev.date}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} />{ev.location}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${MODE_STYLES[ev.mode] || 'bg-gray-100 text-gray-500'}`}>
                    {ev.mode}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <Users size={10} /> {ev.audience}
                </p>
              </div>
              <a
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors flex-shrink-0"
              >
                Info <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Online learning events */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Free Online Learning Events</p>
        {ONLINE.map((ev, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 mb-0.5">{ev.name}</p>
                <p className="text-[11px] text-gray-500 mb-1">{ev.desc}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium flex items-center gap-0.5">
                    <Laptop size={9} /> Online
                  </span>
                  <span className="text-[11px] text-gray-400">{ev.freq}</span>
                </div>
              </div>
              <a
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-100 transition-colors flex-shrink-0"
              >
                Join free <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 text-center pb-4">
        Dates are approximate. Check event websites for exact schedules.
      </p>
    </div>
  );
}
