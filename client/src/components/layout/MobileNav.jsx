'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Sparkles, MessageSquare, GraduationCap } from 'lucide-react';
const items = [
  {href:'/home',icon:Home,label:'Home'},
  {href:'/explore',icon:Search,label:'Explore'},
  {href:'/ai-buddy',icon:Sparkles,label:'AI Buddy'},
  {href:'/messages',icon:MessageSquare,label:'Chat'},
  {href:'/prep',icon:GraduationCap,label:'Prep'},
];
export default function MobileNav() {
  const p = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-14">
        {items.map(item=>{const a=p===item.href;return(
          <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-1 px-3 ${item.href==='/ai-buddy'?'relative':''} ${a?'text-blue-600':'text-gray-400'}`}>
            {item.href==='/ai-buddy' ? (
              <div className="w-10 h-10 -mt-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg"><item.icon size={20} className="text-white"/></div>
            ) : <item.icon size={20}/>}
            <span className="text-[10px]">{item.label}</span>
          </Link>);})}
      </div>
    </nav>
  );
}
