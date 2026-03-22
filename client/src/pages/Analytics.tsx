// Planexa — Analytics Page
// Design: Metric cards, Recharts bar/line/donut charts, cream background

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import DashboardNav from '../components/layout/DashboardNav';
import DashboardFooter from '../components/layout/DashboardFooter';
import { appointments, appointmentTypes, clients, getAppointmentType, formatPrice } from '../lib/data';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

// Compute metrics
const thisMonth = new Date().getMonth();
const thisYear = new Date().getFullYear();

const monthAppts = appointments.filter(a => {
  const d = new Date(a.date);
  return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
});

const totalRevenue = monthAppts.reduce((sum, a) => {
  const type = getAppointmentType(a.appointment_type_id);
  return sum + (type?.price_cents || 0);
}, 0);

const completedAppts = appointments.filter(a => a.status === 'completed' || a.status === 'confirmed');
const showRate = Math.round((completedAppts.length / Math.max(appointments.length, 1)) * 100);

const newClientsThisMonth = clients.filter(c => {
  const d = new Date(c.last_appointment);
  return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
}).length;

// Bar chart: appointments per day this week
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = new Date();
const dayOfWeek = today.getDay();
const monday = new Date(today);
monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

const barData = weekDays.map((day, i) => {
  const d = new Date(monday);
  d.setDate(monday.getDate() + i);
  const dateKey = d.toISOString().split('T')[0];
  const count = appointments.filter(a => a.date === dateKey).length;
  return { day, appointments: count };
});

// Line chart: revenue over last 12 weeks (simulated)
const lineData = Array.from({ length: 12 }, (_, i) => {
  const week = 12 - i;
  const revenue = Math.round((800 + Math.random() * 1200 + i * 150) / 100) * 100;
  return { week: `W${week}`, revenue };
}).reverse();

// Donut chart: appointment type breakdown
const donutData = appointmentTypes.map(type => ({
  name: type.name,
  value: type.booking_count,
  color: type.color_hex,
}));

// Recent activity
const recentActivity = [...appointments]
  .sort((a, b) => new Date(b.date + 'T' + b.start_time).getTime() - new Date(a.date + 'T' + a.start_time).getTime())
  .slice(0, 10);

const metrics = [
  {
    label: 'Appointments This Month',
    value: monthAppts.length,
    icon: Calendar,
    change: '+12%',
    positive: true,
  },
  {
    label: 'Revenue This Month',
    value: formatPrice(totalRevenue),
    icon: DollarSign,
    change: '+8%',
    positive: true,
  },
  {
    label: 'Show Rate',
    value: `${showRate}%`,
    icon: TrendingUp,
    change: '+3%',
    positive: true,
  },
  {
    label: 'New Clients',
    value: newClientsThisMonth,
    icon: Users,
    change: '+5',
    positive: true,
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          backgroundColor: '#1E293B',
          color: 'white',
          fontFamily: 'DM Sans, sans-serif',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="font-medium">{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color || '#52B788' }}>
            {p.name}: {typeof p.value === 'number' && p.name === 'revenue' ? formatPrice(p.value * 100) : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#FAF7F2' }}>
      <DashboardNav />

      <div className="flex-1 overflow-y-auto pt-14 pb-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1
              className="text-2xl"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
            >
              Analytics
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
              Performance overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map(({ label, value, icon: Icon, change, positive }) => (
              <div key={label} className="planexa-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#D8F3DC' }}
                  >
                    <Icon size={15} style={{ color: '#2D6A4F' }} />
                  </div>
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: positive ? '#D8F3DC' : '#FEE2E2',
                      color: positive ? '#2D6A4F' : '#DC2626',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {change}
                  </span>
                </div>
                <div
                  className="text-2xl"
                  style={{ fontFamily: 'Fraunces, serif', color: '#1E293B', fontWeight: 400 }}
                >
                  {value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Bar Chart */}
            <div className="planexa-card p-5">
              <h3
                className="text-base mb-4"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
              >
                Appointments This Week
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="appointments" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="planexa-card p-5">
              <h3
                className="text-base mb-4"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
              >
                Revenue (Last 12 Weeks)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `$${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2D6A4F"
                    strokeWidth={2}
                    dot={{ fill: '#2D6A4F', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row: Donut + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Donut Chart */}
            <div className="planexa-card p-5">
              <h3
                className="text-base mb-4"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
              >
                Service Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [value + ' bookings', name]}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: 12,
                      color: 'white',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {donutData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs" style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="planexa-card p-5 lg:col-span-2">
              <h3
                className="text-base mb-4"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
              >
                Recent Activity
              </h3>
              <div className="space-y-0">
                {recentActivity.map((appt, i) => {
                  const type = getAppointmentType(appt.appointment_type_id);
                  const date = new Date(appt.date + 'T00:00:00');
                  return (
                    <div
                      key={appt.id}
                      className="flex items-center gap-3 py-2.5"
                      style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid #E8E0D0' : 'none' }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{
                          backgroundColor: (type?.color_hex || '#2D6A4F') + '20',
                          color: type?.color_hex || '#2D6A4F',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      >
                        {appt.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                          {appt.client_name}
                        </div>
                        <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                          {type?.name} · {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className="text-sm"
                          style={{ fontFamily: 'Fraunces, serif', color: '#2D6A4F', fontWeight: 400 }}
                        >
                          {formatPrice(type?.price_cents || 0)}
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardFooter />
    </div>
  );
}
