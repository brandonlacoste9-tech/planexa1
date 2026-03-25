ALTER TABLE `users` ADD `bookingSlug` varchar(64);
--> statement-breakpoint
ALTER TABLE `users` ADD `businessName` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `businessDescription` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `businessTimezone` varchar(64);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_bookingSlug_unique` UNIQUE(`bookingSlug`);
