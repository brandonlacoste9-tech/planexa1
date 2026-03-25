CREATE TYPE "role" AS ENUM ('user', 'admin');
CREATE TYPE "subscription_status" AS ENUM ('trial', 'active', 'canceled', 'expired');
CREATE TYPE "payment_status" AS ENUM ('pending', 'succeeded', 'failed', 'canceled');
CREATE TYPE "notification_type" AS ENUM ('email', 'sms', 'voice');
CREATE TYPE "notification_log_status" AS ENUM ('pending', 'sent', 'failed', 'bounced');
CREATE TYPE "appointment_status" AS ENUM ('scheduled', 'completed', 'canceled', 'no-show');
CREATE TYPE "appointment_payment_status" AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "openId" varchar(64) NOT NULL UNIQUE,
  "name" text,
  "email" varchar(320),
  "loginMethod" varchar(64),
  "role" "role" NOT NULL DEFAULT 'user',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "lastSignedIn" timestamp NOT NULL DEFAULT now(),
  "stripeCustomerId" varchar(255) UNIQUE,
  "trialStartedAt" timestamp,
  "trialEndsAt" timestamp,
  "isTrialActive" boolean NOT NULL DEFAULT false,
  "subscriptionStatus" "subscription_status" NOT NULL DEFAULT 'trial',
  "phoneNumber" varchar(20),
  "bookingSlug" varchar(64) UNIQUE,
  "businessName" text,
  "businessDescription" text,
  "businessTimezone" varchar(64)
);

CREATE TABLE "subscriptions" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL,
  "stripeSubscriptionId" varchar(255) UNIQUE,
  "status" "subscription_status" NOT NULL DEFAULT 'trial',
  "trialStartedAt" timestamp NOT NULL DEFAULT now(),
  "trialEndsAt" timestamp NOT NULL,
  "currentPeriodStart" timestamp,
  "currentPeriodEnd" timestamp,
  "canceledAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "payments" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL,
  "stripePaymentIntentId" varchar(255) NOT NULL UNIQUE,
  "stripeCheckoutSessionId" varchar(255) UNIQUE,
  "appointmentTypeId" varchar(64),
  "amount" numeric(10, 2) NOT NULL,
  "currency" varchar(3) NOT NULL DEFAULT 'USD',
  "status" "payment_status" NOT NULL DEFAULT 'pending',
  "customerEmail" varchar(320),
  "customerName" text,
  "metadata" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "notificationPreferences" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL UNIQUE,
  "emailBookingConfirmation" boolean NOT NULL DEFAULT true,
  "emailPaymentReceipt" boolean NOT NULL DEFAULT true,
  "emailTrialReminder" boolean NOT NULL DEFAULT true,
  "emailAppointmentReminder" boolean NOT NULL DEFAULT true,
  "smsEnabled" boolean NOT NULL DEFAULT false,
  "smsPhoneNumber" varchar(20),
  "smsAppointmentReminder24h" boolean NOT NULL DEFAULT true,
  "smsAppointmentReminder1h" boolean NOT NULL DEFAULT true,
  "voiceEnabled" boolean NOT NULL DEFAULT false,
  "voicePhoneNumber" varchar(20),
  "voiceCallReminder" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "notificationLogs" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL,
  "type" "notification_type" NOT NULL,
  "recipient" varchar(320) NOT NULL,
  "subject" text,
  "message" text,
  "status" "notification_log_status" NOT NULL DEFAULT 'pending',
  "externalId" varchar(255),
  "error" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "sentAt" timestamp
);

CREATE TABLE "clients" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(320) NOT NULL,
  "phoneNumber" varchar(20),
  "notes" text,
  "totalAppointments" integer NOT NULL DEFAULT 0,
  "totalSpent" numeric(10, 2) NOT NULL DEFAULT '0',
  "lastAppointmentAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "appointments" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL,
  "clientId" integer NOT NULL,
  "clientName" varchar(255) NOT NULL,
  "clientEmail" varchar(320) NOT NULL,
  "clientPhone" varchar(20),
  "appointmentType" varchar(255) NOT NULL,
  "duration" integer NOT NULL,
  "price" numeric(10, 2) NOT NULL,
  "status" "appointment_status" NOT NULL DEFAULT 'scheduled',
  "startTime" timestamp NOT NULL,
  "endTime" timestamp NOT NULL,
  "notes" text,
  "paymentId" integer,
  "paymentStatus" "appointment_payment_status" NOT NULL DEFAULT 'pending',
  "isTrialBooking" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
