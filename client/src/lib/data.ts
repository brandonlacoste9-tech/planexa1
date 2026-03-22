// Planexa — Mock data for demo purposes
// In production, this would be replaced by Supabase queries

export interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  color_hex: string;
  buffer_after_minutes: number;
  description: string;
  is_active: boolean;
  booking_count: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar_initials: string;
  color_hex: string;
  status: 'available' | 'booked' | 'away';
}

export interface Appointment {
  id: string;
  appointment_type_id: string;
  team_member_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  reminder_sent: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  last_appointment: string;
  total_bookings: number;
  total_spent_cents: number;
  notes?: string;
}

export const appointmentTypes: AppointmentType[] = [
  {
    id: 'at-1',
    name: 'Strategy Call',
    duration_minutes: 60,
    price_cents: 20000,
    color_hex: '#2D6A4F',
    buffer_after_minutes: 10,
    description: 'Deep-dive strategic planning session to align on goals and roadmap.',
    is_active: true,
    booking_count: 24,
  },
  {
    id: 'at-2',
    name: 'Intro Consultation',
    duration_minutes: 30,
    price_cents: 0,
    color_hex: '#7C3AED',
    buffer_after_minutes: 5,
    description: 'Free introductory call to understand your needs and how we can help.',
    is_active: true,
    booking_count: 41,
  },
  {
    id: 'at-3',
    name: 'Follow-up',
    duration_minutes: 45,
    price_cents: 12000,
    color_hex: '#40916C',
    buffer_after_minutes: 5,
    description: 'Progress check-in and next steps review.',
    is_active: true,
    booking_count: 18,
  },
  {
    id: 'at-4',
    name: 'Workshop',
    duration_minutes: 90,
    price_cents: 35000,
    color_hex: '#D97706',
    buffer_after_minutes: 15,
    description: 'Hands-on collaborative workshop for teams and stakeholders.',
    is_active: true,
    booking_count: 9,
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Jordan M.',
    role: 'owner',
    avatar_initials: 'JM',
    color_hex: '#2D6A4F',
    status: 'available',
  },
  {
    id: 'tm-2',
    name: 'Sara C.',
    role: 'member',
    avatar_initials: 'SC',
    color_hex: '#7C3AED',
    status: 'booked',
  },
  {
    id: 'tm-3',
    name: 'Remy L.',
    role: 'member',
    avatar_initials: 'RL',
    color_hex: '#D97706',
    status: 'available',
  },
];

// Generate appointments for the current week
function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

const weekDates = getWeekDates();

export const appointments: Appointment[] = [
  {
    id: 'appt-1',
    appointment_type_id: 'at-2',
    team_member_id: 'tm-1',
    client_name: 'Alice Thompson',
    client_email: 'alice@example.com',
    client_phone: '+1 416-555-0101',
    date: weekDates[0],
    start_time: '09:00',
    end_time: '09:30',
    status: 'confirmed',
    notes: 'Referred by Marcus.',
    reminder_sent: false,
  },
  {
    id: 'appt-2',
    appointment_type_id: 'at-1',
    team_member_id: 'tm-1',
    client_name: 'Marcus Reed',
    client_email: 'marcus@example.com',
    date: weekDates[0],
    start_time: '11:00',
    end_time: '12:00',
    status: 'confirmed',
    reminder_sent: true,
  },
  {
    id: 'appt-3',
    appointment_type_id: 'at-3',
    team_member_id: 'tm-2',
    client_name: 'Priya Sharma',
    client_email: 'priya@example.com',
    date: weekDates[1],
    start_time: '10:00',
    end_time: '10:45',
    status: 'confirmed',
    reminder_sent: false,
  },
  {
    id: 'appt-4',
    appointment_type_id: 'at-4',
    team_member_id: 'tm-1',
    client_name: 'Lena Kovacs',
    client_email: 'lena@example.com',
    date: weekDates[1],
    start_time: '14:00',
    end_time: '15:30',
    status: 'confirmed',
    notes: 'Team of 4 attending.',
    reminder_sent: false,
  },
  {
    id: 'appt-5',
    appointment_type_id: 'at-2',
    team_member_id: 'tm-3',
    client_name: 'David Chen',
    client_email: 'david@example.com',
    date: weekDates[2],
    start_time: '09:30',
    end_time: '10:00',
    status: 'confirmed',
    reminder_sent: false,
  },
  {
    id: 'appt-6',
    appointment_type_id: 'at-1',
    team_member_id: 'tm-2',
    client_name: 'Sofia Martinez',
    client_email: 'sofia@example.com',
    date: weekDates[2],
    start_time: '13:00',
    end_time: '14:00',
    status: 'confirmed',
    reminder_sent: true,
  },
  {
    id: 'appt-7',
    appointment_type_id: 'at-3',
    team_member_id: 'tm-1',
    client_name: 'James O\'Brien',
    client_email: 'james@example.com',
    date: weekDates[3],
    start_time: '10:30',
    end_time: '11:15',
    status: 'confirmed',
    reminder_sent: false,
  },
  {
    id: 'appt-8',
    appointment_type_id: 'at-4',
    team_member_id: 'tm-3',
    client_name: 'Nadia Okonkwo',
    client_email: 'nadia@example.com',
    date: weekDates[3],
    start_time: '15:00',
    end_time: '16:30',
    status: 'confirmed',
    notes: 'Bring presentation slides.',
    reminder_sent: false,
  },
  {
    id: 'appt-9',
    appointment_type_id: 'at-1',
    team_member_id: 'tm-1',
    client_name: 'Tom Nakamura',
    client_email: 'tom@example.com',
    date: weekDates[4],
    start_time: '09:00',
    end_time: '10:00',
    status: 'confirmed',
    reminder_sent: false,
  },
  {
    id: 'appt-10',
    appointment_type_id: 'at-2',
    team_member_id: 'tm-2',
    client_name: 'Rachel Kim',
    client_email: 'rachel@example.com',
    date: weekDates[4],
    start_time: '14:30',
    end_time: '15:00',
    status: 'confirmed',
    reminder_sent: false,
  },
];

