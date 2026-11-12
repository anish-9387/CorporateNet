import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
    neutral: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold uppercase tracking-wider rounded ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variants: Record<string, BadgeVariant> = {
    passed: 'success',
    failed: 'error',
    'not-run': 'neutral',
    'not-applicable': 'info',
    verified: 'success',
    configured: 'info',
    'not-verified': 'warning',
  };

  return <Badge variant={variants[status] ?? 'neutral'}>{status}</Badge>;
};