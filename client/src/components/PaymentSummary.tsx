/**
 * Payment Summary Component
 * Displays appointment details and payment information in the booking flow
 */

import { AppointmentType } from '@/lib/data';
import { formatPrice, formatDuration } from '@shared/products';

interface PaymentSummaryProps {
  appointmentType: AppointmentType;
  clientName?: string;
  clientEmail?: string;
  appointmentDate?: Date;
  appointmentTime?: string;
}

export default function PaymentSummary({
  appointmentType,
  clientName,
  clientEmail,
  appointmentDate,
  appointmentTime,
}: PaymentSummaryProps) {
  const formattedDate = appointmentDate
    ? appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className="planexa-card p-5 space-y-4"
      style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8E0D0' }}
    >
      <h3
        className="text-sm font-semibold"
        style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}
      >
        Order Summary
      </h3>

      {/* Appointment Details */}
      <div className="space-y-3 pb-4" style={{ borderBottom: '1px solid #E8E0D0' }}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <div
              className="text-sm font-medium"
              style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
            >
              {appointmentType.name}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
            >
              {formatDuration(appointmentType.duration_minutes)}
            </div>
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: '#2D6A4F', fontFamily: 'Fraunces, serif' }}
          >
            {formatPrice(appointmentType.price_cents)}
          </div>
        </div>

        {formattedDate && (
          <div
            className="text-xs"
            style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
          >
            <span className="font-medium">Date:</span> {formattedDate}
            {appointmentTime && <span> at {appointmentTime}</span>}
          </div>
        )}

        {clientName && (
          <div
            className="text-xs"
            style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
          >
            <span className="font-medium">Name:</span> {clientName}
          </div>
        )}

        {clientEmail && (
          <div
            className="text-xs"
            style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
          >
            <span className="font-medium">Email:</span> {clientEmail}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-2">
        <div
          className="text-sm font-medium"
          style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
        >
          Total
        </div>
        <div
          className="text-lg font-semibold"
          style={{ color: '#2D6A4F', fontFamily: 'Fraunces, serif' }}
        >
          {formatPrice(appointmentType.price_cents)}
        </div>
      </div>

      {appointmentType.price_cents === 0 && (
        <div
          className="text-xs p-2 rounded-lg"
          style={{
            backgroundColor: '#D8F3DC',
            color: '#2D6A4F',
            fontFamily: 'DM Sans, sans-serif',
            textAlign: 'center',
          }}
        >
          This appointment is complimentary
        </div>
      )}
    </div>
  );
}
