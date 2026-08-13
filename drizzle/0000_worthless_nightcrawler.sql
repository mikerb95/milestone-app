CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slug` text,
	`name` text NOT NULL,
	`name_en` text,
	`emoji` text DEFAULT '🎯' NOT NULL,
	`color` text DEFAULT '#6C8CF5' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `category_user_idx` ON `category` (`user_id`);--> statement-breakpoint
CREATE TABLE `goal_update` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`value` real NOT NULL,
	`note` text,
	`date` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goal`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `goal_update_goal_idx` ON `goal_update` (`goal_id`,`date`);--> statement-breakpoint
CREATE TABLE `goal` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_id` text,
	`title` text NOT NULL,
	`description` text,
	`why` text,
	`type` text DEFAULT 'numeric' NOT NULL,
	`timeframe` text DEFAULT 'year' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`trend` text DEFAULT 'steady' NOT NULL,
	`current_value` real DEFAULT 0 NOT NULL,
	`target_value` real DEFAULT 100 NOT NULL,
	`start_value` real DEFAULT 0 NOT NULL,
	`unit` text,
	`target_date` text,
	`reminder` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`last_progress_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `goal_user_idx` ON `goal` (`user_id`);--> statement-breakpoint
CREATE INDEX `goal_user_tf_idx` ON `goal` (`user_id`,`timeframe`);--> statement-breakpoint
CREATE TABLE `habit_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`date` text NOT NULL,
	`value` real DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habit`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `habit_entry_unique` ON `habit_entry` (`habit_id`,`date`);--> statement-breakpoint
CREATE INDEX `habit_entry_date_idx` ON `habit_entry` (`date`);--> statement-breakpoint
CREATE TABLE `habit` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`emoji` text DEFAULT '🎯' NOT NULL,
	`color` text DEFAULT '#FF8A5B' NOT NULL,
	`type` text DEFAULT 'binary' NOT NULL,
	`target_value` real DEFAULT 1 NOT NULL,
	`frequency` text DEFAULT 'daily' NOT NULL,
	`weekly_target` integer DEFAULT 7 NOT NULL,
	`days` text,
	`archived` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `habit_user_idx` ON `habit` (`user_id`);--> statement-breakpoint
CREATE TABLE `milestone` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`title` text NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`done_at` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goal`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `milestone_goal_idx` ON `milestone` (`goal_id`);--> statement-breakpoint
CREATE TABLE `password_reset_token` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	`used_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `prt_user_idx` ON `password_reset_token` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subtask` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`title` text NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `subtask_task_idx` ON `subtask` (`task_id`);--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`goal_id` text,
	`title` text NOT NULL,
	`notes` text,
	`priority` text DEFAULT 'med' NOT NULL,
	`due_date` text,
	`recurrence` text,
	`done` integer DEFAULT false NOT NULL,
	`done_at` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`goal_id`) REFERENCES `goal`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `task_user_idx` ON `task` (`user_id`);--> statement-breakpoint
CREATE INDEX `task_user_due_idx` ON `task` (`user_id`,`due_date`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`locale` text DEFAULT 'es' NOT NULL,
	`timezone` text DEFAULT 'America/Bogota' NOT NULL,
	`date_format` text DEFAULT 'd MMM yyyy' NOT NULL,
	`time_format` text DEFAULT '24h' NOT NULL,
	`first_day_of_week` integer DEFAULT 1 NOT NULL,
	`currency` text DEFAULT 'COP' NOT NULL,
	`unit_system` text DEFAULT 'metric' NOT NULL,
	`theme` text DEFAULT 'dark' NOT NULL,
	`accent_color` text DEFAULT '#FF8A3D' NOT NULL,
	`text_size` text DEFAULT 'medium' NOT NULL,
	`reduce_motion` integer DEFAULT false NOT NULL,
	`reduce_transparency` integer DEFAULT false NOT NULL,
	`notifications` integer DEFAULT true NOT NULL,
	`streak_alerts` integer DEFAULT true NOT NULL,
	`daily_summary` text DEFAULT '07:30',
	`weekly_summary` text DEFAULT 'sun 20:00',
	`goal_nudges` text DEFAULT 'weekly',
	`quiet_hours_start` text DEFAULT '22:00',
	`quiet_hours_end` text DEFAULT '06:30',
	`default_timeframe` text DEFAULT 'month' NOT NULL,
	`count_today` integer DEFAULT true NOT NULL,
	`streak_freeze` integer DEFAULT 2 NOT NULL,
	`day_cutoff_hour` integer DEFAULT 3 NOT NULL,
	`hide_completed` integer DEFAULT false NOT NULL,
	`sync` integer DEFAULT true NOT NULL,
	`biometric_lock` integer DEFAULT false NOT NULL,
	`analytics` integer DEFAULT false NOT NULL,
	`onboarded_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`password_hash` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
