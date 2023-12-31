-- CreateTable
CREATE TABLE `platform_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `default_image` VARCHAR(200) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `engine_name` VARCHAR(50) NOT NULL,
    `engine_description` VARCHAR(1000) NULL,
    `engine_image` VARCHAR(200) NOT NULL,
    `state` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `engine_profile_name` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experiment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator` INTEGER NULL,
    `experiment_name` VARCHAR(100) NULL,
    `create_time` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `available` TINYINT UNSIGNED NULL DEFAULT 1,
    `description` TEXT NULL,
    `nano_id` VARCHAR(16) NULL,

    UNIQUE INDEX `psy_experiment_nano_id_uindex`(`nano_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experiment_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `experiment_id` INTEGER NULL,
    `setting` JSON NULL,
    `intro` LONGTEXT NULL,
    `engine_id` INTEGER NULL,

    UNIQUE INDEX `psy_experiment_setting_id_uindex`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map_user_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `group_id` INTEGER NULL,

    UNIQUE INDEX `psy_map_user_group_user_id_uindex`(`user_id`),
    INDEX `idx_group_id`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_experiment_id` VARCHAR(16) NULL,
    `user_id` INTEGER NULL,
    `prompt` VARCHAR(1000) NULL,
    `state` VARCHAR(15) NULL,
    `create_time` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `engine_id` INTEGER NULL,
    `image_url` VARCHAR(200) NULL,
    `update_time` DATETIME(0) NULL,
    `nano_id` VARCHAR(16) NULL,

    UNIQUE INDEX `psy_trail_nano_id_uindex`(`nano_id`),
    INDEX `idx_exp_nano_id`(`user_experiment_id`),
    INDEX `idx_state`(`state`),
    INDEX `idx_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NULL,
    `password` VARCHAR(50) NULL,
    `email` VARCHAR(50) NULL,
    `tel` VARCHAR(15) NULL,
    `avatar` VARCHAR(100) NULL,
    `user_role` VARCHAR(15) NULL,
    `create_time` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `salt` VARCHAR(32) NULL,
    `user_group_id` BIGINT NULL,
    `qualtrics` VARCHAR(50) NULL,
    `nano_id` VARCHAR(16) NULL,

    UNIQUE INDEX `psy_user_nano_id_uindex`(`nano_id`),
    INDEX `idx_email`(`email`),
    INDEX `idx_username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_experiments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `nano_id` VARCHAR(16) NULL,
    `experiment_id` VARCHAR(16) NULL,
    `type` VARCHAR(30) NULL DEFAULT 'TRAIL',
    `engine_id` INTEGER NULL,
    `start_time` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `finish_time` DATETIME(0) NULL,

    UNIQUE INDEX `psy_user_experiments_id_uindex`(`id`),
    UNIQUE INDEX `psy_user_experiments_nano_id_uindex`(`nano_id`),
    INDEX `idx_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_name` VARCHAR(50) NULL,
    `experiment_id` INTEGER NULL,
    `state` TINYINT UNSIGNED NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `engine_id` INTEGER NULL,

    UNIQUE INDEX `psy_user_setting_user_id_uindex`(`user_id`),
    INDEX `idx_engine_id`(`engine_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
