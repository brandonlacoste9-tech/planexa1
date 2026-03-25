import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Calendar, Users, BarChart2, Settings, Plus, Menu, X } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import NewAppointmentModal from '../modals/NewAppointmentModal';

const navLinks = [
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return '??';
}

export default function DashboardNav() {
  const [location] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const initials = getInitials(user?.name, user?.email);

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
          style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
        >
          <Plus size={14} />New Appointment
        </button>

        {/* User Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
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
          <div className="px-4 pt-2 pb-3">
            <button onClick={() => { setShowModal(true); setMobileOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium"
              style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}>
              <Plus size={14} />New Appointment
            </button>
          </div>
        </div>
      )}

      {showModal && <NewAppointmentModal onClose={() => setShowModal(false)} />}
    </>
  );
}
