import { useState } from 'react';
import { X, Calendar, Clock, User, Mail, FileText, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { appointmentTypes, formatDuration, formatPrice } from '../../lib/data';

interface Props {
  onClose: () => void;
  prefillDate?: string;
  prefillClientId?: string;
}

export default function NewAppointmentModal({ onClose, prefillDate }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    appointment_type_id: '',
    date: prefillDate || new Date().toISOString().split('T')[0],
    start_time: '09:00',
    notes: '',
    send_reminder: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name || !form.client_email || !form.appointment_type_id) {
      toast.error(t('modals.newAppointment.requiredError'));
      return;
    }
    toast.success(t('modals.newAppointment.created'), {
      description: `${form.client_name} — ${new Date(form.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${form.start_time}`,
    });
    onClose();
  };

  const selectedType = appointmentTypes.find(tp => tp.id === form.appointment_type_id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md" style={{ background: 'white', border: '1px solid var(--plx-border)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--plx-border)' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }} className="text-xl">
            {t('modals.newAppointment.title')}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors" style={{ color: '#64748B' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-pale)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              <User size={11} className="inline mr-1" />{t('modals.newAppointment.clientName')}
            </label>
            <input type="text" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
              placeholder={t('modals.newAppointment.clientNamePlaceholder')} className="w-full planexa-input" required />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              <Mail size={11} className="inline mr-1" />{t('modals.newAppointment.clientEmail')}
            </label>
            <input type="email" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
              placeholder={t('modals.newAppointment.clientEmailPlaceholder')} className="w-full planexa-input" required />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              {t('modals.newAppointment.type')}
            </label>
            <select value={form.appointment_type_id} onChange={e => setForm(f => ({ ...f, appointment_type_id: e.target.value }))}
              className="w-full planexa-input" required>
              <option value="">{t('modals.newAppointment.typePlaceholder')}</option>
              {appointmentTypes.filter(tp => tp.is_active).map(tp => (
                <option key={tp.id} value={tp.id}>{tp.name} — {formatDuration(tp.duration_minutes)} · {formatPrice(tp.price_cents)}</option>
              ))}
            </select>
            {selectedType && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedType.color_hex }} />
                <span className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>{selectedType.description}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                <Calendar size={11} className="inline mr-1" />{t('modals.newAppointment.date')}
              </label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full planexa-input" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                <Clock size={11} className="inline mr-1" />{t('modals.newAppointment.time')}
              </label>
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full planexa-input" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              <FileText size={11} className="inline mr-1" />{t('modals.newAppointment.notes')}
            </label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={t('modals.newAppointment.notesPlaceholder')} rows={2} className="w-full planexa-input resize-none" />
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Bell size={13} style={{ color: '#64748B' }} />
              <span className="text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>{t('modals.newAppointment.reminder')}</span>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, send_reminder: !f.send_reminder }))}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ backgroundColor: form.send_reminder ? 'var(--plx-primary)' : '#CBD5E1' }}>
              <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: form.send_reminder ? 'translateX(22px)' : 'translateX(2px)' }} />
            </button>
          </div>

          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--plx-border)' }}>
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--plx-border)', color: '#475569', fontFamily: 'DM Sans, sans-serif', backgroundColor: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-pale)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--plx-primary)')}>
              {t('modals.newAppointment.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
