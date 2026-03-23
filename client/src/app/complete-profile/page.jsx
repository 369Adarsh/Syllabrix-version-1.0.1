'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api/auth.api';
import Image from 'next/image';
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'Other'];
const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12','UG','PG','Other'];
const TEACHER_TYPES = ['Freelancer', 'Institute Affiliated', 'Both'];
const INSTITUTE_TYPES = ['School', 'College', 'Coaching Center', 'Online Academy', 'Other'];
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Other'];
const INTERESTS = ['Science','Mathematics','Technology','History','Geography','English','Hindi','Arts','Music','Sports','Business','Coding','Medicine','Law','Design','Photography','Writing','Social Work'];

export default function CompleteProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name:'', phone:'', gender:'', city:'', state:'',
    school_name:'', class_name:'', board:'',
    subject_primary:'', teacher_type:'', experience_years:'', qualification:'',
    institute_type:'', name:'', website:'',
    relationship:'', child_username:'',
    interests:[], dream_career:'', languages:'', bio:'',
  });

  useEffect(() => {
    if (!user) router.push('/sign-in');
    else if (user.is_profile_complete) router.push('/home');
  }, [user, router]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleInterest = (i) => setForm(p => ({ ...p, interests: p.interests.includes(i) ? p.interests.filter(x=>x!==i) : [...p.interests, i] }));

  const type = user?.user_type || 'student';

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { toast.error('Full name is required'); return; }
    setLoading(true);
    try {
      const data = { ...form, interests: form.interests.join(', ') };
      Object.keys(data).forEach(k => { if (!data[k] || (typeof data[k]==='string' && !data[k].trim())) delete data[k]; });
      await authAPI.completeProfile(type, data);
      await refreshUser();
      toast.success('Welcome to Syllabrix!');
      window.location.href = '/home'; // FORCE redirect — no Next.js router issues
    } catch (err) { toast.error(err.response?.data?.message || 'Could not save profile'); }
    finally { setLoading(false); }
  };

  if (!user) return null;

  const Inp = ({ label, name, required, placeholder, type:t='text' }) => (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">{label} {required && <span className="text-red-400">*</span>}</label>
      <input type={t} value={form[name]||''} onChange={e=>update(name,e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
    </div>
  );

  const Sel = ({ label, name, options, required, placeholder }) => (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">{label} {required && <span className="text-red-400">*</span>}</label>
      <select value={form[name]||''} onChange={e=>update(name,e.target.value)} required={required}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
        <option value="">{placeholder || 'Select...'}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={180} height={50} className="h-10 w-auto mx-auto" priority />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
          {/* Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1,2,3].map(s=>(
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s<step?'bg-emerald-500 text-white':s===step?'bg-blue-600 text-white shadow-md shadow-blue-200/40':'bg-gray-100 text-gray-400'}`}>{s<step?<CheckCircle size={14}/>:s}</div>
                {s<3 && <div className={`w-10 h-0.5 ${s<step?'bg-emerald-400':'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step===1 && (
            <div className="space-y-4">
              <div><h2 className="text-lg font-extrabold text-gray-900">Basic Information</h2><p className="text-xs text-gray-400 mt-0.5">Fields with <span className="text-red-400">*</span> are required</p></div>
              <Inp label="Full Name" name="full_name" required placeholder="Enter your full name" />
              <Inp label="Phone Number" name="phone" placeholder="+91 XXXXX XXXXX" type="tel" />
              <Sel label="Gender" name="gender" options={['Male','Female','Other','Prefer not to say']} />
              <div className="grid grid-cols-2 gap-3">
                <Inp label="City" name="city" placeholder="Your city" />
                <Sel label="State" name="state" options={STATES} />
              </div>
              <button onClick={()=>{if(!form.full_name.trim()){toast.error('Full name is required');return;}setStep(2);}}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 transition-all">Next <ArrowRight size={14}/></button>
            </div>
          )}

          {/* STEP 2 */}
          {step===2 && (
            <div className="space-y-4">
              <div><h2 className="text-lg font-extrabold text-gray-900 capitalize">{type} Details</h2><p className="text-xs text-gray-400">Helps us personalize your experience</p></div>
              {type==='student' && (<><Sel label="Class" name="class_name" options={CLASSES} required placeholder="Select class"/><Sel label="Board" name="board" options={BOARDS} required placeholder="Select board"/><Inp label="School Name" name="school_name" placeholder="Your school"/></>)}
              {type==='teacher' && (<><Inp label="Primary Subject" name="subject_primary" required placeholder="e.g. Mathematics"/><Sel label="Teacher Type" name="teacher_type" options={TEACHER_TYPES} required/><Inp label="Experience (years)" name="experience_years" type="number" placeholder="e.g. 5"/><Inp label="Qualification" name="qualification" placeholder="e.g. M.Sc., B.Ed."/></>)}
              {type==='institute' && (<><Inp label="Institute Name" name="name" required placeholder="Institute name"/><Sel label="Type" name="institute_type" options={INSTITUTE_TYPES} required/><Inp label="Website" name="website" placeholder="https://..."/></>)}
              {type==='parent' && (<><Sel label="Relationship" name="relationship" options={['Mother','Father','Guardian','Other']} required/><Inp label="Child's Username" name="child_username" placeholder="Child's Syllabrix username"/></>)}
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200">Back</button>
                <button onClick={()=>setStep(3)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">Next <ArrowRight size={14}/></button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step===3 && (
            <div className="space-y-4">
              <div><h2 className="text-lg font-extrabold text-gray-900">Interests & Goals</h2><p className="text-xs text-gray-400">Optional — helps AI personalize (you can skip)</p></div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Your Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map(i=>(<button key={i} type="button" onClick={()=>toggleInterest(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.interests.includes(i)?'bg-blue-600 text-white':'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-blue-50'}`}>{i}</button>))}
                </div>
              </div>
              <Inp label="Dream Career" name="dream_career" placeholder="e.g. Software Engineer, Doctor" />
              <Inp label="Languages Known" name="languages" placeholder="e.g. Hindi, English, Gujarati" />
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={e=>update('bio',e.target.value)} placeholder="Tell us about yourself..." rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"/>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200">Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md disabled:opacity-50">
                  {loading?<Loader2 size={14} className="animate-spin"/>:<CheckCircle size={14}/>}{loading?'Saving...':'Complete & Go'}
                </button>
              </div>
              <button onClick={handleSubmit} className="w-full text-center text-xs text-gray-400 hover:text-blue-600 font-medium py-2">Skip for now →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
