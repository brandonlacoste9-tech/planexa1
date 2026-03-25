// Planexa — Analytics Page
// Design: Metric cards, Recharts bar/line/donut charts, cream background

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import DashboardNav from '../components/layout/DashboardNav';
import DashboardFooter from '../components/layout/DashboardFooter';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const barData = weekDays.map(day => ({ day, appointments: 0 }));
const lineData = Array.from({ length: 12 }, (_, i) => ({ week: `W${12 - i}`, revenue: 0 })).reverse();
const donutData: { name: string; value: number; color: string }[] = [];
const recentActivity: never[] = [];

const metrics = [
  { label: 'Appointments This Month', value: 0, icon: Calendar, change: '—', positive: true },
  { label: 'Revenue This Month', value: '$0', icon: DollarSign, change: '—', positive: true },
  { label: 'Show Rate', value: '—', icon: TrendingUp, change: '—', positive: true },
  { label: 'New Clients', value: 0, icon: Users, change: '—', positive: true },
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
            {p.name}: {typeof p.value === 'number' && p.name === 'revenue' ? `$${p.value}` : p.value}
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

          {/* Empty state notice */}
          <div
            className="rounded-xl p-5 mb-5 flex items-start gap-3"
            style={{ backgroundColor: '#F0EBE0', border: '1px solid #E8E0D0' }}
          >
            <span style={{ fontSize: 20 }}>📊</span>
            <div>
              <div className="text-sm font-medium mb-1" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                Your analytics will appear here once bookings come in.
              </div>
              <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                Share your booking link with clients to start seeing real appointment and revenue data.
              </div>
            </div>
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
              <div className="text-center py-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <div className="text-2xl mb-2">🥧</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>Service breakdown will appear once bookings come in.</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="planexa-card p-5 lg:col-span-2">
              <h3 className="text-base mb-4" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}>
                Recent Activity
              </h3>
              <div className="text-center py-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <div className="text-2xl mb-2">🗒️</div>
                <div className="text-sm font-medium mb-1" style={{ color: '#1E293B' }}>No activity yet</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>Completed appointments will show up here.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardFooter />
    </div>
  );
}
