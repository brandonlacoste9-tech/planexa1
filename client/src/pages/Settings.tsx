// Planexa — Settings Page
// Design: Sectioned settings with sidebar nav, DM Sans forms

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { PALETTES } from '../themes';
import { Building2, Clock, Users, Bell, Link2, CreditCard, ChevronRight, Palette, Check } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardNav from '../components/layout/DashboardNav';
import DashboardFooter from '../components/layout/DashboardFooter';
import { trpc } from '../lib/trpc';
import { businessInfo } from '../lib/data';

type ProfileDraft = {
  name: string;
  slug: string;
  description: string;
  timezone: string;
};

const DAYS_KEYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const TIMEZONES = [
  'America/Toronto',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
];

const SECTION_KEYS = [
  { id: 'profile', icon: Building2 },
  { id: 'hours', icon: Clock },
  { id: 'team', icon: Users },
  { id: 'notifications', icon: Bell },
  { id: 'integrations', icon: Link2 },
  { id: 'billing', icon: CreditCard },
  { id: 'appearance', icon: Palette },
] as const;

const integrationList = [
  { id: 'google', connected: false, icon: '📅' },
  { id: 'outlook', connected: false, icon: '📧' },
  { id: 'zoom', connected: false, icon: '🎥' },
  { id: 'whatsapp', connected: false, icon: '💬' },
  { id: 'calendly', connected: false, icon: '🗓️' },
] as const;

