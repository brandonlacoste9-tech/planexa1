/**
 * Payment Canceled Page
 * Displays message when payment is canceled
 */

import { XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';

export default function PaymentCanceled() {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--plx-bg)' }}
    >
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <XCircle size={64} style={{ color: '#EF4444' }} />
        </div>

        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: 'Fraunces, serif', color: '#1E293B', fontStyle: 'italic' }}
        >
          {t('paymentCanceled.title')}
        </h1>

        <p
          className="text-base mb-6"
          style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
        >
          {t('paymentCanceled.desc')}
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--plx-primary)')}
          >
            {t('paymentCanceled.returnToBooking')}
            <ArrowRight size={14} />
          </Link>

          <a
            href="/"
            className="block w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'white',
              color: 'var(--plx-primary)',
              border: '1px solid var(--plx-border)',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-pale)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
          >
            {t('paymentCanceled.contactSupport')}
          </a>
        </div>
      </div>
    </div>
  );
}
