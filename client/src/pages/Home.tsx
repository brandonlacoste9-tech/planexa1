// Planexa — Landing Page (Home)
// Design: Refined Enterprise Elegance — Fraunces + DM Sans, Forest Green + Cream
// Hero with generated background image, feature sections, pricing, CTA

import { Link } from 'wouter';
import { Calendar, Users, BarChart2, Settings, ArrowRight, Check, Star } from 'lucide-react';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663463499911/XkFRBSJqRpfu5RhGJQf3Nn/planexa-hero-bg-DDUhr6nNsPQdWN2ua6Nxbe.webp';
const DASHBOARD_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663463499911/XkFRBSJqRpfu5RhGJQf3Nn/planexa-dashboard-preview-Cc5Hkd2TnQSbo2V6yNAnrB.webp';
const ANALYTICS_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663463499911/XkFRBSJqRpfu5RhGJQf3Nn/planexa-analytics-preview-ie3WT7gnwDyBhtWk3zH2Tc.webp';
const BOOKING_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663463499911/XkFRBSJqRpfu5RhGJQf3Nn/planexa-booking-preview-dShMohpcLSgweLyost556b.webp';

const features = [
  {
    icon: Calendar,
    title: 'Smart Calendar',
    description: 'Weekly calendar view with drag-and-drop rescheduling, color-coded appointment types, and real-time availability.',
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'Full client profiles with appointment history, notes, and one-click rebooking. Never lose track of a relationship.',
  },
  {
    icon: BarChart2,
    title: 'Analytics Dashboard',
    description: 'Revenue tracking, show rate metrics, and appointment breakdowns. Understand your business at a glance.',
  },
  {
    icon: Settings,
    title: 'Custom Booking Page',
    description: 'A beautiful, branded booking page your clients can use 24/7. Set your services, pricing, and availability.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Executive Coach',
    text: 'Planexa replaced three tools I was using. My clients love the booking experience, and I love the calendar.',
    rating: 5,
  },
  {
    name: 'Marcus Okafor',
    role: 'Consulting Firm Owner',
    text: 'The drag-and-drop calendar alone is worth it. Rescheduling used to take 10 minutes of back-and-forth. Now it\'s 2 seconds.',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Wellness Studio',
    text: 'Our no-show rate dropped 40% after switching to Planexa\'s automated reminders. Incredible ROI.',
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$19',
    period: '/month',
    description: 'Perfect for solo practitioners',
    features: ['Up to 50 appointments/month', '1 team member', 'Custom booking page', 'Email reminders', 'Basic analytics'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing businesses',
    features: ['Unlimited appointments', 'Up to 5 team members', 'Custom booking page', 'Email + SMS reminders', 'Advanced analytics', 'Calendar integrations', 'Priority support'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large teams',
    features: ['Unlimited everything', 'Unlimited team members', 'White-label booking page', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function Home() {
  return (
    <div style={{ backgroundColor: '#FAF7F2', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6"
        style={{ backgroundColor: '#1E293B' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span
            style={{ fontFamily: 'Fraunces, serif', color: '#52B788', fontStyle: 'italic', fontWeight: 300 }}
            className="text-xl"
          >
            planexa
          </span>
          <span className="pulse-dot" />
        </Link>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-6 mr-6">
          {['Features', 'Pricing', 'Docs'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm transition-colors"
              style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#52B788')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/calendar"
            className="text-sm px-3 py-1.5 rounded-md transition-colors"
            style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}
          >
            Sign in
          </Link>
          <Link
            href="/calendar"
            className="text-sm px-3 py-1.5 rounded-md transition-colors"
            style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative pt-14 min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(250, 247, 242, 0.75)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{ backgroundColor: '#D8F3DC', color: '#2D6A4F' }}
            >
              <span className="pulse-dot" />
              Now in public beta
            </div>
            <h1
              className="text-5xl md:text-6xl leading-tight mb-6"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
            >
              Scheduling that works as hard as you do
            </h1>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{ color: '#475569', maxWidth: 480 }}
            >
              Planexa gives businesses a beautiful, intelligent scheduling platform — from client-facing booking pages to a powerful team calendar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/calendar"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: '#2D6A4F', color: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D6A4F')}
              >
                Open Dashboard
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/book/jmitchell"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ border: '1px solid #E8E0D0', color: '#1E293B', backgroundColor: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE0')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
              >
                See Booking Page
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {['JM', 'SC', 'RL', 'AT'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundColor: ['#2D6A4F', '#7C3AED', '#D97706', '#40916C'][i] + '30',
                      color: ['#2D6A4F', '#7C3AED', '#D97706', '#40916C'][i],
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm" style={{ color: '#64748B' }}>
                Trusted by <strong style={{ color: '#1E293B' }}>2,400+</strong> businesses
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
            >
              Everything in one place
            </h2>
            <p className="text-base" style={{ color: '#64748B', maxWidth: 480, margin: '0 auto' }}>
              A powerful calendar dashboard with sidebar navigation, team management, and real-time updates.
            </p>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #E8E0D0' }}
          >
            <img
              src={DASHBOARD_IMG}
              alt="Planexa Dashboard"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6" style={{ backgroundColor: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
            >
              Built for real businesses
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-6 rounded-xl transition-all"
                style={{ border: '1px solid #E8E0D0', backgroundColor: '#FAF7F2' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(45, 106, 79, 0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#D8F3DC' }}
                >
                  <Icon size={18} style={{ color: '#2D6A4F' }} />
                </div>
                <h3
                  className="text-lg mb-2"
                  style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, color: '#1E293B' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics + Booking Preview */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
            <div>
              <h2
                className="text-3xl mb-4"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
              >
                Data-driven insights
              </h2>
              <p className="text-base mb-4 leading-relaxed" style={{ color: '#64748B' }}>
                Track revenue, show rates, and appointment trends with beautiful charts. Know exactly how your business is performing.
              </p>
              <div className="space-y-2">
                {['Bar, line, and donut charts', 'Revenue tracking', 'Show rate analytics', 'Recent activity feed'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
                    <Check size={14} style={{ color: '#2D6A4F' }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #E8E0D0' }}
            >
              <img src={ANALYTICS_IMG} alt="Analytics" className="w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div
              className="rounded-2xl overflow-hidden order-2 md:order-1"
              style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #E8E0D0', maxWidth: 300, margin: '0 auto' }}
            >
              <img src={BOOKING_IMG} alt="Booking Page" className="w-full" />
            </div>
            <div className="order-1 md:order-2">
              <h2
                className="text-3xl mb-4"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
              >
                A booking page clients love
              </h2>
              <p className="text-base mb-4 leading-relaxed" style={{ color: '#64748B' }}>
                Your clients get a beautiful, mobile-friendly booking experience. No accounts required — just pick a service, date, and time.
              </p>
              <Link
                href="/book/jmitchell"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: '#2D6A4F' }}
              >
                Try the demo booking page
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6" style={{ backgroundColor: '#1E293B' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: 'white', fontStyle: 'italic' }}
            >
              Loved by businesses
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }) => (
              <div
                key={name}
                className="p-5 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={12} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#CBD5E1' }}>
                  "{text}"
                </p>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'white', fontFamily: 'DM Sans, sans-serif' }}>
                    {name}
                  </div>
                  <div className="text-xs" style={{ color: '#64748B' }}>{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: '#1E293B', fontStyle: 'italic' }}
            >
              Simple, transparent pricing
            </h2>
            <p className="text-base" style={{ color: '#64748B' }}>
              14-day free trial on all plans. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map(plan => (
              <div
                key={plan.name}
                className="rounded-2xl p-6"
                style={{
                  border: plan.highlighted ? '2px solid #2D6A4F' : '1px solid #E8E0D0',
                  backgroundColor: plan.highlighted ? 'white' : '#FAF7F2',
                  boxShadow: plan.highlighted ? '0 8px 30px rgba(45, 106, 79, 0.12)' : 'none',
                  position: 'relative',
                }}
              >
                {plan.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: '#2D6A4F', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{ color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-3xl"
                      style={{ fontFamily: 'Fraunces, serif', color: '#1E293B', fontWeight: 400 }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm" style={{ color: '#64748B' }}>{plan.period}</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#64748B' }}>{plan.description}</div>
                </div>
                <div className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
                      <Check size={13} style={{ color: '#2D6A4F' }} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href="/calendar"
                  className="block w-full py-2.5 rounded-xl text-sm font-medium text-center transition-colors"
                  style={{
                    backgroundColor: plan.highlighted ? '#2D6A4F' : 'transparent',
                    color: plan.highlighted ? 'white' : '#2D6A4F',
                    border: plan.highlighted ? 'none' : '1px solid #2D6A4F',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                  onMouseEnter={e => {
                    if (plan.highlighted) e.currentTarget.style.backgroundColor = '#40916C';
                    else e.currentTarget.style.backgroundColor = '#D8F3DC';
                  }}
                  onMouseLeave={e => {
                    if (plan.highlighted) e.currentTarget.style.backgroundColor = '#2D6A4F';
                    else e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: '#1E293B' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl mb-4"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, color: 'white', fontStyle: 'italic' }}
          >
            Ready to take control of your schedule?
          </h2>
          <p className="text-base mb-8" style={{ color: '#94A3B8' }}>
            Join thousands of businesses using Planexa to manage their time better.
          </p>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ backgroundColor: '#52B788', color: 'white', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40916C')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#52B788')}
          >
            Start Free Trial
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6"
        style={{ backgroundColor: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              style={{ fontFamily: 'Fraunces, serif', color: '#52B788', fontStyle: 'italic', fontWeight: 300 }}
              className="text-lg"
            >
              planexa
            </span>
            <span className="text-xs" style={{ color: '#475569' }}>© 2026</span>
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Support'].map(item => (
              <a
                key={item}
                href="#"
                className="text-xs transition-colors"
                style={{ color: '#475569' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
