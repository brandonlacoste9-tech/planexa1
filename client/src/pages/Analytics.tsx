// Planexa — Analytics Page
// Design: Metric cards, Recharts bar/line/donut charts, cream background

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import DashboardNav from '../components/layout/DashboardNav';
import DashboardFooter from '../components/layout/DashboardFooter';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const weekDays = [t('analytics.days.Mon'), t('analytics.days.Tue'), t('analytics.days.Wed'), t('analytics.days.Thu'), t('analytics.days.Fri'), t('analytics.days.Sat'), t('analytics.days.Sun')];
  const barData = weekDays.map(day => ({ day, appointments: 0 }));
  const lineData = Array.from({ length: 12 }, (_, i) => ({ week: `W${12 - i}`, revenue: 0 })).reverse();
  const donutData: { name: string; value: number; color: string }[] = [];
  const recentActivity: never[] = [];

  const metrics = [
    { label: t('analytics.metrics.appointments'), value: 0, icon: Calendar, change: '—', positive: true },
    { label: t('analytics.metrics.revenue'), value: '$0', icon: DollarSign, change: '—', positive: true },
    { label: t('analytics.metrics.showRate'), value: '—', icon: TrendingUp, change: '—', positive: true },
    { label: t('analytics.metrics.newClients'), value: 0, icon: Users, change: '—', positive: true },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--plx-bg)' }}>
      <DashboardNav />

      <div className="flex-1 overflow-y-auto pt-14 pb-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1
              className="text-2xl"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
            >
              {t('analytics.title')}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
              {t('analytics.perfOverview')} {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map(({ label, value, icon: Icon, change, positive }) => (
              <div key={label} className="planexa-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--plx-pale)' }}
                  >
                    <Icon size={15} style={{ color: 'var(--plx-primary)' }} />
                  </div>
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: positive ? 'var(--plx-pale)' : '#FEE2E2',
                      color: positive ? 'var(--plx-primary)' : '#DC2626',
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
            style={{ backgroundColor: 'var(--plx-pale)', border: '1px solid var(--plx-border)' }}
          >
            <span style={{ fontSize: 20 }}>{t('analytics.empty.banner')}</span>
            <div>
              <div className="text-sm font-medium mb-1" style={{ color: '#1E293B', fontFamily: 'DM Sans, sans-serif' }}>
                {t('analytics.empty.title')}
              </div>
              <div className="text-xs" style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
                {t('analytics.empty.desc')}
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
                {t('analytics.charts.weekly')}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--plx-border)" vertical={false} />
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
                  <Bar dataKey="appointments" fill="var(--plx-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="planexa-card p-5">
              <h3
                className="text-base mb-4"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
              >
                {t('analytics.charts.revenue')}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--plx-border)" vertical={false} />
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
                    stroke="var(--plx-primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--plx-primary)' as any, r: 3 }}
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
                {t('analytics.charts.breakdown')}
              </h3>
              <div className="text-center py-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <div className="text-2xl mb-2">{t('analytics.breakdownEmpty.icon')}</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{t('analytics.breakdownEmpty.desc')}</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="planexa-card p-5 lg:col-span-2">
              <h3 className="text-base mb-4" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}>
                {t('analytics.charts.activity')}
              </h3>
              <div className="text-center py-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <div className="text-2xl mb-2">{t('analytics.activityEmpty.icon')}</div>
                <div className="text-sm font-medium mb-1" style={{ color: '#1E293B' }}>{t('analytics.activityEmpty.title')}</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{t('analytics.activityEmpty.desc')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardFooter />
    </div>
  );
}
