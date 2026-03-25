import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@planexa.app";

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!resend) {
    console.log(`[Email] RESEND_API_KEY not set — skipping send to ${to}: "${subject}"`);
    return false;
  }
  try {
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) {
      console.error("[Email] Resend error:", error);
      return false;
    }
    console.log(`[Email] Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error("[Email] Failed to send:", err);
    return false;
  }
}

const BASE_STYLES = `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#1E293B`;
const MUTED = `color:#64748B`;
const GREEN = `color:#2D6A4F`;
const BTN = `display:inline-block;background:#2D6A4F;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600`;

export async function sendBookingConfirmationEmail(
  clientEmail: string,
  clientName: string,
  appointmentType: string,
  date: string,
  time: string,
  duration: number,
  price: number,
  businessName?: string
): Promise<boolean> {
  const subject = `Booking Confirmed: ${appointmentType}`;
  const priceRow = price > 0
    ? `<tr><td style="${MUTED};padding:6px 0">Price</td><td style="padding:6px 0;font-weight:600">$${price.toFixed(2)}</td></tr>`
    : "";
  const html = `
    <div style="${BASE_STYLES}">
      <h2 style="${GREEN}">Your Appointment is Confirmed!</h2>
      <p>Hi ${clientName},</p>
      <p>Your booking has been confirmed${businessName ? ` with <strong>${businessName}</strong>` : ""}.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="${MUTED};padding:6px 0">Service</td><td style="padding:6px 0;font-weight:600">${appointmentType}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Date</td><td style="padding:6px 0;font-weight:600">${date}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Time</td><td style="padding:6px 0;font-weight:600">${time}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Duration</td><td style="padding:6px 0;font-weight:600">${duration} min</td></tr>
        ${priceRow}
      </table>
      <p style="${MUTED};font-size:14px">Need to reschedule? Just reply to this email.</p>
    </div>`;
  return sendEmail(clientEmail, subject, html);
}

export async function sendOwnerBookingNotificationEmail(
  ownerEmail: string,
  ownerName: string,
  clientName: string,
  clientEmail: string,
  appointmentType: string,
  date: string,
  time: string
): Promise<boolean> {
  const subject = `New booking: ${clientName} — ${appointmentType}`;
  const html = `
    <div style="${BASE_STYLES}">
      <h2 style="${GREEN}">New Booking Received</h2>
      <p>Hi ${ownerName},</p>
      <p><strong>${clientName}</strong> just booked <strong>${appointmentType}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="${MUTED};padding:6px 0">Client</td><td style="padding:6px 0">${clientName} &lt;${clientEmail}&gt;</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Service</td><td style="padding:6px 0;font-weight:600">${appointmentType}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Date</td><td style="padding:6px 0;font-weight:600">${date}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Time</td><td style="padding:6px 0;font-weight:600">${time}</td></tr>
      </table>
    </div>`;
  return sendEmail(ownerEmail, subject, html);
}

export async function sendPaymentReceiptEmail(
  clientEmail: string,
  clientName: string,
  appointmentType: string,
  date: string,
  amount: number,
  transactionId: string
): Promise<boolean> {
  const subject = `Payment Receipt: $${amount.toFixed(2)}`;
  const html = `
    <div style="${BASE_STYLES}">
      <h2 style="${GREEN}">Payment Received</h2>
      <p>Hi ${clientName}, thank you for your payment!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="${MUTED};padding:6px 0">Amount</td><td style="padding:6px 0;font-weight:600">$${amount.toFixed(2)}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Service</td><td style="padding:6px 0">${appointmentType}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Date</td><td style="padding:6px 0">${date}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Transaction</td><td style="padding:6px 0;font-size:12px;${MUTED}">${transactionId}</td></tr>
      </table>
    </div>`;
  return sendEmail(clientEmail, subject, html);
}

export async function sendTrialReminderEmail(
  clientEmail: string,
  clientName: string,
  daysRemaining: number,
  upgradeLink: string
): Promise<boolean> {
  const subject = `Your free trial ends in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`;
  const html = `
    <div style="${BASE_STYLES}">
      <h2 style="${GREEN}">Trial Expiring Soon</h2>
      <p>Hi ${clientName},</p>
      <p>Your free trial ends in <strong>${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}</strong>. Upgrade to keep access.</p>
      <p><a href="${upgradeLink}" style="${BTN}">Upgrade Now</a></p>
    </div>`;
  return sendEmail(clientEmail, subject, html);
}

export async function sendAppointmentReminderEmail(
  clientEmail: string,
  clientName: string,
  appointmentType: string,
  date: string,
  time: string,
  duration: number,
  timeUntil: string
): Promise<boolean> {
  const subject = `Reminder: ${appointmentType} in ${timeUntil}`;
  const html = `
    <div style="${BASE_STYLES}">
      <h2 style="${GREEN}">Appointment Reminder</h2>
      <p>Hi ${clientName}, you have an upcoming appointment:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="${MUTED};padding:6px 0">Service</td><td style="padding:6px 0;font-weight:600">${appointmentType}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Date</td><td style="padding:6px 0;font-weight:600">${date}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Time</td><td style="padding:6px 0;font-weight:600">${time}</td></tr>
        <tr><td style="${MUTED};padding:6px 0">Duration</td><td style="padding:6px 0">${duration} min</td></tr>
      </table>
      <p style="${MUTED};font-size:14px">Please arrive 5 minutes early.</p>
    </div>`;
  return sendEmail(clientEmail, subject, html);
}
