'use client';

import React from 'react';
import { formatPrice } from '@/lib/currency';
import { useAppSelector } from '@/redux/hooks';

interface PriceProps {
  value: number;
  className?: string;
}

export function Price({ value, className = '' }: PriceProps) {
  const { settings } = useAppSelector((state) => state.settings);
  const currency = settings?.currency || 'USD';
  
  return (
    <span className={className}>
      {formatPrice(value, currency)}
    </span>
  );
}
