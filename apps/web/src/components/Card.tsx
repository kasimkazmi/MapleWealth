import React from 'react';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  decoration?: 'tape' | 'tack';
  postit?: boolean;
  rotate?: string;
}

export function Card({ title, icon, children, className = '', decoration, postit, rotate = '' }: CardProps) {
  return (
    <div
      className={`relative hd-card ${postit ? 'hd-card--postit' : ''} p-6 flex flex-col justify-between ${rotate} ${className}`}
    >
      {decoration === 'tape' && <div className="hd-decoration-tape" />}
      {decoration === 'tack' && <div className="hd-decoration-tack" />}
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold uppercase tracking-wider" style={{ opacity: 0.75 }}>{title}</span>
          {icon && <span style={{ opacity: 0.75 }}>{icon}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}
