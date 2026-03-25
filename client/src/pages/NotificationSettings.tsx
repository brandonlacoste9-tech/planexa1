import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Phone, Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: prefs, isLoading } = trpc.notifications.getPreferences.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const updateMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => toast.success(t('notifications.saved')),
    onError: () => toast.error(t('notifications.saveError')),
  });

  const [emailPrefs, setEmailPrefs] = useState({
    bookingConfirmation: true,
    paymentReceipt: true,
    trialReminder: true,
    appointmentReminder: true,
  });

  const [smsPrefs, setSmsPrefs] = useState({
    enabled: false,
    phoneNumber: '',
    reminder24h: true,
    reminder1h: true,
  });

  const [voicePrefs, setVoicePrefs] = useState({
    enabled: false,
    phoneNumber: '',
    callReminder: false,
  });

  useEffect(() => {
    if (!prefs) return;
    setEmailPrefs({
      bookingConfirmation: prefs.emailBookingConfirmation ?? true,
      paymentReceipt: prefs.emailPaymentReceipt ?? true,
      trialReminder: prefs.emailTrialReminder ?? true,
      appointmentReminder: prefs.emailAppointmentReminder ?? true,
    });
    setSmsPrefs({
      enabled: prefs.smsEnabled ?? false,
      phoneNumber: prefs.smsPhoneNumber ?? '',
      reminder24h: prefs.smsAppointmentReminder24h ?? true,
      reminder1h: prefs.smsAppointmentReminder1h ?? true,
    });
    setVoicePrefs({
      enabled: prefs.voiceEnabled ?? false,
      phoneNumber: prefs.voicePhoneNumber ?? '',
      callReminder: prefs.voiceCallReminder ?? false,
    });
  }, [prefs]);

  const handleSave = () => {
    updateMutation.mutate({
      emailBookingConfirmation: emailPrefs.bookingConfirmation,
      emailPaymentReceipt: emailPrefs.paymentReceipt,
      emailTrialReminder: emailPrefs.trialReminder,
      emailAppointmentReminder: emailPrefs.appointmentReminder,
      smsEnabled: smsPrefs.enabled,
      smsPhoneNumber: smsPrefs.phoneNumber || undefined,
      smsAppointmentReminder24h: smsPrefs.reminder24h,
      smsAppointmentReminder1h: smsPrefs.reminder1h,
      voiceEnabled: voicePrefs.enabled,
      voicePhoneNumber: voicePrefs.phoneNumber || undefined,
      voiceCallReminder: voicePrefs.callReminder,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--plx-bg)' }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--plx-primary)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('notifications.title')}</h1>
          <p className="text-muted-foreground">
            {t('notifications.subtitle')}
          </p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail size={16} />
              {t('notifications.tabs.email')}
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare size={16} />
              {t('notifications.tabs.sms')}
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Phone size={16} />
              {t('notifications.tabs.voice')}
            </TabsTrigger>
          </TabsList>

          {/* Email Preferences */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {t('notifications.email.title')}
                </CardTitle>
                <CardDescription>
                  {t('notifications.email.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'bookingConfirmation', label: t('notifications.email.bookingConfirmation'), desc: t('notifications.email.bookingConfirmationDesc') },
                  { key: 'paymentReceipt', label: t('notifications.email.paymentReceipt'), desc: t('notifications.email.paymentReceiptDesc') },
                  { key: 'trialReminder', label: t('notifications.email.trialReminder'), desc: t('notifications.email.trialReminderDesc') },
                  { key: 'appointmentReminder', label: t('notifications.email.appointmentReminder'), desc: t('notifications.email.appointmentReminderDesc') },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">{label}</Label>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={emailPrefs[key as keyof typeof emailPrefs] as boolean}
                      onCheckedChange={v => setEmailPrefs(p => ({ ...p, [key]: v }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Preferences */}
          <TabsContent value="sms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t('notifications.sms.title')}
                </CardTitle>
                <CardDescription>
                  {t('notifications.sms.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">{t('notifications.sms.enable')}</Label>
                    <p className="text-sm text-muted-foreground">{t('notifications.sms.enableDesc')}</p>
                  </div>
                  <Switch
                    checked={smsPrefs.enabled}
                    onCheckedChange={v => setSmsPrefs(p => ({ ...p, enabled: v }))}
                  />
                </div>

                {smsPrefs.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('notifications.sms.phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={smsPrefs.phoneNumber}
                        onChange={e => setSmsPrefs(p => ({ ...p, phoneNumber: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">{t('notifications.sms.phoneHint')}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="text-base font-medium">{t('notifications.sms.reminder24h')}</Label>
                        <p className="text-sm text-muted-foreground">{t('notifications.sms.reminder24hDesc')}</p>
                      </div>
                      <Switch
                        checked={smsPrefs.reminder24h}
                        onCheckedChange={v => setSmsPrefs(p => ({ ...p, reminder24h: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="text-base font-medium">{t('notifications.sms.reminder1h')}</Label>
                        <p className="text-sm text-muted-foreground">{t('notifications.sms.reminder1hDesc')}</p>
                      </div>
                      <Switch
                        checked={smsPrefs.reminder1h}
                        onCheckedChange={v => setSmsPrefs(p => ({ ...p, reminder1h: v }))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Preferences */}
          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {t('notifications.voice.title')}
                </CardTitle>
                <CardDescription>
                  {t('notifications.voice.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">{t('notifications.voice.enable')}</Label>
                    <p className="text-sm text-muted-foreground">{t('notifications.voice.enableDesc')}</p>
                  </div>
                  <Switch
                    checked={voicePrefs.enabled}
                    onCheckedChange={v => setVoicePrefs(p => ({ ...p, enabled: v }))}
                  />
                </div>

                {voicePrefs.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="voicePhone">{t('notifications.voice.phone')}</Label>
                      <Input
                        id="voicePhone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={voicePrefs.phoneNumber}
                        onChange={e => setVoicePrefs(p => ({ ...p, phoneNumber: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">{t('notifications.voice.phoneHint')}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="text-base font-medium">{t('notifications.voice.reminder')}</Label>
                        <p className="text-sm text-muted-foreground">{t('notifications.voice.reminderDesc')}</p>
                      </div>
                      <Switch
                        checked={voicePrefs.callReminder}
                        onCheckedChange={v => setVoicePrefs(p => ({ ...p, callReminder: v }))}
                      />
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>{t('notifications.voice.note')}</strong> {t('notifications.voice.noteDesc')}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-4">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            {t('notifications.save')}
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>{t('common.cancel')}</Button>
        </div>
      </div>
    </div>
  );
}
