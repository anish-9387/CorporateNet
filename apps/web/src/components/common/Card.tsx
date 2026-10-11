import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'default';
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'default' }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>
    {padding !== 'none' ? <div className="p-5">{children}</div> : children}
  </div>
);

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-b border-slate-200 ${className}`}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl ${className}`}>{children}</div>
);