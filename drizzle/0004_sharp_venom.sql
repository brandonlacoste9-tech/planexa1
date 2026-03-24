CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(20),
	`appointmentType` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`status` enum('scheduled','completed','canceled','no-show') NOT NULL DEFAULT 'scheduled',
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`notes` text,
	`paymentId` int,
	`paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`isTrialBooking` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phoneNumber` varchar(20),
	`notes` text,
	`totalAppointments` int NOT NULL DEFAULT 0,
	`totalSpent` decimal(10,2) NOT NULL DEFAULT '0',
	`lastAppointmentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