export default function SettingsPage() {
  const { t } = useTranslation();
  const { paletteId, setPaletteId, customColors, setCustomColors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const DAYS = DAYS_KEYS.map(d => ({ key: d, label: t(`settings.days.${d}` as any) }));
  const sections = SECTION_KEYS.map(s => ({ ...s, label: t(`settings.sections.${s.id}` as any) }));
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState<ProfileDraft>({
    name: businessInfo.name,
    slug: businessInfo.slug,
    description: businessInfo.description,
    timezone: businessInfo.timezone,
  });
  const [profileHydrated, setProfileHydrated] = useState(false);

  const profileQuery = trpc.settings.getBusinessProfile.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const updateMutation = trpc.settings.updateBusinessProfile.useMutation({
    onSuccess: async () => {
      toast.success(t('settings.profile.saved'));
      setProfileHydrated(false);
      await utils.settings.getBusinessProfile.invalidate();
      await utils.auth.me.invalidate();
    },
    onError: err => {
      toast.error(err instanceof Error ? err.message : t('settings.profile.saveError'));
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setProfileHydrated(false);
      setProfile({
        name: businessInfo.name,
        slug: businessInfo.slug,
        description: businessInfo.description,
        timezone: businessInfo.timezone,
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setProfileHydrated(false);
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !profileQuery.isSuccess || !profileQuery.data) return;
    if (profileHydrated) return;
    setProfile({
      name: profileQuery.data.name,
      slug: profileQuery.data.slug,
      description: profileQuery.data.description,
      timezone: profileQuery.data.timezone,
    });
    setProfileHydrated(true);
  }, [isAuthenticated, profileHydrated, profileQuery.data, profileQuery.isSuccess]);
  const availabilityQuery = trpc.settings.getAvailability.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const updateAvailabilityMutation = trpc.settings.updateAvailability.useMutation({
    onSuccess: () => toast.success(t('settings.hours.saved')),
    onError: () => toast.error(t('settings.hours.saveError')),
  });

  // Map DAYS (Mon-first) to dayOfWeek (0=Sun). Index i → dayOfWeek = (i+1)%7
  const [workingHours, setWorkingHours] = useState(
    DAYS_KEYS.map((dayKey, i) => ({
      dayKey,
      dayOfWeek: (i + 1) % 7,
      enabled: i < 5,
      start: '09:00',
      end: '17:00',
    }))
  );
  const [hoursHydrated, setHoursHydrated] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !availabilityQuery.isSuccess || !availabilityQuery.data || hoursHydrated) return;
    const data = availabilityQuery.data;
    setWorkingHours(prev => prev.map(wh => {
      const row = data.find(r => r.dayOfWeek === wh.dayOfWeek);
      return row ? { ...wh, enabled: row.isEnabled, start: row.startTime, end: row.endTime } : wh;
    }));
    setHoursHydrated(true);
  }, [isAuthenticated, availabilityQuery.isSuccess, availabilityQuery.data, hoursHydrated]);
  const [integrations, setIntegrations] = useState<Record<string, boolean>>(
    Object.fromEntries(integrationList.map(i => [i.id, i.connected]))
  );
  const [reminderHours, setReminderHours] = useState(24);

  const handleSaveProfile = () => {
    if (!isAuthenticated) {
      toast.error(t('settings.profile.signInError'));
      return;
    }
    updateMutation.mutate(profile);
  };

  const handleToggleIntegration = (_id: string, name: string) => {
    toast.info(t('settings.integrations.comingSoon', { name }));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--plx-bg)' }}>
      <DashboardNav />

      <div className="flex flex-1 overflow-hidden pt-14 pb-12">
        {/* Settings Sidebar */}
        <aside
          className="hidden md:flex flex-col shrink-0 overflow-y-auto py-4"
          style={{ width: 220, borderRight: '1px solid var(--plx-border)', backgroundColor: 'white' }}
        >
          <div className="px-4 mb-3">
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
            >
              {t('settings.title')}
            </span>
          </div>
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                color: activeSection === id ? 'var(--plx-primary)' : '#475569',
                backgroundColor: activeSection === id ? 'var(--plx-pale)' : 'transparent',
                borderRight: activeSection === id ? '2px solid var(--plx-primary)' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeSection !== id) e.currentTarget.style.backgroundColor = 'var(--plx-bg)';
              }}
              onMouseLeave={e => {
                if (activeSection !== id) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </aside>

        {/* Settings Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6">

            {/* Business Profile */}
            {activeSection === 'profile' && (
              <div>
                <h2
                  className="text-xl mb-1"
                  style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
                >
                  {t('settings.profile.title')}
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  {t('settings.profile.subtitle')}
                </p>
                <div className="planexa-card p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                      {t('settings.profile.nameLabel')}
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full planexa-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                      {t('settings.profile.slugLabel')}
                    </label>
                    <div className="flex items-center gap-0">
                      <span
                        className="px-3 py-2 text-sm rounded-l-lg border border-r-0"
                        style={{ backgroundColor: 'var(--plx-pale)', borderColor: 'var(--plx-border)', color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {t('settings.profile.slugPrefix')}
                      </span>
                      <input
                        type="text"
                        value={profile.slug}
                        onChange={e => setProfile(p => ({ ...p, slug: e.target.value }))}
                        className="flex-1 planexa-input"
                        style={{ borderRadius: '0 8px 8px 0' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                      {t('settings.profile.descLabel')}
                    </label>
                    <textarea
                      value={profile.description}
                      onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full planexa-input resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                      {t('settings.profile.timezoneLabel')}
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                      className="w-full planexa-input"
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-2" style={{ borderTop: '1px solid var(--plx-border)' }}>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={
                        updateMutation.isPending ||
                        (isAuthenticated && profileQuery.isLoading)
                      }
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                      onMouseEnter={e => {
                        if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--plx-hover)';
                      }}
                      onMouseLeave={e => {
                        if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--plx-primary)';
                      }}
                    >
                      {updateMutation.isPending ? t('common.saving') : t('common.save')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Working Hours */}
            {activeSection === 'hours' && (
              <div>
                <h2
                  className="text-xl mb-1"
                  style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
                >
                  {t('settings.hours.title')}
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  {t('settings.hours.subtitle')}
                </p>
                <div className="planexa-card p-5 space-y-3">
                  {workingHours.map((wh, i) => (
                    <div key={wh.dayKey} className="flex items-center gap-3">
                      <button
                        onClick={() => setWorkingHours(prev => prev.map((h, j) => j === i ? { ...h, enabled: !h.enabled } : h))}
                        className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                        style={{ backgroundColor: wh.enabled ? 'var(--plx-primary)' : '#CBD5E1' }}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                          style={{ transform: wh.enabled ? 'translateX(18px)' : 'translateX(2px)' }}
                        />
                      </button>
                      <span
                        className="w-24 text-sm"
                        style={{ color: wh.enabled ? '#1E293B' : '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {t(`settings.days.${wh.dayKey}` as any)}
                      </span>
                      {wh.enabled ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={wh.start}
                            onChange={e => setWorkingHours(prev => prev.map((h, j) => j === i ? { ...h, start: e.target.value } : h))}
                            className="planexa-input text-sm"
                            style={{ width: 110 }}
                          />
                          <span className="text-xs" style={{ color: '#94A3B8' }}>{t('settings.hours.to')}</span>
                          <input
                            type="time"
                            value={wh.end}
                            onChange={e => setWorkingHours(prev => prev.map((h, j) => j === i ? { ...h, end: e.target.value } : h))}
                            className="planexa-input text-sm"
                            style={{ width: 110 }}
                          />
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>{t('settings.hours.unavailable')}</span>
                      )}
                    </div>
                  ))}
                  <div className="pt-2" style={{ borderTop: '1px solid var(--plx-border)' }}>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) { toast.error(t('settings.hours.signInError')); return; }
                        updateAvailabilityMutation.mutate({
                          schedule: workingHours.map(wh => ({
                            dayOfWeek: wh.dayOfWeek,
                            startTime: wh.start,
                            endTime: wh.end,
                            isEnabled: wh.enabled,
                          })),
                        });
                      }}
                      disabled={updateAvailabilityMutation.isPending}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                      onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--plx-hover)'; }}
                      onMouseLeave={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--plx-primary)'; }}
                    >
                      {updateAvailabilityMutation.isPending ? t('common.saving') : t('settings.hours.saveHours')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            {activeSection === 'team' && (
              <div>
                <h2
                  className="text-xl mb-1"
                  style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
                >
                  {t('settings.team.title')}
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  {t('settings.team.subtitle')}
                </p>
                <div className="planexa-card p-5 space-y-3">
                  {user && (
                    <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--plx-border)' }}>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--plx-primary) 15%, transparent)', color: 'var(--plx-primary)', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {(user.name ?? user.email ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                          {user.name ?? user.email ?? t('settings.team.you')}
                        </div>
                        <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>{t('settings.team.owner')}</div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => toast.info(t('common.comingSoon'))}
                    className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                    style={{
                      border: '1.5px dashed #CBD5E1',
                      color: '#64748B',
                      fontFamily: 'DM Sans, sans-serif',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--plx-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
                  >
                    {t('settings.team.invite')}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div>
                <h2
                  className="text-xl mb-1"
                  style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
                >
                  {t('settings.notifications.title')}
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  {t('settings.notifications.subtitle')}
                </p>
                <div className="planexa-card p-5 space-y-4">
                  <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--plx-pale)', border: '1px solid var(--plx-border)' }}>
                    <span style={{ fontSize: 18 }}>🔔</span>
                    <div>
                      <div className="text-sm font-medium mb-1" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                        {t('settings.notifications.comingSoon')}
                      </div>
                      <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                        {t('settings.notifications.comingSoonDesc')}
                      </div>
                    </div>
                  </div>
                  {[
                    { label: t('settings.notifications.items.booking'), desc: t('settings.notifications.items.bookingDesc') },
                    { label: t('settings.notifications.items.reminder'), desc: t('settings.notifications.items.reminderDesc') },
                    { label: t('settings.notifications.items.cancel'), desc: t('settings.notifications.items.cancelDesc') },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-start justify-between gap-3 py-2" style={{ borderTop: '1px solid var(--plx-border)' }}>
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>{label}</div>
                        <div className="text-xs" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>{desc}</div>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: '#F1F5F9', color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {t('common.soon')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeSection === 'integrations' && (
              <div>
                <h2
                  className="text-xl mb-1"
                  style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
                >
                  {t('settings.integrations.title')}
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  {t('settings.integrations.subtitle')}
                </p>
                <div className="space-y-3">
                  {integrationList.map(item => {
                    const isConnected = integrations[item.id];
                    const name = t(`settings.integrations.items.${item.id}.name` as any);
                    const desc = t(`settings.integrations.items.${item.id}.desc` as any);
                    return (
                      <div key={item.id} className="planexa-card p-4 flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ backgroundColor: 'var(--plx-pale)' }}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                            {name}
                          </div>
                          <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                            {desc}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleIntegration(item.id, name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0"
                          style={{
                            backgroundColor: isConnected ? 'var(--plx-pale)' : 'var(--plx-primary)',
                            color: isConnected ? 'var(--plx-primary)' : 'white',
                            fontFamily: 'DM Sans, sans-serif',
                          }}
                        >
                          {isConnected ? t('common.connected') : t('common.connect')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Billing */}
            {activeSection === 'billing' && (
              <div>
                <h2
                  className="text-xl mb-1"
                  style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
                >
                  {t('settings.billing.title')}
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  {t('settings.billing.subtitle')}
                </p>
                <div className="planexa-card p-5">
                  <div
                    className="rounded-xl p-5 mb-4"
                    style={{ background: 'linear-gradient(135deg, #1E293B 0%, var(--plx-primary) 100%)' }}
                  >
                    <div className="text-xs font-medium mb-1" style={{ color: '#52B788', fontFamily: 'DM Sans, sans-serif' }}>
                      {t('settings.billing.currentPlan')}
                    </div>
                    <div className="text-2xl mb-1" style={{ fontFamily: 'Fraunces, serif', color: 'white', fontWeight: 300 }}>
                      {user?.subscriptionStatus === 'active' ? t('settings.billing.professional') : t('settings.billing.freeTrial')}
                    </div>
                    <div className="text-sm" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
                      {user?.subscriptionStatus === 'active'
                        ? t('settings.billing.active')
                        : user?.trialEndsAt
                          ? `${t('settings.billing.trialEnds')} ${new Date(user.trialEndsAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`
                          : t('settings.billing.noSubscription')}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {(t('settings.billing.features', { returnObjects: true }) as string[]).map((f: string) => (
                      <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                        <span style={{ color: 'var(--plx-primary)' }}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--plx-border)' }}>
                    <button
                      onClick={() => toast.info(t('common.comingSoon'))}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ border: '1px solid var(--plx-border)', color: '#475569', fontFamily: 'DM Sans, sans-serif', backgroundColor: 'transparent' }}
                    >
                      {t('settings.billing.manageBilling')}
                    </button>
                    <button
                      onClick={() => toast.info(t('common.comingSoon'))}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {t('common.upgrade')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <div>
                <h2
                  className="text-xl mb-1"
                  style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
                >
                  {t('settings.appearance.title')}
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  {t('settings.appearance.subtitle')}
                </p>
                <div className="planexa-card p-5 space-y-6">
                  {/* Preset Palettes */}
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                      {t('settings.appearance.presets')}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {PALETTES.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setPaletteId(p.id)}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                          style={{
                            border: paletteId === p.id ? `2px solid ${p.primary}` : '2px solid transparent',
                            backgroundColor: paletteId === p.id ? 'var(--plx-pale)' : 'transparent',
                          }}
                        >
                          <span
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: p.primary }}
                          >
                            {paletteId === p.id && <Check size={14} color="white" />}
                          </span>
                          <span className="text-xs text-center" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                            {t(p.labelKey as any)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colours */}
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                      {t('settings.appearance.customTitle')}
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: t('settings.appearance.primaryColor'), key: 'primary' as const, value: customColors.primary },
                        { label: t('settings.appearance.bgColor'), key: 'bgPage' as const, value: customColors.bgPage },
                        { label: t('settings.appearance.borderColor'), key: 'border' as const, value: customColors.border },
                      ].map(({ label, key, value }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>{value}</span>
                            <input
                              type="color"
                              value={value}
                              onChange={e => setCustomColors({ [key]: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                      {t('settings.appearance.preview')}
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ backgroundColor: 'var(--plx-bg)', border: '1px solid var(--plx-border)' }}
                    >
                      <div className="text-sm mb-3" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                        {t('settings.appearance.previewText')}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-1.5 rounded-lg text-sm font-medium"
                          style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                        >
                          {t('settings.appearance.previewButton')}
                        </button>
                        <div
                          className="px-3 py-1.5 rounded-lg text-sm"
                          style={{ backgroundColor: 'var(--plx-pale)', color: 'var(--plx-primary)', fontFamily: 'DM Sans, sans-serif', border: '1px solid var(--plx-border)' }}
                        >
                          {t('settings.appearance.previewCard')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
}
