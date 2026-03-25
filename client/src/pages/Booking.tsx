import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock, DollarSign, Calendar, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import type { AppointmentType, BookingBusiness } from '@shared/demoCatalog';
import PageLoader from '@/components/PageLoader';
import { trpc } from '../lib/trpc';
import { formatDuration, formatPrice } from '../lib/data';

type Step = 'service' | 'date' | 'time' | 'details' | 'confirmation';

function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

// ─── Service Step ─────────────────────────────────────────────────────────────
function ServiceStep({ appointmentTypes, onSelect }: { appointmentTypes: AppointmentType[]; onSelect: (t: AppointmentType) => void }) {
  const { t } = useTranslation();
  const active = appointmentTypes.filter(at => at.is_active);
  const paid = active.filter(at => at.price_cents > 0);
  const free = active.filter(at => at.price_cents === 0);

  const ServiceCard = ({ type }: { type: AppointmentType }) => (
    <button
      key={type.id}
      onClick={() => onSelect(type)}
      className="w-full text-left rounded-xl p-4 transition-all"
      style={{ border: `2px solid ${type.color_hex}`, backgroundColor: type.color_hex + '08' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${type.color_hex}25`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="flex items-start gap-3">
        <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: type.color_hex }} />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-sm" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>{type.name}</span>
            <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: type.color_hex, color: 'white', fontFamily: 'DM Sans, sans-serif' }}>
              {type.price_cents > 0 ? formatPrice(type.price_cents) : t('common.free')}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
            <Clock size={11} />{formatDuration(type.duration_minutes)}
          </span>
          {type.description && <p className="text-xs mt-1.5" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>{type.description}</p>}
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-medium" style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}>{t('booking.selectService')}</h2>
      {paid.length > 0 && (
        <div>
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--plx-primary)', fontFamily: 'DM Sans, sans-serif' }}>{t('booking.paidServices')}</div>
          <div className="space-y-3">{paid.map(at => <ServiceCard key={at.id} type={at} />)}</div>
        </div>
      )}
      {free.length > 0 && (
        <div>
          <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>{t('booking.freeServices')}</div>
          <div className="space-y-3">{free.map(at => <ServiceCard key={at.id} type={at} />)}</div>
        </div>
      )}
    </div>
  );
}

// ─── Date Step ────────────────────────────────────────────────────────────────
function DateStep({ selectedDate, enabledDays, onSelect }: { selectedDate: Date | null; enabledDays: number[]; onSelect: (d: Date) => void }) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium" style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}>{t('booking.pickDate')}</h2>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-1 rounded" style={{ color: 'var(--plx-primary)' }}><ChevronLeft size={18} /></button>
        <span className="text-sm font-semibold" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
          {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-1 rounded" style={{ color: 'var(--plx-primary)' }}><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1" style={{ fontSize: '11px', color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
        {([t('booking.days.Mon'), t('booking.days.Tue'), t('booking.days.Wed'), t('booking.days.Thu'), t('booking.days.Fri'), t('booking.days.Sat'), t('booking.days.Sun')]).map(d => (
          <div key={d} className="text-center font-semibold py-1">{d}</div>
        ))}
        {Array.from({ length: startOffset }, (_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(year, month, i + 1);
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isPast = date < today;
          const dayOfWeek = date.getDay(); // 0=Sun
          const isUnavailable = !enabledDays.includes(dayOfWeek);
          const disabled = isPast || isUnavailable;
          return (
            <button
              key={i + 1}
              onClick={() => !disabled && onSelect(date)}
              disabled={disabled}
              className="py-2 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: isSelected ? 'var(--plx-primary)' : disabled ? '#F3F4F6' : 'white',
                color: isSelected ? 'white' : disabled ? '#CBD5E1' : '#1E293B',
                border: isSelected ? 'none' : '1px solid var(--plx-border)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Time Step ────────────────────────────────────────────────────────────────
function TimeStep({ slots, isLoading, selectedTime, onSelect }: { slots: string[]; isLoading: boolean; selectedTime: string | null; onSelect: (s: string) => void }) {
  const { t } = useTranslation();
  if (isLoading) return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium" style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}>{t('booking.pickTime')}</h2>
      <div className="flex items-center justify-center py-8 gap-2" style={{ color: '#64748B' }}>
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('booking.loadingTimes')}</span>
      </div>
    </div>
  );

  if (slots.length === 0) return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium" style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}>{t('booking.pickTime')}</h2>
      <div className="text-center py-8">
        <p className="text-sm" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>{t('booking.noTimesOnDate')}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium" style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}>{t('booking.pickTime')}</h2>
      <div className="grid grid-cols-3 gap-2">
        {slots.map(time => {
          const isSelected = selectedTime === time;
          return (
            <button
              key={time}
              onClick={() => onSelect(time)}
              className="py-2 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: isSelected ? 'var(--plx-primary)' : 'white',
                color: isSelected ? 'white' : '#1E293B',
                border: isSelected ? 'none' : '1px solid var(--plx-border)',
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

// ─── Details Step ─────────────────────────────────────────────────────────────
function DetailsStep({ form, onChange }: { form: { name: string; email: string; phone: string; notes: string }; onChange: (field: string, value: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#1E293B' }}>{t('booking.yourDetails')}</h2>
      <div className="space-y-3">
        {([
          ['text', 'name', t('booking.fields.fullName'), t('booking.fields.fullNamePlaceholder')] as const,
          ['email', 'email', t('booking.fields.email'), t('booking.fields.emailPlaceholder')] as const,
          ['tel', 'phone', t('booking.fields.phone'), t('booking.fields.phonePlaceholder')] as const,
        ]).map(([type, field, label, placeholder]) => (
          <div key={field}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>{label}</label>
            <input type={type} value={form[field]} onChange={e => onChange(field, e.target.value)} placeholder={placeholder} className="w-full planexa-input" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>{t('booking.fields.notes')}</label>
          <textarea value={form.notes} onChange={e => onChange('notes', e.target.value)} placeholder={t('booking.fields.notesPlaceholder')} rows={3} className="w-full planexa-input resize-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation Step ────────────────────────────────────────────────────────
function ConfirmationStep({ service, date, time, business, onBookAnother, onPaymentClick, isProcessing }: {
  service: AppointmentType; date: Date; time: string; business: Pick<BookingBusiness, 'name' | 'description' | 'timezone'>;
  onBookAnother: () => void; onPaymentClick: () => void; isProcessing: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'var(--plx-pale)' }}>
        <Check size={28} style={{ color: 'var(--plx-primary)' }} strokeWidth={2.5} />
      </div>
      <h2 className="text-2xl mb-2" style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}>{t('booking.allSet')}</h2>
      <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>{t('booking.confirmationSent')}</p>
      <div className="rounded-xl p-5 text-left mb-5" style={{ backgroundColor: 'var(--plx-bg)', border: '1px solid var(--plx-border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color_hex }} />
          <span className="font-semibold text-sm" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>{service.name}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            <Calendar size={13} style={{ color: '#94A3B8' }} />
            {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            <Clock size={13} style={{ color: '#94A3B8' }} />
            {formatTime12h(time)} · {formatDuration(service.duration_minutes)}
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
            <MapPin size={13} style={{ color: '#94A3B8' }} />{business.name}
          </div>
          {service.price_cents > 0 && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              <DollarSign size={13} style={{ color: '#94A3B8' }} />{formatPrice(service.price_cents)}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {service.price_cents > 0 && (
          <button onClick={onPaymentClick} disabled={isProcessing} className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif', opacity: isProcessing ? 0.7 : 1 }}
            onMouseEnter={e => !isProcessing && (e.currentTarget.style.backgroundColor = 'var(--plx-hover)')}
            onMouseLeave={e => !isProcessing && (e.currentTarget.style.backgroundColor = 'var(--plx-primary)')}
          >
            {isProcessing ? <><Loader2 size={14} className="animate-spin" />{t('booking.processing')}</> : <><DollarSign size={14} />{t('booking.completePayment')}</>}
          </button>
        )}
        <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.name + ' with ' + business.name)}&dates=${toDateString(date).replace(/-/g, '')}T${time.replace(':', '')}00/${toDateString(date).replace(/-/g, '')}T${time.replace(':', '')}00`}
          target="_blank" rel="noopener noreferrer"
          className="block w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ border: '1px solid var(--plx-border)', color: '#475569', fontFamily: 'DM Sans, sans-serif', backgroundColor: 'white', textDecoration: 'none' }}
        >
          {t('booking.addToCalendar')}
        </a>
        <button onClick={onBookAnother} className="w-full py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--plx-primary)')}
        >
          {t('booking.bookAnother')}
        </button>
      </div>
    </div>
  );
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────
function SummaryBar({ service, date, time }: { service: AppointmentType; date?: Date | null; time?: string | null }) {
  return (
    <div className="rounded-xl p-3 mb-5 flex items-center gap-3" style={{ backgroundColor: service.color_hex + '15', border: `1px solid ${service.color_hex}30` }}>
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: service.color_hex }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>{service.name}</div>
        <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
          {formatDuration(service.duration_minutes)} · {formatPrice(service.price_cents)}
          {date && ` · ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
          {time && ` · ${formatTime12h(time)}`}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookingPage() {
  const { t } = useTranslation();
  const [, routeParams] = useRoute("/book/:slug");
  const slug = routeParams?.slug ?? "";

  const catalogQuery = trpc.booking.getCatalog.useQuery({ slug }, { enabled: slug.length > 0 });
  const scheduleQuery = trpc.booking.getSchedule.useQuery({ slug }, { enabled: slug.length > 0 });

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const slotsQuery = trpc.booking.getAvailableSlots.useQuery(
    {
      slug,
      date: selectedDate ? toDateString(selectedDate) : '',
      durationMinutes: selectedService?.duration_minutes ?? 60,
      bufferMinutes: selectedService?.buffer_after_minutes ?? 0,
    },
    { enabled: !!selectedDate && !!selectedService && step === 'time' }
  );

  const createBookingMutation = trpc.booking.createBooking.useMutation();
  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation();

  const handleReset = () => {
    setStep('service'); setSelectedService(null); setSelectedDate(null); setSelectedTime(null);
    setForm({ name: '', email: '', phone: '', notes: '' });
  };

  const handleConfirm = async () => {
    if (!form.name || !form.email) { toast.error(t('booking.errors.nameEmail')); return; }
    if (!selectedService || !selectedDate || !selectedTime) return;
    try {
      await createBookingMutation.mutateAsync({
        slug,
        appointmentTypeId: selectedService.id,
        appointmentTypeName: selectedService.name,
        date: toDateString(selectedDate),
        time: selectedTime,
        durationMinutes: selectedService.duration_minutes,
        priceCents: selectedService.price_cents,
        clientName: form.name,
        clientEmail: form.email,
        clientPhone: form.phone || undefined,
        notes: form.notes || undefined,
      });
      setStep('confirmation');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('booking.errors.couldNotBook');
      toast.error(msg);
    }
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
      if (result.checkoutUrl) window.open(result.checkoutUrl, '_blank');
    } catch {
      toast.error(t('booking.errors.paymentFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const stepOrder: Step[] = ['service', 'date', 'time', 'details', 'confirmation'];
  const currentStepIdx = stepOrder.indexOf(step);
  const enabledDays = scheduleQuery.data?.enabledDays ?? [1, 2, 3, 4, 5];

  if (!slug.trim()) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--plx-bg)' }}>
      <p className="text-sm text-center" style={{ color: "#64748B", fontFamily: "DM Sans, sans-serif" }}>
        {t('booking.errors.missingLink')} <code className="text-xs">/book/your-business</code>
      </p>
    </div>
  );

  if (catalogQuery.isLoading) return <PageLoader />;

  if (catalogQuery.error || !catalogQuery.data?.found) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--plx-bg)' }}>
      <p className="text-sm text-center max-w-sm" style={{ color: "#64748B", fontFamily: "DM Sans, sans-serif" }}>
        {catalogQuery.error ? t('booking.errors.couldNotLoad') : t('booking.errors.notFound')}
      </p>
    </div>
  );

  const { business, appointmentTypes } = catalogQuery.data;

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--plx-bg)' }}>
      <div className="max-w-[520px] mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ backgroundColor: 'var(--plx-pale)', color: 'var(--plx-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            <span className="pulse-dot" /> {t('booking.bookingAvailable')}
          </div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}>{business.name}</h1>
          <p className="text-sm" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>{business.description}</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
            <MapPin size={11} />{business.timezone}
          </div>
        </div>

        <div className="flex gap-1 mb-8 justify-center">
          {stepOrder.map((s, idx) => (
            <div key={s} className="h-1 rounded-full transition-all" style={{ width: idx <= currentStepIdx ? '24px' : '8px', backgroundColor: idx <= currentStepIdx ? 'var(--plx-primary)' : 'var(--plx-border)' }} />
          ))}
        </div>

        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: 'white', border: '1px solid var(--plx-border)' }}>
          {step === 'service' && (
            <ServiceStep appointmentTypes={appointmentTypes} onSelect={svc => { setSelectedService(svc); setStep('date'); }} />
          )}
          {step === 'date' && selectedService && (
            <>
              <SummaryBar service={selectedService} />
              <DateStep selectedDate={selectedDate} enabledDays={enabledDays} onSelect={d => { setSelectedDate(d); setSelectedTime(null); setStep('time'); }} />
            </>
          )}
          {step === 'time' && selectedService && (
            <>
              <SummaryBar service={selectedService} date={selectedDate} />
              <TimeStep
                slots={slotsQuery.data?.slots ?? []}
                isLoading={slotsQuery.isLoading}
                selectedTime={selectedTime}
                onSelect={slot => { setSelectedTime(slot); setStep('details'); }}
              />
            </>
          )}
          {step === 'details' && selectedService && (
            <>
              <SummaryBar service={selectedService} date={selectedDate} time={selectedTime} />
              <DetailsStep form={form} onChange={(f, v) => setForm(prev => ({ ...prev, [f]: v }))} />
            </>
          )}
          {step === 'confirmation' && selectedService && selectedDate && selectedTime && (
            <ConfirmationStep
              service={selectedService} date={selectedDate} time={selectedTime}
              business={business} onBookAnother={handleReset}
              onPaymentClick={handlePaymentClick} isProcessing={isProcessing}
            />
          )}
        </div>

        {step !== 'confirmation' && (
          <div className="flex gap-3">
            {currentStepIdx > 0 && (
              <button onClick={() => setStep(stepOrder[currentStepIdx - 1])} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--plx-border)', color: '#475569', fontFamily: 'DM Sans, sans-serif', backgroundColor: 'white' }}>
                {t('common.back')}
              </button>
            )}
            {step !== 'service' && step !== 'time' && (
              <button
                onClick={() => { if (step === 'details') { handleConfirm(); return; } }}
                disabled={step === 'date' && !selectedDate || createBookingMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif',
                  opacity: (step === 'date' && !selectedDate) || createBookingMutation.isPending ? 0.5 : 1,
                }}
              >
                {createBookingMutation.isPending ? <><Loader2 size={14} className="animate-spin" />{t('booking.bookingInProgress')}</> : step === 'details' ? t('booking.confirmBooking') : t('common.continue')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
