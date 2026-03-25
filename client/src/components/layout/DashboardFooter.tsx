import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const integrations = [
  { id: 'google', label: 'Google Cal' },
  { id: 'outlook', label: 'Outlook' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

export default function DashboardFooter() {
  const { t } = useTranslation();
  const [connected] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map(i => [i.id, false]))
  );

  return (
    <footer
      style={{ backgroundColor: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      className="h-12 flex items-center px-4 gap-6 shrink-0"
    >
      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        <span className="text-xs font-medium shrink-0" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
          {t('footer.integrations')}
        </span>
        <div className="flex items-center gap-1.5">
          {integrations.map(({ id, label }) => {
            const isConnected = connected[id];
            return (
              <button
                key={id}
                onClick={() => toast.info(t('footer.comingSoon', { label }))}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  backgroundColor: isConnected ? 'rgba(45, 106, 79, 0.2)' : 'rgba(255,255,255,0.06)',
                  color: isConnected ? '#52B788' : '#64748B',
                  border: isConnected ? '1px solid rgba(82, 183, 136, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {isConnected ? (
                  <><span className="pulse-dot" style={{ width: 5, height: 5 }} /><Check size={9} />{label}</>
                ) : (
                  <>{label}<span className="text-xs opacity-40">+</span></>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
