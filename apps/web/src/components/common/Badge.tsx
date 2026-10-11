import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => (
  <span className={`badge badge-${variant} ${className}`}>{children}</span>
);

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