/**
 * Payment Canceled Page
 * Displays message when payment is canceled
 */

import { XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function PaymentCanceled() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAF7F2' }}
    >
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <XCircle size={64} style={{ color: '#EF4444' }} />
        </div>

        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: 'Fraunces, serif', color: '#1E293B', fontStyle: 'italic' }}
        >
          Payment Canceled
        </h1>

        <p
          className="text-base mb-6"
          style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
        >
          Your payment was canceled. No charges have been made to your account. Please try again or contact support if you need assistance.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
          >
            Return to Booking
            <ArrowRight size={14} />
          </Link>

          <a
            href="/"
            className="block w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'white',
              color: '#2D6A4F',
              border: '1px solid #E8E0D0',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
