// Planexa — Clients Page
// Design: Table view with search/filter, client detail slide-over

import { useState } from 'react';
import { Search, ChevronRight, Phone, Mail, Calendar, DollarSign, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import DashboardNav from '../components/layout/DashboardNav';
import DashboardFooter from '../components/layout/DashboardFooter';
import NewAppointmentModal from '../components/modals/NewAppointmentModal';
import {
  clients,
  appointments,
  getAppointmentType,
  formatPrice,
  formatTime12h,
  type Client,
} from '../lib/data';

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ClientRow({
  client,
  onClick,
}: {
  client: Client;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="transition-colors cursor-pointer"
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{
              backgroundColor: '#D8F3DC',
              color: '#2D6A4F',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
              {client.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
        {client.email}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
        {client.phone}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
        {formatDate(client.last_appointment)}
      </td>
      <td className="px-4 py-3 text-sm text-center" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
        {client.total_bookings}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: '#1E293B', fontFamily: 'Fraunces, serif', fontWeight: 400 }}>
        {formatPrice(client.total_spent_cents)}
      </td>
      <td className="px-4 py-3">
        <ChevronRight size={14} style={{ color: '#94A3B8' }} />
      </td>
    </tr>
  );
}

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const clientAppointments = selectedClient
    ? appointments.filter(a => a.client_email === selectedClient.email)
    : [];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#FAF7F2' }}>
      <DashboardNav />

      <div className="flex-1 overflow-y-auto pt-14 pb-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
              >
                Clients
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                {clients.length} total clients
              </p>
            </div>
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
            >
              <Plus size={14} />
              New Appointment
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#94A3B8' }}
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients by name or email..."
              className="w-full pl-9 planexa-input"
              style={{ maxWidth: 400 }}
            />
          </div>

          {/* Table */}
          <div className="planexa-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #E8E0D0', backgroundColor: '#FAF7F2' }}>
                    {['Name', 'Email', 'Phone', 'Last Appointment', 'Bookings', 'Total Spent', ''].map(h => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
                        No clients found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(client => (
                      <ClientRow
                        key={client.id}
                        client={client}
                        onClick={() => setSelectedClient(client)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <DashboardFooter />

      {/* Client Detail Slide-over */}
      {selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end"
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(2px)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedClient(null); }}
        >
          <div
            className="w-full max-w-sm overflow-y-auto"
            style={{ backgroundColor: 'white', borderLeft: '1px solid #E8E0D0' }}
          >
            {/* Header */}
            <div
              className="sticky top-0 flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #E8E0D0', backgroundColor: 'white' }}
            >
              <h2
                className="text-lg"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
              >
                Client Profile
              </h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ color: '#64748B' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
                  style={{ backgroundColor: '#D8F3DC', color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}
                >
                  {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                    {selectedClient.name}
                  </div>
                  <div className="text-sm" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                    Client since {formatDate(selectedClient.last_appointment)}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                  <Mail size={13} style={{ color: '#94A3B8' }} />
                  {selectedClient.email}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                  <Phone size={13} style={{ color: '#94A3B8' }} />
                  {selectedClient.phone}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="planexa-card p-3 text-center">
                  <div
                    className="text-xl"
                    style={{ fontFamily: 'Fraunces, serif', color: '#2D6A4F', fontWeight: 400 }}
                  >
                    {selectedClient.total_bookings}
                  </div>
                  <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                    Total Bookings
                  </div>
                </div>
                <div className="planexa-card p-3 text-center">
                  <div
                    className="text-xl"
                    style={{ fontFamily: 'Fraunces, serif', color: '#2D6A4F', fontWeight: 400 }}
                  >
                    {formatPrice(selectedClient.total_spent_cents)}
                  </div>
                  <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                    Total Spent
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                    Notes
                  </div>
                  <p className="text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                    {selectedClient.notes}
                  </p>
                </div>
              )}

              {/* Appointment History */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  Appointment History
                </div>
                {clientAppointments.length === 0 ? (
                  <p className="text-sm" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>No appointments found.</p>
                ) : (
                  <div className="space-y-2">
                    {clientAppointments.map(appt => {
                      const type = getAppointmentType(appt.appointment_type_id);
                      return (
                        <div
                          key={appt.id}
                          className="flex items-center gap-3 py-2"
                          style={{ borderBottom: '1px solid #E8E0D0' }}
                        >
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: type?.color_hex || '#2D6A4F' }}
                          />
                          <div className="flex-1">
                            <div className="text-xs font-medium" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                              {type?.name}
                            </div>
                            <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                              {formatDate(appt.date)} · {formatTime12h(appt.start_time)}
                            </div>
                          </div>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                            style={{
                              backgroundColor: appt.status === 'confirmed' ? '#D8F3DC' : '#F1F5F9',
                              color: appt.status === 'confirmed' ? '#2D6A4F' : '#475569',
                              fontFamily: 'DM Sans, sans-serif',
                            }}
                          >
                            {appt.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Book for Client CTA */}
              <button
                onClick={() => {
                  setShowBookModal(true);
                  setSelectedClient(null);
                }}
                className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
              >
                <Calendar size={14} />
                + Book for {selectedClient.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookModal && <NewAppointmentModal onClose={() => setShowBookModal(false)} />}
    </div>
  );
}