export const clients: Client[] = [
  {
    id: 'cl-1',
    name: 'Alice Thompson',
    email: 'alice@example.com',
    phone: '+1 416-555-0101',
    last_appointment: weekDates[0],
    total_bookings: 5,
    total_spent_cents: 76000,
    notes: 'Prefers morning slots. Referred by Marcus Reed.',
  },
  {
    id: 'cl-2',
    name: 'Marcus Reed',
    email: 'marcus@example.com',
    phone: '+1 416-555-0202',
    last_appointment: weekDates[0],
    total_bookings: 8,
    total_spent_cents: 160000,
    notes: 'Long-term client. Interested in quarterly workshops.',
  },
  {
    id: 'cl-3',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+1 647-555-0303',
    last_appointment: weekDates[1],
    total_bookings: 3,
    total_spent_cents: 36000,
  },
  {
    id: 'cl-4',
    name: 'Lena Kovacs',
    email: 'lena@example.com',
    phone: '+1 905-555-0404',
    last_appointment: weekDates[1],
    total_bookings: 2,
    total_spent_cents: 70000,
    notes: 'Brings team to workshops.',
  },
  {
    id: 'cl-5',
    name: 'David Chen',
    email: 'david@example.com',
    phone: '+1 416-555-0505',
    last_appointment: weekDates[2],
    total_bookings: 1,
    total_spent_cents: 0,
  },
  {
    id: 'cl-6',
    name: 'Sofia Martinez',
    email: 'sofia@example.com',
    phone: '+1 647-555-0606',
    last_appointment: weekDates[2],
    total_bookings: 6,
    total_spent_cents: 120000,
  },
  {
    id: 'cl-7',
    name: 'James O\'Brien',
    email: 'james@example.com',
    phone: '+1 416-555-0707',
    last_appointment: weekDates[3],
    total_bookings: 4,
    total_spent_cents: 48000,
  },
  {
    id: 'cl-8',
    name: 'Nadia Okonkwo',
    email: 'nadia@example.com',
    phone: '+1 905-555-0808',
    last_appointment: weekDates[3],
    total_bookings: 3,
    total_spent_cents: 105000,
  },
  {
    id: 'cl-9',
    name: 'Tom Nakamura',
    email: 'tom@example.com',
    phone: '+1 416-555-0909',
    last_appointment: weekDates[4],
    total_bookings: 7,
    total_spent_cents: 140000,
  },
  {
    id: 'cl-10',
    name: 'Rachel Kim',
    email: 'rachel@example.com',
    phone: '+1 647-555-1010',
    last_appointment: weekDates[4],
    total_bookings: 2,
    total_spent_cents: 0,
  },
];

export const businessInfo = {
  name: 'Jordan Mitchell Consulting',
  slug: 'jmitchell',
  description: 'Strategic consulting and advisory services for growing businesses.',
  timezone: 'America/Toronto',
  booking_url_active: true,
};

// Helper functions
export function getAppointmentType(id: string): AppointmentType | undefined {
  return appointmentTypes.find(t => t.id === id);
}

export function getTeamMember(id: string): TeamMember | undefined {
  return teamMembers.find(m => m.id === id);
}

export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(0)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getAppointmentsForDate(date: string): Appointment[] {
  return appointments.filter(a => a.date === date);
}

export function getWeekAppointments(weekStart: Date): Appointment[] {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return appointments.filter(a => dates.includes(a.date));
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}
