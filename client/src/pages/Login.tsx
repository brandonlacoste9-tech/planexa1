import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type Mode = 'signin' | 'signup' | 'magic';

function NotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--plx-bg)', fontFamily: 'DM Sans, sans-serif' }}>
      <div className="w-full max-w-sm text-center">
        <a href="/">
          <span style={{ fontFamily: 'Fraunces, serif', color: 'var(--plx-primary)', fontStyle: 'italic', fontWeight: 300 }} className="text-3xl">
            planexa
          </span>
        </a>
        <div className="mt-8 rounded-2xl p-6" style={{ backgroundColor: 'white', border: '1px solid var(--plx-border)' }}>
          <div className="text-2xl mb-3">⚙️</div>
          <h2 className="font-semibold text-sm mb-2" style={{ color: '#1E293B' }}>Auth not configured</h2>
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#64748B' }}>
            Add these 3 environment variables in your{' '}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--plx-primary)' }}>Vercel dashboard</a>:
          </p>
          <div className="text-left rounded-lg p-3 space-y-1" style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--plx-border)' }}>
            {['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].map(v => (
              <code key={v} className="block text-xs" style={{ color: '#2D6A4F' }}>{v}</code>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: '#94A3B8' }}>
            Find these in Supabase → Project Settings → API
          </p>
        </div>
        <a href="/" className="block mt-4 text-xs" style={{ color: '#94A3B8' }}>← Back to home</a>
      </div>
    </div>
  );
}

export default function Login() {
  const { t } = useTranslation();
  if (!supabaseConfigured) return <NotConfigured />;
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const loginMutation = trpc.auth.loginWithSupabase.useMutation({
    onSuccess: () => {
      window.location.href = '/calendar';
    },
    onError: (err) => {
      toast.error(err.message);
      setLoading(false);
    },
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      let result;
      if (mode === 'signup') {
        result = await supabase!.auth.signUp({ email, password });
      } else {
        result = await supabase!.auth.signInWithPassword({ email, password });
      }

      if (result.error) {
        toast.error(result.error.message);
        setLoading(false);
        return;
      }

      const token = result.data.session?.access_token;
      if (!token) {
        // Signup email verification required
        toast.success(t('login.checkEmail'));
        setLoading(false);
        return;
      }

      loginMutation.mutate({ accessToken: token });
    } catch {
      toast.error(t('common.error'));
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setMagicSent(true);
    }
  };

  const isSignIn = mode === 'signin' || mode === 'signup';

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--plx-bg)', fontFamily: 'DM Sans, sans-serif' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <span style={{ fontFamily: 'Fraunces, serif', color: 'var(--plx-primary)', fontStyle: 'italic', fontWeight: 300 }} className="text-3xl">
              planexa
            </span>
          </a>
          <p className="text-sm mt-2" style={{ color: '#64748B' }}>
            {mode === 'signup' ? t('login.createAccount') : t('login.welcomeBack')}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--plx-border)' }}>
          {(['signin', 'signup', 'magic'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setMagicSent(false); }}
              className="flex-1 py-2.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: mode === m ? 'var(--plx-primary)' : 'white',
                color: mode === m ? 'white' : '#64748B',
              }}
            >
              {t(`login.tabs.${m}`)}
            </button>
          ))}
        </div>

        {/* Magic link sent state */}
        {magicSent ? (
          <div className="text-center py-8 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid var(--plx-border)' }}>
            <CheckCircle size={40} className="mx-auto mb-3" style={{ color: 'var(--plx-primary)' }} />
            <h3 className="font-semibold mb-1" style={{ color: '#1E293B' }}>{t('login.checkInbox')}</h3>
            <p className="text-sm" style={{ color: '#64748B' }}>{t('login.magicSent', { email })}</p>
            <button onClick={() => setMagicSent(false)} className="mt-4 text-xs underline" style={{ color: '#94A3B8' }}>
              {t('login.tryAgain')}
            </button>
          </div>
        ) : (
          <form
            onSubmit={mode === 'magic' ? handleMagicLink : handleEmailAuth}
            className="rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: 'white', border: '1px solid var(--plx-border)' }}
          >
            {/* Email field */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569' }}>
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{ border: '1px solid var(--plx-border)', backgroundColor: 'white', color: '#1E293B' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--plx-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--plx-border)')}
                />
              </div>
            </div>

            {/* Password field (not shown for magic link) */}
            {isSignIn && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569' }}>
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                    style={{ border: '1px solid var(--plx-border)', backgroundColor: 'white', color: '#1E293B' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--plx-primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--plx-border)')}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              style={{
                backgroundColor: 'var(--plx-primary)',
                color: 'white',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--plx-hover)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--plx-primary)')}
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> {t('login.loading')}</>
              ) : mode === 'magic' ? (
                <><Mail size={14} /> {t('login.sendMagicLink')}</>
              ) : mode === 'signup' ? (
                <><ArrowRight size={14} /> {t('login.createAccount')}</>
              ) : (
                <><ArrowRight size={14} /> {t('login.signIn')}</>
              )}
            </button>

            {mode === 'signin' && (
              <p className="text-center text-xs" style={{ color: '#94A3B8' }}>
                {t('login.noAccount')}{' '}
                <button type="button" onClick={() => setMode('signup')} className="underline" style={{ color: 'var(--plx-primary)' }}>
                  {t('login.signUpFree')}
                </button>
              </p>
            )}
          </form>
        )}

        <p className="text-center text-xs mt-6" style={{ color: '#CBD5E1' }}>
          © 2026 Planexa
        </p>
      </div>
    </div>
  );
}
