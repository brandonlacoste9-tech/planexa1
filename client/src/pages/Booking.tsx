// Planexa — Public Booking Page (/book/:slug)
// Design: Centered single-column, max-width 520px, cream background
// Multi-step: Service → Date → Time → Details → Confirmation

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock, DollarSign, Calendar, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '../lib/trpc';
import {
  appointmentTypes,
  businessInfo,
  formatDuration,
  formatPrice,
  type AppointmentType,
} from '../lib/data';

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

// Step 1: Service Selection
function ServiceStep({
  onSelect,
}: {
  onSelect: (type: AppointmentType) => void;
}) {
  const activeTypes = appointmentTypes.filter(t => t.is_active);

  return (
    <div className="space-y-3">
      <h2
        className="text-lg font-medium mb-4"
        style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}
      >
        Select a service
      </h2>
      {activeTypes.map(type => (
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
                  className="text-sm font-medium"
                  style={{ fontFamily: 'Fraunces, serif', color: type.color_hex }}
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(new Date(today));

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const { daysInMonth, startOffset } = getMonthDates(year, month);
  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <h2
        className="text-lg font-medium mb-4"
        style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}
      >
        Select a date
      </h2>
      <div className="planexa-card p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewMonth(new Date(year, month - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#64748B' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="font-medium text-sm"
            style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
          >
            {monthName}
          </span>
          <button
            onClick={() => setViewMonth(new Date(year, month + 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#64748B' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
            <div
              key={d}
              className="text-center text-xs font-medium py-1"
              style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isPast = date < today;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isUnavailable = isPast || isWeekend;
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === today.toDateString();

            return (
              <button
                key={day}
                disabled={isUnavailable}
                onClick={() => onSelect(date)}
                className="aspect-square flex items-center justify-center rounded-lg text-sm transition-all"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  backgroundColor: isSelected ? '#2D6A4F' : isToday ? '#D8F3DC' : 'transparent',
                  color: isSelected ? 'white' : isUnavailable ? '#CBD5E1' : isToday ? '#2D6A4F' : '#1E293B',
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                  fontWeight: isToday ? 600 : 400,
                }}
                onMouseEnter={e => {
                  if (!isUnavailable && !isSelected) e.currentTarget.style.backgroundColor = '#D8F3DC';
                }}
                onMouseLeave={e => {
                  if (!isUnavailable && !isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <p className="text-sm mt-3 text-center" style={{ color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}>
          ✓ {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} selected
        </p>
      )}
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
    <div>
      <h2
        className="text-lg font-medium mb-4"
        style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}
      >
        Select a time
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {TIME_SLOTS.map(slot => {
          const isBooked = BOOKED_SLOTS.includes(slot);
          const isSelected = selectedTime === slot;

          return (
            <button
              key={slot}
              disabled={isBooked}
              onClick={() => onSelect(slot)}
              className="py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                backgroundColor: isSelected ? '#2D6A4F' : isBooked ? '#F1F5F9' : 'white',
                color: isSelected ? 'white' : isBooked ? '#CBD5E1' : '#1E293B',
                border: isSelected ? '1px solid #2D6A4F' : '1px solid #E8E0D0',
                cursor: isBooked ? 'not-allowed' : 'pointer',
                textDecoration: isBooked ? 'line-through' : 'none',
              }}
              onMouseEnter={e => {
                if (!isBooked && !isSelected) {
                  e.currentTarget.style.backgroundColor = '#D8F3DC';
                  e.currentTarget.style.borderColor = '#52B788';
                }
              }}
              onMouseLeave={e => {
                if (!isBooked && !isSelected) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#E8E0D0';
                }
              }}
            >
              {formatTime12h(slot)}
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
    <div>
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
}: {
  service: AppointmentType;
  date: Date;
  time: string;
  clientName: string;
  clientEmail: string;
  onBookAnother: () => void;
  onPaymentClick: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="text-center">
      {/* Animated checkmark */}
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
      <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
        A confirmation has been sent to your email.
      </p>

      {/* Appointment Summary Card */}
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
            {businessInfo.name}
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
        {service.price_cents > 0 && (
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
        )}
        <a
          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.name + ' with ' + businessInfo.name)}&dates=${date.toISOString().split('T')[0].replace(/-/g, '')}T${time.replace(':', '')}00/${date.toISOString().split('T')[0].replace(/-/g, '')}T${time.replace(':', '')}00`}
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
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation();

  const handleReset = () => {
    setStep('service');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setForm({ name: '', email: '', phone: '', notes: '' });
  };

  const handleConfirm = () => {
    if (!form.name || !form.email) {
      toast.error('Please fill in your name and email.');
      return;
    }
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
            {businessInfo.name}
          </h1>
          <p className="text-sm" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
            {businessInfo.description}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
            <MapPin size={11} />
            {businessInfo.timezone}
          </div>
        </div>

        {/* Progress Indicator */}
        {step !== 'confirmation' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {['service', 'date', 'time', 'details'].map((s, i) => {
              const idx = stepOrder.indexOf(s as Step);
              const isDone = currentStepIdx > idx;
              const isCurrent = step === s;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                    style={{
                      backgroundColor: isDone ? '#2D6A4F' : isCurrent ? '#D8F3DC' : '#E8E0D0',
                      color: isDone ? 'white' : isCurrent ? '#2D6A4F' : '#94A3B8',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {isDone ? <Check size={12} /> : i + 1}
                  </div>
                  {i < 3 && (
                    <div
                      className="w-8 h-px"
                      style={{ backgroundColor: isDone ? '#2D6A4F' : '#E8E0D0' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Main Card */}
        <div className="planexa-card-lg p-6">
          {/* Back button */}
          {step !== 'service' && step !== 'confirmation' && (
            <button
              onClick={() => {
                const idx = stepOrder.indexOf(step);
                setStep(stepOrder[idx - 1]);
              }}
              className="flex items-center gap-1 text-sm mb-4 transition-colors"
              style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#2D6A4F')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
            >
              <ChevronLeft size={14} />
              Back
            </button>
          )}

          {/* Service Summary Bar */}
          {selectedService && step !== 'service' && step !== 'confirmation' && (
            <SummaryBar
              service={selectedService}
              date={step === 'time' || step === 'details' ? selectedDate : null}
              time={step === 'details' ? selectedTime : null}
            />
          )}

          {/* Step Content */}
          {step === 'service' && (
            <ServiceStep onSelect={type => { setSelectedService(type); setStep('date'); }} />
          )}

          {step === 'date' && (
            <>
              <DateStep selectedDate={selectedDate} onSelect={setSelectedDate} />
              <button
                disabled={!canProceedDate}
                onClick={() => setStep('time')}
                className="w-full mt-5 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: canProceedDate ? '#2D6A4F' : '#E8E0D0',
                  color: canProceedDate ? 'white' : '#94A3B8',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: canProceedDate ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={e => { if (canProceedDate) e.currentTarget.style.backgroundColor = '#40916C'; }}
                onMouseLeave={e => { if (canProceedDate) e.currentTarget.style.backgroundColor = '#2D6A4F'; }}
              >
                Continue →
              </button>
            </>
          )}

          {step === 'time' && (
            <>
              <TimeStep selectedTime={selectedTime} onSelect={setSelectedTime} />
              <button
                disabled={!canProceedTime}
                onClick={() => setStep('details')}
                className="w-full mt-5 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: canProceedTime ? '#2D6A4F' : '#E8E0D0',
                  color: canProceedTime ? 'white' : '#94A3B8',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: canProceedTime ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={e => { if (canProceedTime) e.currentTarget.style.backgroundColor = '#40916C'; }}
                onMouseLeave={e => { if (canProceedTime) e.currentTarget.style.backgroundColor = '#2D6A4F'; }}
              >
                Continue →
              </button>
            </>
          )}

          {step === 'details' && (
            <>
              <DetailsStep
                form={form}
                onChange={(field, value) => setForm(f => ({ ...f, [field]: value }))}
              />
              <button
                onClick={handleConfirm}
                className="w-full mt-5 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
              >
                Confirm Booking
              </button>
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
          />
        )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <span className="text-xs" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
            Powered by{' '}
            <span style={{ fontFamily: 'Fraunces, serif', color: '#2D6A4F', fontStyle: 'italic' }}>
              planexa
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
