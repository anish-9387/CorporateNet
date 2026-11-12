import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'default';
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'none' }) => (
  <div className={`card ${className}`}>
    {padding !== 'none' ? <div className="p-5">{children}</div> : children}
  </div>
);

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);
