'use client';
const styles = { primary:'bg-indigo-50 text-indigo-600', success:'bg-emerald-50 text-emerald-600', warning:'bg-amber-50 text-amber-600', danger:'bg-red-50 text-red-600', gray:'bg-gray-100 text-gray-500' };
export default function Badge({ children, variant='primary', className='' }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>{children}</span>;
}
