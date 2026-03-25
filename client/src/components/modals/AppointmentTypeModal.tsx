// Planexa — AppointmentTypeModal
// Design: White modal, color swatch picker, DM Sans form

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Props {
  onClose: () => void;
}

const COLOR_SWATCHES = [
  '#2D6A4F', '#40916C', '#52B788', '#7C3AED', '#A855F7',
  '#D97706', '#F59E0B', '#DC2626', '#0EA5E9', '#475569',
];

export default function AppointmentTypeModal({ onClose }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    duration_minutes: 60,
    price_cents: 0,
    color_hex: '#2D6A4F',
    buffer_after_minutes: 0,
    description: '',
    is_active: true,
  });

  const BUFFER_OPTIONS = [
    { value: '0', label: t('modals.appointmentType.bufferOptions.none') },
    { value: '5', label: t('modals.appointmentType.bufferOptions.5min') },
    { value: '10', label: t('modals.appointmentType.bufferOptions.10min') },
    { value: '15', label: t('modals.appointmentType.bufferOptions.15min') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error(t('modals.appointmentType.nameError'));
      return;
    }
    toast.success(t('modals.appointmentType.saved'), {
      description: t('modals.appointmentType.savedDesc', { name: form.name }),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: 'white',
          border: '1px solid var(--plx-border)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--plx-border)' }}
        >
          <h2
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
            className="text-xl"
          >
            {t('modals.appointmentType.title')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: '#64748B' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-pale)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              {t('modals.appointmentType.name')}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('modals.appointmentType.namePlaceholder')}
              className="w-full planexa-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                {t('modals.appointmentType.duration')}
              </label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                min={5}
                max={480}
                className="w-full planexa-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                {t('modals.appointmentType.price')}
              </label>
              <input
                type="number"
                value={form.price_cents / 100}
                onChange={e => setForm(f => ({ ...f, price_cents: Math.round(Number(e.target.value) * 100) }))}
                min={0}
                step={0.01}
                className="w-full planexa-input"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              {t('modals.appointmentType.color')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_SWATCHES.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color_hex: color }))}
                  className="w-7 h-7 rounded-full transition-transform"
                  style={{
                    backgroundColor: color,
                    transform: form.color_hex === color ? 'scale(1.2)' : 'scale(1)',
                    outline: form.color_hex === color ? `2px solid ${color}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              {t('modals.appointmentType.buffer')}
            </label>
            <select
              value={String(form.buffer_after_minutes)}
              onChange={e => setForm(f => ({ ...f, buffer_after_minutes: Number(e.target.value) }))}
              className="w-full planexa-input"
            >
              {BUFFER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              {t('modals.appointmentType.description')}
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={t('modals.appointmentType.descriptionPlaceholder')}
              rows={2}
              className="w-full planexa-input resize-none"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              {t('modals.appointmentType.active')}
            </span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ backgroundColor: form.is_active ? 'var(--plx-primary)' : '#CBD5E1' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: form.is_active ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--plx-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--plx-border)', color: '#475569', fontFamily: 'DM Sans, sans-serif', backgroundColor: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-pale)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--plx-primary)')}
            >
              {t('modals.appointmentType.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
