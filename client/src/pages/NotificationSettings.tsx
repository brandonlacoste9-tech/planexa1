import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Phone, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
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

  const handleEmailChange = (key: string, value: boolean) => {
    setEmailPrefs({ ...emailPrefs, [key]: value });
  };

  const handleSmsChange = (key: string, value: any) => {
    setSmsPrefs({ ...smsPrefs, [key]: value });
  };

  const handleVoiceChange = (key: string, value: any) => {
    setVoicePrefs({ ...voicePrefs, [key]: value });
  };

  const handleSavePreferences = async () => {
    try {
      // TODO: Call API to save preferences
      console.log('Saving preferences:', { emailPrefs, smsPrefs, voicePrefs });
      toast.success('Notification preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage how you receive appointment reminders and booking notifications
          </p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail size={16} />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare size={16} />
              SMS
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Phone size={16} />
              Voice
            </TabsTrigger>
          </TabsList>

          {/* Email Preferences */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Choose which emails you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a new booking is confirmed
                    </p>
                  </div>
                  <Switch
                    checked={emailPrefs.bookingConfirmation}
                    onCheckedChange={(value) =>
                      handleEmailChange('bookingConfirmation', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Payment Receipts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email receipts for payments
                    </p>
                  </div>
                  <Switch
                    checked={emailPrefs.paymentReceipt}
                    onCheckedChange={(value) =>
                      handleEmailChange('paymentReceipt', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Trial Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded before your free trial expires
                    </p>
                  </div>
                  <Switch
                    checked={emailPrefs.trialReminder}
                    onCheckedChange={(value) =>
                      handleEmailChange('trialReminder', value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming appointments
                    </p>
                  </div>
                  <Switch
                    checked={emailPrefs.appointmentReminder}
                    onCheckedChange={(value) =>
                      handleEmailChange('appointmentReminder', value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Preferences */}
          <TabsContent value="sms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  SMS Reminders
                </CardTitle>
                <CardDescription>
                  Receive text message reminders for your appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Enable SMS Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text messages for appointment reminders
                    </p>
                  </div>
                  <Switch
                    checked={smsPrefs.enabled}
                    onCheckedChange={(value) => handleSmsChange('enabled', value)}
                  />
                </div>

                {smsPrefs.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={smsPrefs.phoneNumber}
                        onChange={(e) =>
                          handleSmsChange('phoneNumber', e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Include country code (e.g., +1 for US)
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="text-base font-medium">24-Hour Reminder</Label>
                        <p className="text-sm text-muted-foreground">
                          Remind me 24 hours before appointment
                        </p>
                      </div>
                      <Switch
                        checked={smsPrefs.reminder24h}
                        onCheckedChange={(value) =>
                          handleSmsChange('reminder24h', value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="text-base font-medium">1-Hour Reminder</Label>
                        <p className="text-sm text-muted-foreground">
                          Remind me 1 hour before appointment
                        </p>
                      </div>
                      <Switch
                        checked={smsPrefs.reminder1h}
                        onCheckedChange={(value) =>
                          handleSmsChange('reminder1h', value)
                        }
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
                  Voice Calls
                </CardTitle>
                <CardDescription>
                  Receive automated voice call reminders for your appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Enable Voice Calls</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive phone call reminders for appointments
                    </p>
                  </div>
                  <Switch
                    checked={voicePrefs.enabled}
                    onCheckedChange={(value) => handleVoiceChange('enabled', value)}
                  />
                </div>

                {voicePrefs.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="voicePhone">Phone Number</Label>
                      <Input
                        id="voicePhone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={voicePrefs.phoneNumber}
                        onChange={(e) =>
                          handleVoiceChange('phoneNumber', e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Include country code (e.g., +1 for US)
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="text-base font-medium">Appointment Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive voice call reminders before appointments
                        </p>
                      </div>
                      <Switch
                        checked={voicePrefs.callReminder}
                        onCheckedChange={(value) =>
                          handleVoiceChange('callReminder', value)
                        }
                      />
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Note:</strong> Voice calls are automated and may incur additional charges depending on your service provider.
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
            onClick={handleSavePreferences}
            className="bg-green-600 hover:bg-green-700"
          >
            <Bell className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
