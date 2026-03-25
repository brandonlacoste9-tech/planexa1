/**
 * Payments Page
 * Shows user's payment history and transaction details
 */

import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { DollarSign, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';

export default function Payments() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { data: payments = [], isLoading } = trpc.stripe.getPaymentHistory.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--plx-bg)' }}>
        <div className="max-w-md w-full text-center">
          <h1
            className="text-3xl mb-4"
            style={{ fontFamily: 'Fraunces, serif', color: '#1E293B', fontStyle: 'italic' }}
          >
            {t('payments.signInTitle')}
          </h1>
          <p style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif', marginBottom: '2rem' }}>
            {t('payments.signInDesc')}
          </p>
          <Link
            href="/calendar"
            className="inline-block px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
          >
            {t('payments.signIn')}
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle size={16} style={{ color: '#10B981' }} />;
      case 'pending':
        return <Clock size={16} style={{ color: '#F59E0B' }} />;
      case 'failed':
      case 'canceled':
        return <AlertCircle size={16} style={{ color: '#EF4444' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '#D1FAE5';
      case 'pending':
        return '#FEF3C7';
      case 'failed':
      case 'canceled':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--plx-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/calendar"
            className="text-sm font-medium mb-4 inline-block transition-colors"
            style={{ color: 'var(--plx-primary)', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {t('payments.backToDashboard')}
          </Link>

          <h1
            className="text-4xl mb-2"
            style={{ fontFamily: 'Fraunces, serif', color: '#1E293B', fontStyle: 'italic' }}
          >
            {t('payments.title')}
          </h1>
          <p style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
            {t('payments.subtitle')}
          </p>
        </div>

        {/* Payments List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div
              className="inline-block animate-spin"
              style={{ color: 'var(--plx-primary)' }}
            >
              ⏳
            </div>
            <p style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif', marginTop: '1rem' }}>
              {t('payments.loading')}
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ backgroundColor: 'white', border: '1px solid var(--plx-border)' }}
          >
            <DollarSign size={32} style={{ color: '#CBD5E1', margin: '0 auto 1rem' }} />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
            >
              {t('payments.empty.title')}
            </h3>
            <p style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
              {t('payments.empty.desc')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment: any) => (
              <div
                key={payment.id}
                className="rounded-xl p-4 transition-all"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--plx-border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {payment.appointmentTypeId || t('payments.appointment')}
                      </span>
                      <div
                        className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: getStatusColor(payment.status),
                          color: '#1E293B',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      >
                        {getStatusIcon(payment.status)}
                        {getStatusText(payment.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(payment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {payment.customerEmail && (
                        <span>
                          {payment.customerEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right">
                    <div
                      className="text-lg font-semibold"
                      style={{ color: 'var(--plx-primary)', fontFamily: 'Fraunces, serif' }}
                    >
                      ${(parseFloat(payment.amount) || 0).toFixed(2)}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {payment.currency}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
