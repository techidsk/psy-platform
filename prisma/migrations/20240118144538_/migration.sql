/*
  Warnings:

  - You are about to drop the column `engine_profile_name` on the `engine` table. All the data in the column will be lost.
  - You are about to alter the column `user_group_id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to drop the `experiment_setting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,project_id]` on the table `user_group` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,project_group_id]` on the table `user_group` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `engine` DROP COLUMN `engine_profile_name`,
    ADD COLUMN `gpt_prompt` TEXT NULL,
    ADD COLUMN `gpt_settings` JSON NULL,
    ADD COLUMN `template` JSON NULL;

-- AlterTable
ALTER TABLE `experiment` ADD COLUMN `engine_id` INTEGER NULL,
    ADD COLUMN `intro` VARCHAR(50) NULL,
    ADD COLUMN `setting` JSON NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `deleted` INTEGER NULL DEFAULT 0,
    ADD COLUMN `last_login_time` DATETIME(0) NULL,
    ADD COLUMN `manager_id` INTEGER NULL,
    ADD COLUMN `state` TINYINT NULL DEFAULT 1,
    MODIFY `user_group_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `user_experiments` ADD COLUMN `project_group_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `user_group` ADD COLUMN `project_experiment_times` INTEGER NULL DEFAULT 0,
    ADD COLUMN `project_group_id` INTEGER NULL,
    ADD COLUMN `project_id` INTEGER NULL,
    ADD COLUMN `user_id` INTEGER NULL;

-- DropTable
DROP TABLE `experiment_setting`;

-- CreateTable
CREATE TABLE `experiment_steps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `experiment_id` INTEGER NULL,
    `step_name` VARCHAR(50) NULL,
    `order` INTEGER NULL,
    `type` INTEGER NULL,
    `title` VARCHAR(50) NULL,
    `content` JSON NULL,

    INDEX `idx_experiment_id`(`experiment_id`),
    UNIQUE INDEX `idx_experiment_order_id`(`experiment_id`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NULL,
    `group_name` VARCHAR(30) NULL,
    `description` TEXT NULL,
    `state` VARCHAR(20) NULL,
    `gap` INTEGER NULL DEFAULT 7,

    INDEX `idx_project_id`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_name` VARCHAR(50) NULL,
    `project_description` VARCHAR(500) NULL,
    `engines` JSON NULL,
    `state` VARCHAR(50) NULL,
    `settings` JSON NULL,
    `start_time` DATE NULL,
    `end_time` DATE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_group_experiments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_group_id` INTEGER NOT NULL,
    `experiment_id` INTEGER NOT NULL,
    `experiment_index` TINYINT UNSIGNED NOT NULL,

    INDEX `idx_experiment_ide`(`experiment_id`),
    INDEX `idx_project_group_id`(`project_group_id`),
    UNIQUE INDEX `idx_group_index`(`project_group_id`, `experiment_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `idx_manager_id` ON `user`(`manager_id`);

-- CreateIndex
CREATE INDEX `idx_project_group_id` ON `user_group`(`project_group_id`);

-- CreateIndex
CREATE INDEX `idx_project_id` ON `user_group`(`project_id`);

-- CreateIndex
CREATE INDEX `idx_user_id` ON `user_group`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `idx_user_project` ON `user_group`(`user_id`, `project_id`);

-- CreateIndex
CREATE UNIQUE INDEX `idx_user_project_id` ON `user_group`(`user_id`, `project_group_id`);

-- RenameIndex
ALTER TABLE `user_experiments` RENAME INDEX `psy_user_experiments_id_uindex` TO `user_experiments_id_uindex`;

-- RenameIndex
ALTER TABLE `user_experiments` RENAME INDEX `psy_user_experiments_nano_id_uindex` TO `user_experiments_nano_id_uindex`;
