import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Calendar, Users, BarChart2, Settings, Plus, Menu, X, Palette, Check } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { PALETTES } from '../../themes';
import NewAppointmentModal from '../modals/NewAppointmentModal';

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return '??';
}

function LangToggle() {
  const { i18n } = useTranslation();
  const isFr = i18n.language.startsWith('fr');
  return (
    <button
      onClick={() => i18n.changeLanguage(isFr ? 'en' : 'fr')}
      className="px-2 py-1 rounded text-xs font-semibold transition-colors"
      style={{
        fontFamily: 'DM Sans, sans-serif',
        color: '#94A3B8',
        border: '1px solid rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(255,255,255,0.06)',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#E2E8F0')}
      onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
      title={isFr ? 'Switch to English' : 'Passer en français'}
    >
      {isFr ? 'EN' : 'FR'}
    </button>
  );
}

function PalettePopover() {
  const { t } = useTranslation();
  const { paletteId, setPaletteId, customColors, setCustomColors } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 flex items-center justify-center rounded transition-colors"
        style={{ color: open ? '#E2E8F0' : '#94A3B8' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#E2E8F0')}
        onMouseLeave={e => (e.currentTarget.style.color = open ? '#E2E8F0' : '#94A3B8')}
        title={t('settings.appearance.title')}
      >
        <Palette size={15} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-9 z-[100] rounded-xl shadow-2xl p-3 w-52"
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div className="text-xs font-medium mb-2" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
            {t('settings.appearance.presets')}
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {PALETTES.map(p => (
              <button
                key={p.id}
                onClick={() => setPaletteId(p.id)}
                className="relative flex flex-col items-center gap-0.5 group"
                title={t(p.labelKey as any)}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform"
                  style={{
                    backgroundColor: p.primary,
                    transform: paletteId === p.id ? 'scale(1.15)' : 'scale(1)',
                    outline: paletteId === p.id ? `2px solid ${p.primary}` : 'none',
                    outlineOffset: 2,
                  }}
                >
                  {paletteId === p.id && <Check size={10} color="white" />}
                </span>
                <span className="text-[9px] text-center" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif', lineHeight: 1 }}>
                  {t(p.labelKey as any)}
                </span>
              </button>
            ))}
          </div>

          {/* Custom colours */}
          <div className="border-t pt-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="text-xs font-medium mb-1.5" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
              {t('settings.appearance.customTitle')}
            </div>
            <div className="space-y-1.5">
              {[
                { label: t('settings.appearance.primaryColor'), key: 'primary' as const, value: customColors.primary },
                { label: t('settings.appearance.bgColor'), key: 'bgPage' as const, value: customColors.bgPage },
                { label: t('settings.appearance.borderColor'), key: 'border' as const, value: customColors.border },
              ].map(({ label, key, value }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
                  <input
                    type="color"
                    value={value}
                    onChange={e => setCustomColors({ [key]: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                    style={{ backgroundColor: 'transparent' }}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardNav() {
  const [location] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const initials = getInitials(user?.name, user?.email);

  const navLinks = [
    { href: '/calendar', label: t('nav.calendar'), icon: Calendar },
    { href: '/clients', label: t('nav.clients'), icon: Users },
    { href: '/analytics', label: t('nav.analytics'), icon: BarChart2 },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <>
      <nav
        style={{ backgroundColor: '#1E293B' }}
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-4"
      >
        {/* Logo */}
        <Link href="/calendar" className="flex items-center gap-2 shrink-0">
          <span style={{ fontFamily: 'Fraunces, serif', color: '#52B788', fontStyle: 'italic', fontWeight: 300 }} className="text-xl tracking-tight">
            planexa
          </span>
          <span className="pulse-dot" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map(({ href, label }) => {
            const isActive = location === href || location.startsWith(href + '/');
            return (
              <Link key={href} href={href} className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{ fontFamily: 'DM Sans, sans-serif', color: isActive ? '#52B788' : '#94A3B8', backgroundColor: isActive ? 'rgba(82, 183, 136, 0.1)' : 'transparent' }}>
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* New Appointment Button */}
        <button onClick={() => setShowModal(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--plx-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--plx-primary)')}
        >
          <Plus size={14} />{t('nav.newAppointment')}
        </button>

        {/* Lang Toggle */}
        <LangToggle />

        {/* Palette Picker */}
        <PalettePopover />

        {/* User Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
          title={user?.name ?? user?.email ?? ''}
        >
          {initials}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-slate-300 p-1" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 md:hidden py-2"
          style={{ backgroundColor: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm"
              style={{ fontFamily: 'DM Sans, sans-serif', color: location === href ? '#52B788' : '#94A3B8' }}>
              <Icon size={16} />{label}
            </Link>
          ))}
          <div className="px-4 pt-2 pb-3 flex gap-2">
            <button onClick={() => { setShowModal(true); setMobileOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium"
              style={{ backgroundColor: 'var(--plx-primary)', color: 'white', fontFamily: 'DM Sans, sans-serif' }}>
              <Plus size={14} />{t('nav.newAppointment')}
            </button>
            <div className="flex items-center gap-2">
              <LangToggle />
            </div>
          </div>
        </div>
      )}

      {showModal && <NewAppointmentModal onClose={() => setShowModal(false)} />}
    </>
  );
}
