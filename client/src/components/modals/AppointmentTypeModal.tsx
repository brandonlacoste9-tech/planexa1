// Planexa — AppointmentTypeModal
// Design: White modal, color swatch picker, DM Sans form

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

const COLOR_SWATCHES = [
  '#2D6A4F', '#40916C', '#52B788', '#7C3AED', '#A855F7',
  '#D97706', '#F59E0B', '#DC2626', '#0EA5E9', '#475569',
];

const BUFFER_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '5', label: '5 min' },
  { value: '10', label: '10 min' },
  { value: '15', label: '15 min' },
];

export default function AppointmentTypeModal({ onClose }: Props) {
  const [form, setForm] = useState({
    name: '',
    duration_minutes: 60,
    price_cents: 0,
    color_hex: '#2D6A4F',
    buffer_after_minutes: 0,
    description: '',
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Please enter a name for this appointment type.');
      return;
    }
    toast.success('Appointment type saved!', {
      description: `"${form.name}" has been added to your services.`,
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
          border: '1px solid #E8E0D0',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #E8E0D0' }}
        >
          <h2
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
            className="text-xl"
          >
            New Appointment Type
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: '#64748B' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Strategy Call"
              className="w-full planexa-input"
              required
            />
          </div>

          {/* Duration + Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                Duration (minutes) *
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
                Price (USD) — 0 = Free
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

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              Color
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

          {/* Buffer Time */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              Buffer Time After
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

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description shown to clients..."
              rows={2}
              className="w-full planexa-input resize-none"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
              Active (visible to clients)
            </span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ backgroundColor: form.is_active ? '#2D6A4F' : '#CBD5E1' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: form.is_active ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid #E8E0D0' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid #E8E0D0', color: '#475569', fontFamily: 'DM Sans, sans-serif', backgroundColor: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
            >
              Save Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
