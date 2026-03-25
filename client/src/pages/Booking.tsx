// Planexa — Public Booking Page (/book/:slug)
// Design: Centered single-column, max-width 520px, cream background
// Multi-step: Service → Date → Time → Details → Confirmation

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock, DollarSign, Calendar, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRoute } from 'wouter';
import { TRIAL_PERIOD_DAYS } from '@shared/const';
import type { AppointmentType, BookingBusiness } from '@shared/demoCatalog';
import PageLoader from '@/components/PageLoader';
import { trpc } from '../lib/trpc';
import { formatDuration, formatPrice } from '../lib/data';

type Step = 'service' | 'date' | 'time' | 'details' | 'confirmation';

// Available time slots (simulated)
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
];

// Unavailable slots (simulated as booked)
const BOOKED_SLOTS = ['10:00', '14:00', '15:30'];

function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function getMonthDates(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  return { firstDay, daysInMonth, startOffset };
}

// Step 1: Service selection
function ServiceStep({
  appointmentTypes,
  onSelect,
}: {
  appointmentTypes: AppointmentType[];
  onSelect: (type: AppointmentType) => void;
}) {
  const activeTypes = appointmentTypes.filter(t => t.is_active);
  const paidServices = activeTypes.filter(t => t.price_cents > 0);
  const freeServices = activeTypes.filter(t => t.price_cents === 0);

  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-lg font-medium mb-2"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}
        >
          Select a service
        </h2>
        <p className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
          💳 = Payment required | 🎁 = Free
        </p>
      </div>

      {/* Paid Services Section */}
      {paidServices.length > 0 && (
        <div>
          <div className="text-xs font-semibold mb-3" style={{ color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}>
            💳 PAID SERVICES
          </div>
          <div className="space-y-3">
            {paidServices.map(type => (
              <button
                key={type.id}
                onClick={() => onSelect(type)}
                className="w-full text-left rounded-xl p-4 transition-all"
                style={{
                  border: `2px solid ${type.color_hex}`,
                  backgroundColor: type.color_hex + '08',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = `0 4px 16px ${type.color_hex}25`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: type.color_hex }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {type.name}
                      </span>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: type.color_hex, color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {formatPrice(type.price_cents)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                        <Clock size={11} />
                        {formatDuration(type.duration_minutes)}
                      </span>
                    </div>
                    {type.description && (
                      <p className="text-xs mt-1.5" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                        {type.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Free Services Section */}
      {freeServices.length > 0 && (
        <div>
          <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
            🎁 FREE SERVICES
          </div>
          <div className="space-y-3">
            {freeServices.map(type => (
              <button
                key={type.id}
                onClick={() => onSelect(type)}
                className="w-full text-left rounded-xl p-4 transition-all"
                style={{
                  border: '1px solid #E8E0D0',
                  backgroundColor: 'white',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = type.color_hex;
                  e.currentTarget.style.boxShadow = `0 2px 12px ${type.color_hex}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E8E0D0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: type.color_hex }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {type.name}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#D8F3DC', color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        FREE
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                        <Clock size={11} />
                        {formatDuration(type.duration_minutes)}
                      </span>
                    </div>
                    {type.description && (
                      <p className="text-xs mt-1.5" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                        {type.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 2: Date Selection
function DateStep({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const { daysInMonth, startOffset } = getMonthDates(year, month);

  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: startOffset }, (_, i) => null);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };

  return (
    <div className="space-y-3">
      <h2
        className="text-lg font-medium"
        style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}
      >
        Pick a date
      </h2>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded transition-colors"
          style={{ color: '#2D6A4F' }}
        >
          <ChevronLeft size={18} />
        </button>
        <span
          className="text-sm font-semibold"
          style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
        >
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded transition-colors"
          style={{ color: '#2D6A4F' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div
        className="grid grid-cols-7 gap-1"
        style={{ fontSize: '11px', color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
      >
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center font-semibold py-1">
            {day}
          </div>
        ))}
        {emptySlots.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {dates.map(day => {
          const date = new Date(year, month, day);
          const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
          const isPast = date < new Date();

          return (
            <button
              key={day}
              onClick={() => !isPast && onSelect(date)}
              disabled={isPast}
              className="py-2 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: isSelected ? '#2D6A4F' : isPast ? '#F3F4F6' : 'white',
                color: isSelected ? 'white' : isPast ? '#CBD5E1' : '#1E293B',
                border: isSelected ? 'none' : '1px solid #E8E0D0',
                cursor: isPast ? 'not-allowed' : 'pointer',
                opacity: isPast ? 0.5 : 1,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Step 3: Time Selection
function TimeStep({
  selectedTime,
  onSelect,
}: {
  selectedTime: string | null;
  onSelect: (time: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h2
        className="text-lg font-medium"
        style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}
      >
        Pick a time
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {TIME_SLOTS.map(time => {
          const isBooked = BOOKED_SLOTS.includes(time);
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              onClick={() => !isBooked && onSelect(time)}
              disabled={isBooked}
              className="py-2 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: isSelected ? '#2D6A4F' : isBooked ? '#FEE2E2' : 'white',
                color: isSelected ? 'white' : isBooked ? '#991B1B' : '#1E293B',
                border: isSelected ? 'none' : isBooked ? '1px solid #FECACA' : '1px solid #E8E0D0',
                cursor: isBooked ? 'not-allowed' : 'pointer',
                opacity: isBooked ? 0.6 : 1,
              }}
            >
              {formatTime12h(time)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Step 4: Details Form
function DetailsStep({
  form,
  onChange,
}: {
  form: { name: string; email: string; phone: string; notes: string };
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2
        className="text-lg font-medium mb-4"
        style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}
      >
        Your details
      </h2>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            Full Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="Alice Thompson"
            className="w-full planexa-input"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            Email Address *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => onChange('email', e.target.value)}
            placeholder="alice@example.com"
            className="w-full planexa-input"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => onChange('phone', e.target.value)}
            placeholder="+1 416-555-0000"
            className="w-full planexa-input"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={e => onChange('notes', e.target.value)}
            placeholder="Anything you'd like us to know..."
            rows={3}
            className="w-full planexa-input resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// Step 5: Confirmation
function ConfirmationStep({
  service,
  date,
  time,
  clientName,
  clientEmail,
  onBookAnother,
  onPaymentClick,
  isProcessing,
  trialDaysRemaining,
  trialPeriodDays,
  business,
}: {
  service: AppointmentType;
  date: Date;
  time: string;
  clientName: string;
  clientEmail: string;
  onBookAnother: () => void;
  onPaymentClick: () => void;
  isProcessing: boolean;
  business: Pick<BookingBusiness, 'name' | 'description' | 'timezone'>;
  trialDaysRemaining?: number;
  trialPeriodDays?: number;
}) {
  const trialLabelDays = trialPeriodDays ?? TRIAL_PERIOD_DAYS;
  return (
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ backgroundColor: '#D8F3DC' }}
      >
        <Check size={28} style={{ color: '#2D6A4F' }} strokeWidth={2.5} />
      </div>

      <h2
        className="text-2xl mb-2"
        style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
      >
        You're all set!
      </h2>
      {trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: '#D8F3DC', border: '2px solid #2D6A4F' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: '18px' }}>🎁</span>
            <span
              className="font-semibold text-sm"
              style={{ color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}
            >
              {trialLabelDays}-Day Free Trial Active
            </span>
          </div>
          <p className="text-xs" style={{ color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}>
            You have <strong>{trialDaysRemaining} days</strong> of free access. Payment will be required after the trial ends.
          </p>
        </div>
      )}
      <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
        A confirmation has been sent to your email.
      </p>

      <div
        className="rounded-xl p-5 text-left mb-5"
        style={{ backgroundColor: '#F0EBE0', border: '1px solid #E8E0D0' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color_hex }} />
          <span
            className="font-semibold text-sm"
            style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
          >
            {service.name}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            <Calendar size={13} style={{ color: '#94A3B8' }} />
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            <Clock size={13} style={{ color: '#94A3B8' }} />
            {formatTime12h(time)} · {formatDuration(service.duration_minutes)}
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            <MapPin size={13} style={{ color: '#94A3B8' }} />
            {business.name}
          </div>
          {service.price_cents > 0 && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              <DollarSign size={13} style={{ color: '#94A3B8' }} />
              {formatPrice(service.price_cents)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
          {service.price_cents > 0 && trialDaysRemaining !== undefined && trialDaysRemaining > 0 ? (
            <div className="text-center">
              <p className="text-xs mb-3" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                Your trial is active. Payment will be required after {trialDaysRemaining} days.
              </p>
              <button
                onClick={onBookAnother}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#2D6A4F',
                  color: 'white',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
              >
                Continue to Dashboard
              </button>
            </div>
          ) : service.price_cents > 0 ? (
            <button
              onClick={onPaymentClick}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#2D6A4F',
                color: 'white',
                fontFamily: 'DM Sans, sans-serif',
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => !isProcessing && (e.currentTarget.style.backgroundColor = '#40916C')}
              onMouseLeave={e => !isProcessing && (e.currentTarget.style.backgroundColor = '#2D6A4F')}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <DollarSign size={14} />
                  Complete Payment
                </>
              )}
            </button>
          ) : null}
        <a
          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.name + ' with ' + business.name)}&dates=${date.toISOString().split('T')[0].replace(/-/g, '')}T${time.replace(':', '')}00/${date.toISOString().split('T')[0].replace(/-/g, '')}T${time.replace(':', '')}00`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{
            border: '1px solid #E8E0D0',
            color: '#475569',
            fontFamily: 'DM Sans, sans-serif',
            backgroundColor: 'white',
            textDecoration: 'none',
          }}
        >
          📅 Add to Google Calendar
        </a>
        <button
          onClick={onBookAnother}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: '#2D6A4F',
            color: 'white',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
        >
          Book Another Appointment
        </button>
      </div>
    </div>
  );
}

// Summary Bar (shown during steps 2-4)
function SummaryBar({
  service,
  date,
  time,
}: {
  service: AppointmentType;
  date?: Date | null;
  time?: string | null;
}) {
  return (
    <div
      className="rounded-xl p-3 mb-5 flex items-center gap-3"
      style={{ backgroundColor: service.color_hex + '15', border: `1px solid ${service.color_hex}30` }}
    >
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: service.color_hex }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
          {service.name}
        </div>
        <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
          {formatDuration(service.duration_minutes)} · {formatPrice(service.price_cents)}
          {date && ` · ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          {time && ` · ${formatTime12h(time)}`}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const [, routeParams] = useRoute("/book/:slug");
  const slug = routeParams?.slug ?? "";

  const catalogQuery = trpc.booking.getCatalog.useQuery(
    { slug },
    { enabled: slug.length > 0 }
  );

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | undefined>(undefined);
  const [trialPeriodDays, setTrialPeriodDays] = useState<number | undefined>(undefined);

  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation();
  const startTrialMutation = trpc.stripe.startTrial.useMutation();

  const handleStartTrial = async () => {
    try {
      const data = await startTrialMutation.mutateAsync();
      setTrialDaysRemaining(data.daysRemaining);
      setTrialPeriodDays(data.trialPeriodDays);
    } catch {
      setTrialDaysRemaining(undefined);
      setTrialPeriodDays(undefined);
    }
  };

  const handleReset = () => {
    setStep('service');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setForm({ name: '', email: '', phone: '', notes: '' });
    setTrialDaysRemaining(undefined);
    setTrialPeriodDays(undefined);
  };

  const handleConfirm = async () => {
    if (!form.name || !form.email) {
      toast.error('Please fill in your name and email.');
      return;
    }
    await handleStartTrial();
    setStep('confirmation');
  };

  const handlePaymentClick = async () => {
    if (!selectedService) return;

    setIsProcessing(true);
    try {
      const result = await checkoutMutation.mutateAsync({
        appointmentTypeId: selectedService.id,
        appointmentTypeName: selectedService.name,
        priceCents: selectedService.price_cents,
        currency: 'USD',
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-canceled`,
      });

      if (result.checkoutUrl) {
        toast.success('Redirecting to payment...');
        window.open(result.checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceedDate = selectedDate !== null;
  const canProceedTime = selectedTime !== null;

  const stepOrder: Step[] = ['service', 'date', 'time', 'details', 'confirmation'];
  const currentStepIdx = stepOrder.indexOf(step);

  if (!slug.trim()) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#FAF7F2" }}
      >
        <p className="text-sm text-center" style={{ color: "#64748B", fontFamily: "DM Sans, sans-serif" }}>
          Missing booking link. Open a valid <code className="text-xs">/book/your-business</code> URL.
        </p>
      </div>
    );
  }

  if (catalogQuery.isLoading) {
    return <PageLoader />;
  }

  if (catalogQuery.error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#FAF7F2" }}
      >
        <p className="text-sm text-center" style={{ color: "#64748B", fontFamily: "DM Sans, sans-serif" }}>
          Could not load this booking page. Try again later.
        </p>
      </div>
    );
  }

  const catalog = catalogQuery.data;
  if (!catalog?.found) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#FAF7F2" }}
      >
        <p className="text-sm text-center max-w-sm" style={{ color: "#64748B", fontFamily: "DM Sans, sans-serif" }}>
          No public booking page was found for this link. Check the URL or contact the business.
        </p>
      </div>
    );
  }

  const { business, appointmentTypes } = catalog;

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ backgroundColor: '#FAF7F2' }}
    >
      <div className="max-w-[520px] mx-auto">
        {/* Business Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ backgroundColor: '#D8F3DC', color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}
          >
            <span className="pulse-dot" />
            Booking available
          </div>
          <h1
            className="text-3xl mb-2"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
          >
            {business.name}
          </h1>
          <p className="text-sm" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
            {business.description}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
            <MapPin size={11} />
            {business.timezone}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-1 mb-8 justify-center">
          {stepOrder.map((s, idx) => (
            <div
              key={s}
              className="h-1 rounded-full transition-all"
              style={{
                width: idx <= currentStepIdx ? '24px' : '8px',
                backgroundColor: idx <= currentStepIdx ? '#2D6A4F' : '#E8E0D0',
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: 'white', border: '1px solid #E8E0D0' }}
        >
          {step === 'service' && (
            <ServiceStep
              appointmentTypes={appointmentTypes}
              onSelect={(type) => {
                setSelectedService(type);
                setStep('date');
              }}
            />
          )}

          {step === 'date' && selectedService && (
            <>
              <SummaryBar service={selectedService} />
              <DateStep selectedDate={selectedDate} onSelect={(date) => { setSelectedDate(date); setStep('time'); }} />
            </>
          )}

          {step === 'time' && selectedService && (
            <>
              <SummaryBar service={selectedService} date={selectedDate} />
              <TimeStep selectedTime={selectedTime} onSelect={(time) => { setSelectedTime(time); setStep('details'); }} />
            </>
          )}

          {step === 'details' && selectedService && (
            <>
              <SummaryBar service={selectedService} date={selectedDate} time={selectedTime} />
              <DetailsStep form={form} onChange={(field, value) => setForm({ ...form, [field]: value })} />
            </>
          )}

          {step === 'confirmation' && selectedService && selectedDate && selectedTime && (
            <ConfirmationStep
              service={selectedService}
              date={selectedDate}
              time={selectedTime}
              clientName={form.name}
              clientEmail={form.email}
              onBookAnother={handleReset}
              onPaymentClick={handlePaymentClick}
              isProcessing={isProcessing}
              business={business}
              trialDaysRemaining={trialDaysRemaining}
              trialPeriodDays={trialPeriodDays}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {step !== 'confirmation' && (
          <div className="flex gap-3">
            {currentStepIdx > 0 && (
              <button
                onClick={() => setStep(stepOrder[currentStepIdx - 1])}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  border: '1px solid #E8E0D0',
                  color: '#475569',
                  fontFamily: 'DM Sans, sans-serif',
                  backgroundColor: 'white',
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === 'service') return;
                if (step === 'date' && !canProceedDate) {
                  toast.error('Please select a date');
                  return;
                }
                if (step === 'time' && !canProceedTime) {
                  toast.error('Please select a time');
                  return;
                }
                if (step === 'details') {
                  handleConfirm();
                  return;
                }
              }}
              disabled={step === 'service' || (step === 'date' && !canProceedDate) || (step === 'time' && !canProceedTime)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#2D6A4F',
                color: 'white',
                fontFamily: 'DM Sans, sans-serif',
                opacity: (step === 'service' || (step === 'date' && !canProceedDate) || (step === 'time' && !canProceedTime)) ? 0.5 : 1,
                cursor: (step === 'service' || (step === 'date' && !canProceedDate) || (step === 'time' && !canProceedTime)) ? 'not-allowed' : 'pointer',
              }}
            >
              {step === 'details' ? 'Review Booking' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
