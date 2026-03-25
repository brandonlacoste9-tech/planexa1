// Planexa — Calendar Page
// Design: 3-column grid (268px sidebar | 1fr calendar | 300px right panel)
// Fraunces + DM Sans, Forest Green + Cream palette

import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import DashboardNav from '../components/layout/DashboardNav';
import DashboardFooter from '../components/layout/DashboardFooter';
import NewAppointmentModal from '../components/modals/NewAppointmentModal';
import AppointmentTypeModal from '../components/modals/AppointmentTypeModal';
import {
  appointmentTypes,
  teamMembers,
  businessInfo,
  getAppointmentType,
  getTeamMember,
  formatTime12h,
  formatDuration,
  formatPrice,
  timeToMinutes,
  type Appointment,
} from '../lib/data';

// Calendar constants
const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_HOURS = END_HOUR - START_HOUR;

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getCurrentTimePosition(): number {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = START_HOUR * 60;
  return ((minutes - startMinutes) / 60) * HOUR_HEIGHT;
}

// Mini Calendar Component
function MiniCalendar({
  selectedDate,
  onDateSelect,
  appointmentDates,
}: {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointmentDates: Set<string>;
}) {
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="planexa-card p-3">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth(new Date(year, month - 1))}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-cream-dark transition-colors"
          style={{ color: '#64748B' }}
        >
          <ChevronLeft size={12} />
        </button>
        <span className="text-xs font-medium" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
          {monthName}
        </span>
        <button
          onClick={() => setViewMonth(new Date(year, month + 1))}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-cream-dark transition-colors"
          style={{ color: '#64748B' }}
        >
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const dateKey = formatDateKey(date);
          const isToday = date.getTime() === today.getTime();
          const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
          const hasAppts = appointmentDates.has(dateKey);

          return (
            <button
              key={day}
              onClick={() => onDateSelect(date)}
              className="relative flex flex-col items-center py-0.5 rounded transition-colors"
              style={{
                backgroundColor: isToday ? '#2D6A4F' : isSelected ? '#D8F3DC' : 'transparent',
              }}
              onMouseEnter={e => {
                if (!isToday && !isSelected) e.currentTarget.style.backgroundColor = '#F0EBE0';
              }}
              onMouseLeave={e => {
                if (!isToday && !isSelected) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span
                className="text-xs leading-5"
                style={{
                  color: isToday ? 'white' : isSelected ? '#2D6A4F' : '#1E293B',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {day}
              </span>
              {hasAppts && !isToday && (
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: '#52B788' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Appointment Type Item
function AppointmentTypeItem({
  type,
  isActive,
  onClick,
}: {
  type: typeof appointmentTypes[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left"
      style={{
        backgroundColor: isActive ? '#D8F3DC' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.backgroundColor = '#F0EBE0';
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: type.color_hex }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
          {type.name}
        </div>
        <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
          {formatDuration(type.duration_minutes)}
        </div>
      </div>
      <span
        className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
        style={{ backgroundColor: type.color_hex + '20', color: type.color_hex, fontFamily: 'DM Sans, sans-serif' }}
      >
        {type.booking_count}
      </span>
    </button>
  );
}

// Appointment Event Block
function AppointmentEvent({
  appointment,
  onClick,
  onDragStart,
}: {
  appointment: Appointment;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const type = getAppointmentType(appointment.appointment_type_id);
  if (!type) return null;

  const startMins = timeToMinutes(appointment.start_time);
  const endMins = timeToMinutes(appointment.end_time);
  const top = ((startMins - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT - 2, 20);

  return (
    <div
      className="appointment-event absolute left-1 right-1"
      style={{
        top,
        height,
        backgroundColor: type.color_hex,
        zIndex: 10,
      }}
      onClick={onClick}
      draggable
      onDragStart={e => onDragStart(e, appointment.id)}
    >
      <div className="text-white leading-tight">
        <div className="font-semibold truncate" style={{ fontSize: 11 }}>{type.name}</div>
        {height > 30 && (
          <div className="truncate opacity-90" style={{ fontSize: 10 }}>{appointment.client_name}</div>
        )}
        {height > 44 && (
          <div className="opacity-80" style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
            {formatTime12h(appointment.start_time)}
          </div>
        )}
      </div>
    </div>
  );
}

// Upcoming Item
function UpcomingItem({
  appointment,
  onClick,
}: {
  appointment: Appointment;
  onClick: () => void;
}) {
  const type = getAppointmentType(appointment.appointment_type_id);
  if (!type) return null;

  const date = new Date(appointment.date + 'T00:00:00');
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-0 rounded-lg overflow-hidden transition-all"
      style={{ border: '1px solid #E8E0D0' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div className="w-1 shrink-0" style={{ backgroundColor: type.color_hex }} />
      <div className="flex-1 px-3 py-2.5 bg-white">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-xs" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
            {appointment.client_name}
          </div>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: type.color_hex + '20', color: type.color_hex, fontFamily: 'DM Sans, sans-serif' }}
          >
            {type.name}
          </span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
          {dateStr} · {formatTime12h(appointment.start_time)} · {formatDuration(type.duration_minutes)}
        </div>
        {appointment.reminder_sent && (
          <div className="text-xs mt-0.5" style={{ color: '#52B788', fontFamily: 'DM Sans, sans-serif' }}>
            ✓ Reminder sent
          </div>
        )}
      </div>
    </button>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'upcoming' | 'booking'>('upcoming');
  const [showNewApptModal, setShowNewApptModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [copied, setCopied] = useState(false);
  const dragApptId = useRef<string | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointmentDates = new Set(appts.map(a => a.date));

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setWeekStart(getWeekStart(date));
  };

  const navigateWeek = (dir: -1 | 1) => {
    const newStart = addDays(weekStart, dir * 7);
    setWeekStart(newStart);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setWeekStart(getWeekStart(now));
  };

  const filteredAppts = activeTypeFilter
    ? appts.filter(a => a.appointment_type_id === activeTypeFilter)
    : appts;

  const upcomingAppts = [...appts]
    .filter(a => a.status !== 'cancelled')
    .sort((a, b) => {
      const da = new Date(a.date + 'T' + a.start_time);
      const db = new Date(b.date + 'T' + b.start_time);
      return da.getTime() - db.getTime();
    });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragApptId.current = id;
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    el.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, _day: string, _hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    (e.currentTarget as HTMLElement).classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
  };

  const handleDrop = useCallback((e: React.DragEvent, dayDate: string, hour: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
    const id = dragApptId.current;
    if (!id) return;

    setAppts(prev => prev.map(a => {
      if (a.id !== id) return a;
      const type = getAppointmentType(a.appointment_type_id);
      const durationMins = type?.duration_minutes || 60;
      const newStart = `${String(hour).padStart(2, '0')}:00`;
      const endMins = hour * 60 + durationMins;
      const newEnd = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;
      return { ...a, date: dayDate, start_time: newStart, end_time: newEnd };
    }));

    toast.success('Appointment moved!');
    dragApptId.current = null;
  }, []);

  const bookingLink = `planexa.co/book/${businessInfo.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Booking link copied!');
  };

  const timeNowPos = getCurrentTimePosition();
  const isCurrentWeek = formatDateKey(weekStart) === formatDateKey(getWeekStart(new Date()));

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#FAF7F2' }}>
      <DashboardNav />

      <div className="flex flex-1 overflow-hidden pt-14">
        {/* Left Sidebar */}
        <aside
          className="hidden lg:flex flex-col gap-3 p-3 overflow-y-auto shrink-0"
          style={{ width: 268, borderRight: '1px solid #E8E0D0', backgroundColor: '#FAF7F2' }}
        >
          {/* Mini Calendar */}
          <MiniCalendar
            selectedDate={currentDate}
            onDateSelect={handleDateSelect}
            appointmentDates={appointmentDates}
          />

          {/* Appointment Types */}
          <div className="planexa-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                Services
              </span>
              {activeTypeFilter && (
                <button
                  onClick={() => setActiveTypeFilter(null)}
                  className="text-xs"
                  style={{ color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {appointmentTypes.map(type => (
                <AppointmentTypeItem
                  key={type.id}
                  type={type}
                  isActive={activeTypeFilter === type.id}
                  onClick={() => setActiveTypeFilter(activeTypeFilter === type.id ? null : type.id)}
                />
              ))}
            </div>
            <button
              onClick={() => setShowTypeModal(true)}
              className="w-full mt-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
              style={{
                border: '1.5px dashed #CBD5E1',
                color: '#64748B',
                fontFamily: 'DM Sans, sans-serif',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#52B788')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
            >
              <Plus size={11} />
              Add appointment type
            </button>
          </div>

          {/* Team Members */}
          <div className="planexa-card p-3">
            <span className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
              Team
            </span>
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ backgroundColor: member.color_hex + '25', color: member.color_hex, fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {member.avatar_initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                      {member.name}
                    </div>
                    <div className="text-xs capitalize" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                      {member.role}
                    </div>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        member.status === 'available' ? '#52B788' :
                        member.status === 'booked' ? '#F59E0B' : '#94A3B8',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Calendar */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Week Navigation Header */}
          <div
            className="flex items-center gap-3 px-4 py-2 shrink-0"
            style={{ borderBottom: '1px solid #E8E0D0', backgroundColor: 'white' }}
          >
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateWeek(-1)}
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                style={{ color: '#64748B' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-medium rounded-md transition-colors"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  color: '#475569',
                  border: '1px solid #E8E0D0',
                  backgroundColor: 'white',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
              >
                Today
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                style={{ color: '#64748B' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}
            >
              {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex-1" />
            <span className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
              {filteredAppts.length} appointment{filteredAppts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Day Headers */}
          <div
            className="flex shrink-0"
            style={{ borderBottom: '1px solid #E8E0D0', backgroundColor: 'white' }}
          >
            <div className="shrink-0" style={{ width: 52 }} />
            {weekDays.map((day, i) => {
              const isToday = formatDateKey(day) === formatDateKey(today);
              return (
                <div
                  key={i}
                  className="flex-1 text-center py-2"
                  style={{
                    borderLeft: '1px solid #E8E0D0',
                    backgroundColor: isToday ? 'rgba(45, 106, 79, 0.04)' : 'transparent',
                  }}
                >
                  <div
                    className="text-xs uppercase tracking-wide"
                    style={{ color: isToday ? '#2D6A4F' : '#64748B', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div
                    className="text-lg font-medium mt-0.5 w-8 h-8 flex items-center justify-center mx-auto rounded-full"
                    style={{
                      fontFamily: 'Fraunces, serif',
                      color: isToday ? 'white' : '#1E293B',
                      backgroundColor: isToday ? '#2D6A4F' : 'transparent',
                      fontWeight: isToday ? 400 : 300,
                    }}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex" style={{ minHeight: TOTAL_HOURS * HOUR_HEIGHT }}>
              {/* Time Labels */}
              <div className="shrink-0 relative" style={{ width: 52 }}>
                {Array.from({ length: TOTAL_HOURS }, (_, i) => {
                  const hour = START_HOUR + i;
                  const label = hour === 12 ? '12 pm' : hour > 12 ? `${hour - 12} pm` : `${hour} am`;
                  return (
                    <div
                      key={i}
                      className="absolute right-2 text-right"
                      style={{
                        top: i * HOUR_HEIGHT - 8,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        color: '#94A3B8',
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>

              {/* Day Columns */}
              {weekDays.map((day, dayIdx) => {
                const dateKey = formatDateKey(day);
                const isToday = dateKey === formatDateKey(today);
                const dayAppts = filteredAppts.filter(a => a.date === dateKey);

                return (
                  <div
                    key={dayIdx}
                    className="flex-1 relative"
                    style={{
                      borderLeft: '1px solid #E8E0D0',
                      backgroundColor: isToday ? 'rgba(45, 106, 79, 0.02)' : 'transparent',
                    }}
                  >
                    {/* Hour lines */}
                    {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                      <div key={i}>
                        <div
                          className="absolute left-0 right-0"
                          style={{
                            top: i * HOUR_HEIGHT,
                            borderTop: '1px solid #E8E0D0',
                          }}
                        />
                        <div
                          className="absolute left-0 right-0"
                          style={{
                            top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2,
                            borderTop: '1px dashed #F0EBE0',
                          }}
                        />
                      </div>
                    ))}

                    {/* Drop zones (per hour) */}
                    {Array.from({ length: TOTAL_HOURS }, (_, i) => {
                      const hour = START_HOUR + i;
                      return (
                        <div
                          key={i}
                          className="calendar-drop-zone absolute left-0 right-0"
                          style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                          data-day={dateKey}
                          data-hour={hour}
                          onDragOver={e => handleDragOver(e, dateKey, hour)}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, dateKey, hour)}
                        />
                      );
                    })}

                    {/* Appointment Events */}
                    {dayAppts.map(appt => (
                      <AppointmentEvent
                        key={appt.id}
                        appointment={appt}
                        onClick={() => setSelectedAppt(appt)}
                        onDragStart={handleDragStart}
                      />
                    ))}

                    {/* Current Time Indicator */}
                    {isToday && isCurrentWeek && (
                      <div
                        className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                        style={{ top: timeNowPos }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0 -ml-1.5"
                          style={{ backgroundColor: '#2D6A4F' }}
                        />
                        <div
                          className="flex-1 h-px"
                          style={{ backgroundColor: '#2D6A4F' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right Panel */}
        <aside
          className="hidden xl:flex flex-col shrink-0 overflow-hidden"
          style={{ width: 300, borderLeft: '1px solid #E8E0D0', backgroundColor: '#FAF7F2' }}
        >
          {/* Tabs */}
          <div
            className="flex shrink-0"
            style={{ borderBottom: '1px solid #E8E0D0', backgroundColor: 'white' }}
          >
            {(['upcoming', 'booking'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className="flex-1 py-3 text-xs font-medium capitalize transition-colors"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  color: rightTab === tab ? '#2D6A4F' : '#64748B',
                  borderBottom: rightTab === tab ? '2px solid #2D6A4F' : '2px solid transparent',
                  backgroundColor: 'transparent',
                }}
              >
                {tab === 'upcoming' ? 'Upcoming' : 'Booking Page'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {rightTab === 'upcoming' ? (
              <div className="space-y-2">
                {upcomingAppts.length === 0 ? (
                  <div className="text-center py-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-sm font-medium mb-1" style={{ color: '#1E293B' }}>No upcoming appointments</div>
                    <div className="text-xs" style={{ color: '#94A3B8' }}>Share your booking link so clients can schedule time with you.</div>
                  </div>
                ) : (
                  upcomingAppts.map(appt => (
                    <UpcomingItem
                      key={appt.id}
                      appointment={appt}
                      onClick={() => setSelectedAppt(appt)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Dark preview card */}
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: '#1E293B' }}
                >
                  <div
                    className="text-base font-medium mb-1"
                    style={{ fontFamily: 'Fraunces, serif', color: 'white', fontStyle: 'italic', fontWeight: 300 }}
                  >
                    {businessInfo.name}
                  </div>
                  <div className="text-xs mb-3" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                    {businessInfo.description}
                  </div>
                  <div className="space-y-2">
                    {appointmentTypes.filter(t => t.is_active).map(type => (
                      <div
                        key={type.id}
                        className="flex items-center gap-2 rounded-lg p-2"
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: type.color_hex }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: 'white', fontFamily: 'DM Sans, sans-serif' }}>
                            {type.name}
                          </div>
                          <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                            {formatDuration(type.duration_minutes)} · {formatPrice(type.price_cents)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="w-full mt-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                    onClick={() => toast.info('Opening booking page...')}
                  >
                    <ExternalLink size={11} />
                    View Live Booking Page →
                  </button>
                </div>

                {/* Copy Link */}
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ border: '1px solid #E8E0D0', backgroundColor: 'white' }}
                >
                  <span
                    className="flex-1 text-xs truncate"
                    style={{ color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {bookingLink}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 p-1 rounded transition-colors"
                    style={{ color: copied ? '#2D6A4F' : '#64748B' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <DashboardFooter />

      {/* Modals */}
      {showNewApptModal && <NewAppointmentModal onClose={() => setShowNewApptModal(false)} />}
      {showTypeModal && <AppointmentTypeModal onClose={() => setShowTypeModal(false)} />}

      {/* Appointment Detail Slide-over */}
      {selectedAppt && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-end"
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(2px)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedAppt(null); }}
        >
          <div
            className="w-full sm:w-80 h-auto sm:h-full overflow-y-auto"
            style={{
              backgroundColor: 'white',
              borderLeft: '1px solid #E8E0D0',
              borderTop: '1px solid #E8E0D0',
              borderRadius: '16px 16px 0 0',
            }}
          >
            {(() => {
              const type = getAppointmentType(selectedAppt.appointment_type_id);
              const member = getTeamMember(selectedAppt.team_member_id);
              return (
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div
                        className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2"
                        style={{
                          backgroundColor: (type?.color_hex || '#2D6A4F') + '20',
                          color: type?.color_hex || '#2D6A4F',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      >
                        {type?.name}
                      </div>
                      <h3
                        className="text-lg"
                        style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
                      >
                        {selectedAppt.client_name}
                      </h3>
                      <div className="text-sm" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                        {selectedAppt.client_email}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAppt(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full"
                      style={{ color: '#64748B' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 py-2" style={{ borderTop: '1px solid #E8E0D0' }}>
                      <span className="text-xs font-medium w-20" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>Date</span>
                      <span className="text-sm" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                        {new Date(selectedAppt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-2" style={{ borderTop: '1px solid #E8E0D0' }}>
                      <span className="text-xs font-medium w-20" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>Time</span>
                      <span className="text-sm" style={{ color: '#1E293B', fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatTime12h(selectedAppt.start_time)} – {formatTime12h(selectedAppt.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-2" style={{ borderTop: '1px solid #E8E0D0' }}>
                      <span className="text-xs font-medium w-20" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>With</span>
                      <span className="text-sm" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>{member?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 py-2" style={{ borderTop: '1px solid #E8E0D0' }}>
                      <span className="text-xs font-medium w-20" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>Status</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{
                          backgroundColor: selectedAppt.status === 'confirmed' ? '#D8F3DC' : '#F1F5F9',
                          color: selectedAppt.status === 'confirmed' ? '#2D6A4F' : '#475569',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      >
                        {selectedAppt.status}
                      </span>
                    </div>
                    {selectedAppt.notes && (
                      <div className="py-2" style={{ borderTop: '1px solid #E8E0D0' }}>
                        <span className="text-xs font-medium block mb-1" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>Notes</span>
                        <p className="text-sm" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>{selectedAppt.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex-1 py-2 rounded-lg text-xs font-medium"
                      style={{ border: '1px solid #E8E0D0', color: '#475569', fontFamily: 'DM Sans, sans-serif', backgroundColor: 'transparent' }}
                      onClick={() => { toast.info('Feature coming soon'); setSelectedAppt(null); }}
                    >
                      Cancel Appt
                    </button>
                    <button
                      className="flex-1 py-2 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                      onClick={() => { toast.success('Marked as complete'); setSelectedAppt(null); }}
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
