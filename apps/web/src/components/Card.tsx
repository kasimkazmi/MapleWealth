import React from 'react';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, icon, children, className = '' }: CardProps) {
  return (
    <div className={`glass-panel p-6 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          {icon && <span className="text-slate-400">{icon}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}
