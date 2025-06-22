'use client';

import React from 'react';
import { formatPrice } from '@/lib/currency';
import { useAppSelector } from '@/redux/hooks';

interface PriceProps {
  amount?: number;
  currency?: string;
  className?: string;
}

export function Price({ amount, currency, className = '' }: PriceProps) {
  const { settings } = useAppSelector((state) => state.settings);
  const currencyToUse = currency || settings?.currency || 'USD';
  
  // Handle undefined or null amounts
  if (amount === undefined || amount === null) {
    return <span className={className}>$0.00</span>;
  }
  
  return (
    <span className={className}>
      {formatPrice(amount, currencyToUse)}
    </span>
  );
}
