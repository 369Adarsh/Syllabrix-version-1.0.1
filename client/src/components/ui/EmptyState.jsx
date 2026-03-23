'use client';
export default function EmptyState({ icon:Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"><Icon size={28} className="text-gray-400" /></div>}
      <h3 className="font-heading font-semibold text-lg text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
