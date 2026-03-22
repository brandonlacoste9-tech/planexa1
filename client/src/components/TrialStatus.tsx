import { AlertCircle, Gift } from 'lucide-react';

export interface TrialStatusProps {
  isActive: boolean;
  daysRemaining: number;
  endsAt: Date | null;
}

export function TrialStatus({ isActive, daysRemaining, endsAt }: TrialStatusProps) {
  if (!isActive || !endsAt) return null;

  const isExpiringSoon = daysRemaining <= 2;

  return (
    <div
      className="rounded-lg p-4 mb-4 flex items-start gap-3"
      style={{
        backgroundColor: isExpiringSoon ? '#FEF3C7' : '#D8F3DC',
        border: `1px solid ${isExpiringSoon ? '#FCD34D' : '#86EFAC'}`,
      }}
    >
      <div style={{ color: isExpiringSoon ? '#D97706' : '#2D6A4F', marginTop: '2px' }}>
        {isExpiringSoon ? <AlertCircle size={18} /> : <Gift size={18} />}
      </div>
      <div className="flex-1">
        <div
          className="font-semibold text-sm"
          style={{ color: isExpiringSoon ? '#D97706' : '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}
        >
          {isExpiringSoon ? 'Trial Ending Soon' : 'Free Trial Active'}
        </div>
        <div className="text-xs mt-1" style={{ color: isExpiringSoon ? '#92400E' : '#1E7A34', fontFamily: 'DM Sans, sans-serif' }}>
          {daysRemaining === 0
            ? 'Your trial ends today. Add a payment method to continue.'
            : daysRemaining === 1
            ? 'Your trial ends tomorrow. Add a payment method to continue.'
            : `${daysRemaining} days remaining. Payment required after trial ends.`}
        </div>
      </div>
    </div>
  );
}
