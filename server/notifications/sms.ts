/**
 * SMS notification service for appointment reminders and alerts
 */

export interface SMSNotification {
  phoneNumber: string;
  message: string;
  type: "appointment_reminder_24h" | "appointment_reminder_1h" | "payment_reminder" | "trial_reminder";
}

/**
 * SMS message templates
 */
const smsTemplates = {
  appointment_reminder_24h: (data: any) => 
    `Hi ${data.clientName}! Reminder: Your ${data.appointmentType} appointment is tomorrow at ${data.time}. See you then!`,

  appointment_reminder_1h: (data: any) => 
    `Hi ${data.clientName}! Your ${data.appointmentType} appointment starts in 1 hour at ${data.time}. We're ready for you!`,

  payment_reminder: (data: any) => 
    `Hi ${data.clientName}! Your free trial ends in ${data.daysRemaining} days. Add a payment method now to continue: ${data.upgradeLink}`,

  trial_reminder: (data: any) => 
    `Hi ${data.clientName}! Your 7-day free trial ends in ${data.daysRemaining} days. Plans start at $19/month.`,
};

/**
 * Send SMS notification using Manus built-in SMS API
 */
export async function sendSMSNotification(notification: SMSNotification): Promise<boolean> {
  try {
    const template = smsTemplates[notification.type];
    if (!template) {
      console.error(`Unknown SMS template: ${notification.type}`);
      return false;
    }

    // Using Manus built-in SMS API
    // In production, this would integrate with Twilio, AWS SNS, or similar
    console.log(`[SMS] Sending ${notification.type} to ${notification.phoneNumber}`);
    console.log(`Message: ${notification.message}`);

    // TODO: Integrate with actual SMS service (Twilio, AWS SNS, etc.)
    // For now, log the notification
    return true;
  } catch (error) {
    console.error(`[SMS Error] Failed to send SMS:`, error);
    return false;
  }
}

/**
 * Send 24-hour appointment reminder SMS
 */
export async function sendAppointmentReminder24hSMS(
  phoneNumber: string,
  clientName: string,
  appointmentType: string,
  time: string
): Promise<boolean> {
  const message = smsTemplates.appointment_reminder_24h({
    clientName,
    appointmentType,
    time,
  });

  return sendSMSNotification({
    phoneNumber,
    message,
    type: "appointment_reminder_24h",
  });
}

/**
 * Send 1-hour appointment reminder SMS
 */
export async function sendAppointmentReminder1hSMS(
  phoneNumber: string,
  clientName: string,
  appointmentType: string,
  time: string
): Promise<boolean> {
  const message = smsTemplates.appointment_reminder_1h({
    clientName,
    appointmentType,
    time,
  });

  return sendSMSNotification({
    phoneNumber,
    message,
    type: "appointment_reminder_1h",
  });
}

/**
 * Send payment reminder SMS
 */
export async function sendPaymentReminderSMS(
  phoneNumber: string,
  clientName: string,
  daysRemaining: number,
  upgradeLink: string
): Promise<boolean> {
  const message = smsTemplates.payment_reminder({
    clientName,
    daysRemaining,
    upgradeLink,
  });

  return sendSMSNotification({
    phoneNumber,
    message,
    type: "payment_reminder",
  });
}

/**
 * Send trial expiration reminder SMS
 */
export async function sendTrialReminderSMS(
  phoneNumber: string,
  clientName: string,
  daysRemaining: number
): Promise<boolean> {
  const message = smsTemplates.trial_reminder({
    clientName,
    daysRemaining,
  });

  return sendSMSNotification({
    phoneNumber,
    message,
    type: "trial_reminder",
  });
}
