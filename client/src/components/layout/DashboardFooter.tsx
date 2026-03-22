// Planexa — DashboardFooter
// Design: Slate-dark (#1E293B) background, integration pills, weekly stats

import { useState } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

const integrations = [
  { id: 'google', label: 'Google Cal', connected: true },
  { id: 'outlook', label: 'Outlook', connected: false },
  { id: 'zoom', label: 'Zoom', connected: true },
  { id: 'whatsapp', label: 'WhatsApp', connected: false },
  { id: 'calendly', label: 'Calendly', connected: false },
];

const stats = [
  { label: 'this week', value: '12' },
  { label: 'show rate', value: '91%' },
  { label: 'revenue', value: '$2,840' },
];

export default function DashboardFooter() {
  const [connected, setConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map(i => [i.id, i.connected]))
  );

  const handleConnect = (id: string, label: string) => {
    if (connected[id]) {
      toast.success(`${label} disconnected`);
      setConnected(prev => ({ ...prev, [id]: false }));
    } else {
      toast.success(`${label} connected!`, { description: 'Integration is now active.' });
      setConnected(prev => ({ ...prev, [id]: true }));
    }
  };

  return (
    <footer
      style={{ backgroundColor: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      className="h-12 flex items-center px-4 gap-6 shrink-0"
    >
      {/* Integrations */}
      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        <span
          className="text-xs font-medium shrink-0"
          style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
        >
          Integrations
        </span>
        <div className="flex items-center gap-1.5">
          {integrations.map(({ id, label }) => {
            const isConnected = connected[id];
            return (
              <button
                key={id}
                onClick={() => handleConnect(id, label)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  backgroundColor: isConnected ? 'rgba(45, 106, 79, 0.2)' : 'rgba(255,255,255,0.06)',
                  color: isConnected ? '#52B788' : '#64748B',
                  border: isConnected ? '1px solid rgba(82, 183, 136, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {isConnected ? (
                  <>
                    <span className="pulse-dot" style={{ width: 5, height: 5 }} />
                    <Check size={9} />
                    {label}
                  </>
                ) : (
                  <>
                    {label}
                    <span className="text-xs opacity-60">+</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-4 shrink-0">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-1">
            <span
              style={{ fontFamily: 'Fraunces, serif', color: '#52B788', fontWeight: 400 }}
              className="text-sm"
            >
              {value}
            </span>
            <span
              style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
              className="text-xs"
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
}
