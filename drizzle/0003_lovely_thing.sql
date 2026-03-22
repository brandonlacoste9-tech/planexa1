CREATE TABLE `notificationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('email','sms','voice') NOT NULL,
	`recipient` varchar(320) NOT NULL,
	`subject` text,
	`message` text,
	`status` enum('pending','sent','failed','bounced') NOT NULL DEFAULT 'pending',
	`externalId` varchar(255),
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`sentAt` timestamp,
	CONSTRAINT `notificationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailBookingConfirmation` enum('true','false') NOT NULL DEFAULT 'true',
	`emailPaymentReceipt` enum('true','false') NOT NULL DEFAULT 'true',
	`emailTrialReminder` enum('true','false') NOT NULL DEFAULT 'true',
	`emailAppointmentReminder` enum('true','false') NOT NULL DEFAULT 'true',
	`smsEnabled` enum('true','false') NOT NULL DEFAULT 'false',
	`smsPhoneNumber` varchar(20),
	`smsAppointmentReminder24h` enum('true','false') NOT NULL DEFAULT 'true',
	`smsAppointmentReminder1h` enum('true','false') NOT NULL DEFAULT 'true',
	`voiceEnabled` enum('true','false') NOT NULL DEFAULT 'false',
	`voicePhoneNumber` varchar(20),
	`voiceCallReminder` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);