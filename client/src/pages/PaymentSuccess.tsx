/**
 * Payment Success Page
 * Displays confirmation after successful payment
 */

import { useLocation } from 'wouter';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function PaymentSuccess() {
  const [location] = useLocation();
  const sessionId = new URLSearchParams(window.location.search).get('session_id');

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAF7F2' }}
    >
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle size={64} style={{ color: '#2D6A4F' }} />
        </div>

        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: 'Fraunces, serif', color: '#1E293B', fontStyle: 'italic' }}
        >
          Payment Confirmed
        </h1>

        <p
          className="text-base mb-6"
          style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
        >
          Your appointment has been successfully booked. A confirmation email has been sent to you.
        </p>

        {sessionId && (
          <div
            className="p-4 rounded-lg mb-6"
            style={{ backgroundColor: 'white', border: '1px solid #E8E0D0' }}
          >
            <p
              className="text-xs"
              style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}
            >
              Session ID: {sessionId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
          >
            Back to Home
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
            View Booking Details
          </a>
        </div>
      </div>
    </div>
  );
}
