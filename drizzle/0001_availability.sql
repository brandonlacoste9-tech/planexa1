CREATE TABLE IF NOT EXISTS "availability" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL,
  "dayOfWeek" integer NOT NULL,
  "startTime" varchar(5) NOT NULL DEFAULT '09:00',
  "endTime" varchar(5) NOT NULL DEFAULT '17:00',
  "isEnabled" boolean NOT NULL DEFAULT true,
  CONSTRAINT "availability_user_day" UNIQUE ("userId", "dayOfWeek")
);
