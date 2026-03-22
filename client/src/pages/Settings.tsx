// Planexa — Settings Page
// Design: Sectioned settings with sidebar nav, DM Sans forms

import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, Clock, Users, Bell, Link2, CreditCard, ChevronRight } from 'lucide-react';
import DashboardNav from '../components/layout/DashboardNav';
import DashboardFooter from '../components/layout/DashboardFooter';
import { businessInfo, teamMembers } from '../lib/data';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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

const sections = [
  { id: 'profile', label: 'Business Profile', icon: Building2 },
  { id: 'hours', label: 'Working Hours', icon: Clock },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const integrationList = [
  { id: 'google', name: 'Google Calendar', description: 'Sync appointments with Google Calendar', connected: true, icon: '📅' },
  { id: 'outlook', name: 'Microsoft Outlook', description: 'Sync with Outlook calendar and contacts', connected: false, icon: '📧' },
  { id: 'zoom', name: 'Zoom', description: 'Auto-generate Zoom links for virtual appointments', connected: true, icon: '🎥' },
  { id: 'whatsapp', name: 'WhatsApp Business', description: 'Send reminders via WhatsApp', connected: false, icon: '💬' },
  { id: 'calendly', name: 'Calendly', description: 'Import existing Calendly bookings', connected: false, icon: '🗓️' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState({
    name: businessInfo.name,
    slug: businessInfo.slug,
    description: businessInfo.description,
    timezone: businessInfo.timezone,
  });
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day, i) => ({
      day,
      enabled: i < 5,
      start: '09:00',
      end: '18:00',
    }))
  );
  const [integrations, setIntegrations] = useState<Record<string, boolean>>(
    Object.fromEntries(integrationList.map(i => [i.id, i.connected]))
  );
  const [reminderHours, setReminderHours] = useState(24);

  const handleSaveProfile = () => {
    toast.success('Business profile saved!');
  };

  const handleToggleIntegration = (id: string, name: string) => {
    setIntegrations(prev => {
      const newVal = !prev[id];
      toast.success(newVal ? `${name} connected!` : `${name} disconnected`);
      return { ...prev, [id]: newVal };
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#FAF7F2' }}>
      <DashboardNav />

      <div className="flex flex-1 overflow-hidden pt-14 pb-12">
        {/* Settings Sidebar */}
        <aside
          className="hidden md:flex flex-col shrink-0 overflow-y-auto py-4"
          style={{ width: 220, borderRight: '1px solid #E8E0D0', backgroundColor: 'white' }}
        >
          <div className="px-4 mb-3">
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
            >
              Settings
            </span>
          </div>
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                color: activeSection === id ? '#2D6A4F' : '#475569',
                backgroundColor: activeSection === id ? '#D8F3DC' : 'transparent',
                borderRight: activeSection === id ? '2px solid #2D6A4F' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeSection !== id) e.currentTarget.style.backgroundColor = '#FAF7F2';
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
                  Business Profile
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  Update your business information and booking URL.
                </p>
                <div className="planexa-card p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                      Business Name
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
                      Booking URL Slug
                    </label>
                    <div className="flex items-center gap-0">
                      <span
                        className="px-3 py-2 text-sm rounded-l-lg border border-r-0"
                        style={{ backgroundColor: '#F0EBE0', borderColor: '#E8E0D0', color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        planexa.co/book/
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
                      Description
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
                      Timezone
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
                  <div className="pt-2" style={{ borderTop: '1px solid #E8E0D0' }}>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
                    >
                      Save Changes
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
                  Working Hours
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  Set availability for client bookings.
                </p>
                <div className="planexa-card p-5 space-y-3">
                  {workingHours.map((wh, i) => (
                    <div key={wh.day} className="flex items-center gap-3">
                      <button
                        onClick={() => setWorkingHours(prev => prev.map((h, j) => j === i ? { ...h, enabled: !h.enabled } : h))}
                        className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                        style={{ backgroundColor: wh.enabled ? '#2D6A4F' : '#CBD5E1' }}
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
                        {wh.day}
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
                          <span className="text-xs" style={{ color: '#94A3B8' }}>to</span>
                          <input
                            type="time"
                            value={wh.end}
                            onChange={e => setWorkingHours(prev => prev.map((h, j) => j === i ? { ...h, end: e.target.value } : h))}
                            className="planexa-input text-sm"
                            style={{ width: 110 }}
                          />
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>Unavailable</span>
                      )}
                    </div>
                  ))}
                  <div className="pt-2" style={{ borderTop: '1px solid #E8E0D0' }}>
                    <button
                      onClick={() => toast.success('Working hours saved!')}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
                    >
                      Save Hours
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
                  Team Members
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  Manage your team and their roles.
                </p>
                <div className="planexa-card p-5 space-y-3">
                  {teamMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 py-2"
                      style={{ borderBottom: '1px solid #E8E0D0' }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                        style={{ backgroundColor: member.color_hex + '25', color: member.color_hex, fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {member.avatar_initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                          {member.name}
                        </div>
                        <div className="text-xs capitalize" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                          {member.role}
                        </div>
                      </div>
                      <button
                        onClick={() => toast.info('Feature coming soon')}
                        className="text-xs px-2.5 py-1 rounded-md transition-colors"
                        style={{ border: '1px solid #E8E0D0', color: '#475569', fontFamily: 'DM Sans, sans-serif', backgroundColor: 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => toast.info('Feature coming soon')}
                    className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                    style={{
                      border: '1.5px dashed #CBD5E1',
                      color: '#64748B',
                      fontFamily: 'DM Sans, sans-serif',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#52B788')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
                  >
                    + Invite Team Member
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
                  Notifications
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  Configure email reminders and alerts.
                </p>
                <div className="planexa-card p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                      Send reminder email
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={reminderHours}
                        onChange={e => setReminderHours(Number(e.target.value))}
                        min={1}
                        max={72}
                        className="planexa-input"
                        style={{ width: 80 }}
                      />
                      <span className="text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                        hours before appointment
                      </span>
                    </div>
                  </div>
                  {[
                    { label: 'New booking confirmation', desc: 'Email client when appointment is booked' },
                    { label: 'Cancellation notification', desc: 'Notify client when appointment is cancelled' },
                    { label: 'Internal team alerts', desc: 'Notify team members of new bookings' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-start justify-between gap-3 py-2" style={{ borderTop: '1px solid #E8E0D0' }}>
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>{label}</div>
                        <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>{desc}</div>
                      </div>
                      <button
                        className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                        style={{ backgroundColor: '#2D6A4F' }}
                        onClick={() => toast.info('Feature coming soon')}
                      >
                        <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow" />
                      </button>
                    </div>
                  ))}
                  <div className="pt-2" style={{ borderTop: '1px solid #E8E0D0' }}>
                    <button
                      onClick={() => toast.success('Notification settings saved!')}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
                    >
                      Save Settings
                    </button>
                  </div>
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
                  Integrations
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  Connect your favorite tools and services.
                </p>
                <div className="space-y-3">
                  {integrationList.map(item => {
                    const isConnected = integrations[item.id];
                    return (
                      <div key={item.id} className="planexa-card p-4 flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ backgroundColor: '#F0EBE0' }}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                            {item.name}
                          </div>
                          <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                            {item.description}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleIntegration(item.id, item.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0"
                          style={{
                            backgroundColor: isConnected ? '#D8F3DC' : '#2D6A4F',
                            color: isConnected ? '#2D6A4F' : 'white',
                            fontFamily: 'DM Sans, sans-serif',
                          }}
                        >
                          {isConnected ? '✓ Connected' : 'Connect'}
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
                  Billing
                </h2>
                <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  Manage your subscription and payment methods.
                </p>
                <div className="planexa-card p-5">
                  <div
                    className="rounded-xl p-5 mb-4"
                    style={{ background: 'linear-gradient(135deg, #1E293B 0%, #2D6A4F 100%)' }}
                  >
                    <div className="text-xs font-medium mb-1" style={{ color: '#52B788', fontFamily: 'DM Sans, sans-serif' }}>
                      Current Plan
                    </div>
                    <div
                      className="text-2xl mb-1"
                      style={{ fontFamily: 'Fraunces, serif', color: 'white', fontWeight: 300 }}
                    >
                      Professional
                    </div>
                    <div className="text-sm" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
                      $49/month · Renews March 22, 2027
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {['Unlimited appointments', 'Up to 5 team members', 'Custom booking page', 'Email reminders', 'Analytics dashboard'].map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                        <span style={{ color: '#2D6A4F' }}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid #E8E0D0' }}>
                    <button
                      onClick={() => toast.info('Feature coming soon')}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ border: '1px solid #E8E0D0', color: '#475569', fontFamily: 'DM Sans, sans-serif', backgroundColor: 'transparent' }}
                    >
                      Manage Billing
                    </button>
                    <button
                      onClick={() => toast.info('Feature coming soon')}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                    >
                      Upgrade Plan
                    </button>
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
