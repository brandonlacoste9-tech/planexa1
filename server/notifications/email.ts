import { invokeLLM } from "../_core/llm";

export interface EmailNotification {
  to: string;
  subject: string;
  type: "booking_confirmation" | "payment_receipt" | "trial_reminder" | "appointment_reminder";
  data: Record<string, any>;
}

/**
 * Email templates for different notification types
 */
const emailTemplates = {
  booking_confirmation: (data: any) => ({
    subject: `Booking Confirmed: ${data.appointmentType}`,
    html: `
      <h2>Your Appointment is Confirmed!</h2>
      <p>Hi ${data.clientName},</p>
      <p>Your booking has been confirmed for:</p>
      <ul>
        <li><strong>Service:</strong> ${data.appointmentType}</li>
        <li><strong>Date:</strong> ${data.date}</li>
        <li><strong>Time:</strong> ${data.time}</li>
        <li><strong>Duration:</strong> ${data.duration} minutes</li>
      </ul>
      <p><strong>Price:</strong> $${data.price}</p>
      <p>You have 7 days of free access to try this service. After 7 days, payment will be required to continue.</p>
      <p>If you need to reschedule or cancel, please reply to this email.</p>
      <p>Best regards,<br/>The Planexa Team</p>
    `,
  }),

  payment_receipt: (data: any) => ({
    subject: `Payment Receipt: $${data.amount}`,
    html: `
      <h2>Payment Received</h2>
      <p>Hi ${data.clientName},</p>
      <p>Thank you for your payment!</p>
      <ul>
        <li><strong>Amount:</strong> $${data.amount}</li>
        <li><strong>Service:</strong> ${data.appointmentType}</li>
        <li><strong>Date:</strong> ${data.date}</li>
        <li><strong>Transaction ID:</strong> ${data.transactionId}</li>
      </ul>
      <p>Your subscription is now active. You can manage your account at any time.</p>
      <p>Best regards,<br/>The Planexa Team</p>
    `,
  }),

  trial_reminder: (data: any) => ({
    subject: `Your Free Trial Ends in ${data.daysRemaining} Days`,
    html: `
      <h2>Trial Expiration Reminder</h2>
      <p>Hi ${data.clientName},</p>
      <p>Your 7-day free trial ends in <strong>${data.daysRemaining} days</strong>.</p>
      <p>To continue using Planexa after your trial ends, please add a payment method.</p>
      <p>Plans start at just $19/month.</p>
      <p><a href="${data.upgradeLink}" style="background-color: #2D6A4F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Upgrade Now</a></p>
      <p>Best regards,<br/>The Planexa Team</p>
    `,
  }),

  appointment_reminder: (data: any) => ({
    subject: `Reminder: Your Appointment is ${data.timeUntil}`,
    html: `
      <h2>Appointment Reminder</h2>
      <p>Hi ${data.clientName},</p>
      <p>This is a reminder that you have an appointment coming up:</p>
      <ul>
        <li><strong>Service:</strong> ${data.appointmentType}</li>
        <li><strong>Date:</strong> ${data.date}</li>
        <li><strong>Time:</strong> ${data.time}</li>
        <li><strong>Duration:</strong> ${data.duration} minutes</li>
      </ul>
      <p>Please arrive 5 minutes early.</p>
      <p>If you need to reschedule, please let us know as soon as possible.</p>
      <p>Best regards,<br/>The Planexa Team</p>
    `,
  }),
};

/**
 * Send email notification using Manus built-in notification API
 */
export async function sendEmailNotification(notification: EmailNotification): Promise<boolean> {
  try {
    const template = emailTemplates[notification.type];
    if (!template) {
      console.error(`Unknown email template: ${notification.type}`);
      return false;
    }

    const emailContent = template(notification.data);

    // Using Manus built-in notification API
    // In production, this would integrate with Resend, SendGrid, or similar
    console.log(`[Email] Sending ${notification.type} to ${notification.to}`);
    console.log(`Subject: ${emailContent.subject}`);

    // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
    // For now, log the notification
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send email:`, error);
    return false;
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  clientEmail: string,
  clientName: string,
  appointmentType: string,
  date: string,
  time: string,
  duration: number,
  price: number
): Promise<boolean> {
  return sendEmailNotification({
    to: clientEmail,
    subject: `Booking Confirmed: ${appointmentType}`,
    type: "booking_confirmation",
    data: {
      clientName,
      appointmentType,
      date,
      time,
      duration,
      price,
    },
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(
  clientEmail: string,
  clientName: string,
  appointmentType: string,
  date: string,
  amount: number,
  transactionId: string
): Promise<boolean> {
  return sendEmailNotification({
    to: clientEmail,
    subject: `Payment Receipt: $${amount}`,
    type: "payment_receipt",
    data: {
      clientName,
      appointmentType,
      date,
      amount,
      transactionId,
    },
  });
}

/**
 * Send trial expiration reminder email
 */
export async function sendTrialReminderEmail(
  clientEmail: string,
  clientName: string,
  daysRemaining: number,
  upgradeLink: string
): Promise<boolean> {
  return sendEmailNotification({
    to: clientEmail,
    subject: `Your Free Trial Ends in ${daysRemaining} Days`,
    type: "trial_reminder",
    data: {
      clientName,
      daysRemaining,
      upgradeLink,
    },
  });
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminderEmail(
  clientEmail: string,
  clientName: string,
  appointmentType: string,
  date: string,
  time: string,
  duration: number,
  timeUntil: string
): Promise<boolean> {
  return sendEmailNotification({
    to: clientEmail,
    subject: `Reminder: Your Appointment is ${timeUntil}`,
    type: "appointment_reminder",
    data: {
      clientName,
      appointmentType,
      date,
      time,
      duration,
      timeUntil,
    },
  });
}
