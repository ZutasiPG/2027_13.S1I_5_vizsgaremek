CREATE DATABASE IF NOT EXISTS `transix` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `transix`;

-- 1. FELHASZNÁLÓK ÉS JOGOSULTSÁGOK

CREATE TABLE `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `passwordHash` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `role` ENUM('passenger', 'driver', 'dispatcher', 'admin') NOT NULL DEFAULT 'passenger',
    `discountCategory` ENUM('fullPrice', 'student', 'pensioner', 'disabled') NOT NULL DEFAULT 'fullPrice',
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idxUsersRole` (`role`)
) ENGINE=InnoDB;

-- 2. JÁRMŰVEK ÉS ÜLŐHELYEK

CREATE TABLE `vehicles` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `licensePlate` VARCHAR(20) NOT NULL UNIQUE,
    `model` VARCHAR(100) NOT NULL,
    `capacity` INT UNSIGNED NOT NULL,
    `isActive` TINYINT(1) NOT NULL DEFAULT 1,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `seats` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `vehicleId` BIGINT UNSIGNED NOT NULL,
    `seatNumber` VARCHAR(10) NOT NULL,
    `rowNum` INT UNSIGNED NOT NULL,
    `colNum` INT UNSIGNED NOT NULL,
    `isWindow` TINYINT(1) DEFAULT 0,
    `isAccessible` TINYINT(1) DEFAULT 0,
    FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `ukVehicleSeat` (`vehicleId`, `seatNumber`)
) ENGINE=InnoDB;

-- 3. MEGÁLLÓK, ÚTVONALAK ÉS MENETREND

CREATE TABLE `stops` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idxStopsLocation` (`latitude`, `longitude`)
) ENGINE=InnoDB;

CREATE TABLE `routes` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `routeNumber` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(200) NOT NULL,
    `isActive` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE `routeStops` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `routeId` BIGINT UNSIGNED NOT NULL,
    `stopId` BIGINT UNSIGNED NOT NULL,
    `stopOrder` INT UNSIGNED NOT NULL,
    `distanceFromStartKm` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    `travelTimeMinutes` INT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`stopId`) REFERENCES `stops`(`id`) ON DELETE RESTRICT,
    UNIQUE KEY `ukRouteStopOrder` (`routeId`, `stopOrder`)
) ENGINE=InnoDB;

CREATE TABLE `trips` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `routeId` BIGINT UNSIGNED NOT NULL,
    `vehicleId` BIGINT UNSIGNED NOT NULL,
    `driverId` BIGINT UNSIGNED NOT NULL,
    `scheduledDeparture` DATETIME NOT NULL,
    `scheduledArrival` DATETIME NOT NULL,
    `actualDeparture` DATETIME NULL,
    `actualArrival` DATETIME NULL,
    `currentLatitude` DECIMAL(10, 8) NULL,
    `currentLongitude` DECIMAL(11, 8) NULL,
    `delayMinutes` INT NOT NULL DEFAULT 0,
    `status` ENUM('scheduled', 'inTransit', 'completed', 'cancelled', 'delayed') DEFAULT 'scheduled',
    FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`driverId`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idxTripsSchedule` (`scheduledDeparture`, `status`),
    INDEX `idxTripsDriver` (`driverId`)
) ENGINE=InnoDB;

-- 4. DÍJSZABÁS ÉS TARIFÁK
CREATE TABLE `fareRates` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `minKm` DECIMAL(8,2) NOT NULL,
    `maxKm` DECIMAL(8,2) NOT NULL,
    `basePrice` DECIMAL(10,2) NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `ukFareRange` (`minKm`, `maxKm`)
) ENGINE=InnoDB;

CREATE TABLE `passTypes` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `durationDays` INT UNSIGNED NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `targetDiscount` ENUM('fullPrice', 'student', 'pensioner', 'disabled') DEFAULT 'fullPrice',
    `isActive` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 5. JEGYEK, BÉRLETEK ÉS HELYFOGLALÁSOK
CREATE TABLE `tickets` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ticketCode` VARCHAR(64) NOT NULL UNIQUE,
    `userId` BIGINT UNSIGNED NOT NULL,
    `tripId` BIGINT UNSIGNED NOT NULL,
    `startStopId` BIGINT UNSIGNED NOT NULL,
    `endStopId` BIGINT UNSIGNED NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `status` ENUM('purchased', 'validated', 'expired', 'cancelled') DEFAULT 'purchased',
    `validatedAt` DATETIME NULL,
    `validatedByDriverId` BIGINT UNSIGNED NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`startStopId`) REFERENCES `stops`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`endStopId`) REFERENCES `stops`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`validatedByDriverId`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idxTicketQr` (`ticketCode`),
    INDEX `idxTicketUser` (`userId`)
) ENGINE=InnoDB;

CREATE TABLE `userPasses` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `passCode` VARCHAR(64) NOT NULL UNIQUE,
    `userId` BIGINT UNSIGNED NOT NULL,
    `passTypeId` BIGINT UNSIGNED NOT NULL,
    `validFrom` DATETIME NOT NULL,
    `validUntil` DATETIME NOT NULL,
    `status` ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`passTypeId`) REFERENCES `passTypes`(`id`) ON DELETE RESTRICT,
    INDEX `idxPassQr` (`passCode`)
) ENGINE=InnoDB;

CREATE TABLE `reservations` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ticketId` BIGINT UNSIGNED NOT NULL UNIQUE,
    `tripId` BIGINT UNSIGNED NOT NULL,
    `seatId` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('reserved', 'checkedIn', 'cancelled') DEFAULT 'reserved',
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`seatId`) REFERENCES `seats`(`id`) ON DELETE RESTRICT,
    UNIQUE KEY `ukTripSeat` (`tripId`, `seatId`)
) ENGINE=InnoDB;

-- 6. ESEMÉNYEK ÉS ÉRTESÍTÉSEK
CREATE TABLE `tripEvents` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tripId` BIGINT UNSIGNED NOT NULL,
    `driverId` BIGINT UNSIGNED NOT NULL,
    `eventType` ENUM('delay', 'breakdown', 'accident', 'detour', 'other') NOT NULL,
    `delayMinutesAdded` INT DEFAULT 0,
    `description` TEXT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`driverId`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `userId` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('tripDelay', 'passExpiry', 'routeChange', 'general') NOT NULL,
    `isRead` TINYINT(1) DEFAULT 0,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idxUserUnreadNotifs` (`userId`, `isRead`)
) ENGINE=InnoDB;