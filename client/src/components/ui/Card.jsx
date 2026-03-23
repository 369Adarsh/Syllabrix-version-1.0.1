'use client';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div className={`${hover ? 'card-hover' : 'card'} ${className}`} {...props}>
      {children}
    </div>
  );
}
