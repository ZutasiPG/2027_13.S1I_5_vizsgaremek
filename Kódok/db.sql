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
    `routeId` BIGINT UNSIGNED NOT NULL,
    `stopId` BIGINT UNSIGNED NOT NULL,
    `stopOrder` INT UNSIGNED NOT NULL,
    `distanceFromStartKm` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    `travelTimeMinutes` INT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`stopId`) REFERENCES `stops`(`id`) ON DELETE RESTRICT,
    PRIMARY KEY (`routeId`, `stopOrder`),
    UNIQUE KEY `ukRouteStopPair` (`routeId`, `stopId`)
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
    `ticketId` BIGINT UNSIGNED NOT NULL UNIQUE,
    `tripId` BIGINT UNSIGNED NOT NULL,
    `seatId` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('reserved', 'checkedIn', 'cancelled') DEFAULT 'reserved',
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`seatId`) REFERENCES `seats`(`id`) ON DELETE RESTRICT,
    PRIMARY KEY (`tripId`, `seatId`)
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

-- 7. ADATVÁLTOZÁSI NAPLÓ
-- A triggerek minden INSERT/UPDATE/DELETE műveletet naplóznak.
-- @transix_actor az alkalmazás által beállítható felhasználóazonosító (opcionális).
CREATE TABLE `auditLog` (
    `auditId` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tableName` VARCHAR(64) NOT NULL,
    `recordKey` VARCHAR(255) NOT NULL,
    `operationType` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    `oldData` JSON NULL,
    `newData` JSON NULL,
    `changedBy` BIGINT UNSIGNED NULL,
    `changedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX `idxAuditTableRecord` (`tableName`, `recordKey`),
    INDEX `idxAuditChangedAt` (`changedAt`),
    INDEX `idxAuditChangedBy` (`changedBy`)
) ENGINE=InnoDB;


-- Változásnaplózó triggerek: a régi és az új állapot JSON-ként kerül mentésre.
DELIMITER $$
CREATE TRIGGER `trg_users_insert_audit` AFTER INSERT ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('users', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'email', NEW.`email`, 'passwordHash', NEW.`passwordHash`, 'firstName', NEW.`firstName`, 'lastName', NEW.`lastName`, 'phone', NEW.`phone`, 'role', NEW.`role`, 'discountCategory', NEW.`discountCategory`, 'createdAt', NEW.`createdAt`, 'updatedAt', NEW.`updatedAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_users_update_audit` AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('users', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'email', OLD.`email`, 'passwordHash', OLD.`passwordHash`, 'firstName', OLD.`firstName`, 'lastName', OLD.`lastName`, 'phone', OLD.`phone`, 'role', OLD.`role`, 'discountCategory', OLD.`discountCategory`, 'createdAt', OLD.`createdAt`, 'updatedAt', OLD.`updatedAt`), JSON_OBJECT('id', NEW.`id`, 'email', NEW.`email`, 'passwordHash', NEW.`passwordHash`, 'firstName', NEW.`firstName`, 'lastName', NEW.`lastName`, 'phone', NEW.`phone`, 'role', NEW.`role`, 'discountCategory', NEW.`discountCategory`, 'createdAt', NEW.`createdAt`, 'updatedAt', NEW.`updatedAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_users_delete_audit` AFTER DELETE ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('users', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'email', OLD.`email`, 'passwordHash', OLD.`passwordHash`, 'firstName', OLD.`firstName`, 'lastName', OLD.`lastName`, 'phone', OLD.`phone`, 'role', OLD.`role`, 'discountCategory', OLD.`discountCategory`, 'createdAt', OLD.`createdAt`, 'updatedAt', OLD.`updatedAt`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_vehicles_insert_audit` AFTER INSERT ON `vehicles`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('vehicles', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'licensePlate', NEW.`licensePlate`, 'model', NEW.`model`, 'capacity', NEW.`capacity`, 'isActive', NEW.`isActive`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_vehicles_update_audit` AFTER UPDATE ON `vehicles`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('vehicles', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'licensePlate', OLD.`licensePlate`, 'model', OLD.`model`, 'capacity', OLD.`capacity`, 'isActive', OLD.`isActive`, 'createdAt', OLD.`createdAt`), JSON_OBJECT('id', NEW.`id`, 'licensePlate', NEW.`licensePlate`, 'model', NEW.`model`, 'capacity', NEW.`capacity`, 'isActive', NEW.`isActive`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_vehicles_delete_audit` AFTER DELETE ON `vehicles`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('vehicles', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'licensePlate', OLD.`licensePlate`, 'model', OLD.`model`, 'capacity', OLD.`capacity`, 'isActive', OLD.`isActive`, 'createdAt', OLD.`createdAt`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_seats_insert_audit` AFTER INSERT ON `seats`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('seats', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'vehicleId', NEW.`vehicleId`, 'seatNumber', NEW.`seatNumber`, 'rowNum', NEW.`rowNum`, 'colNum', NEW.`colNum`, 'isWindow', NEW.`isWindow`, 'isAccessible', NEW.`isAccessible`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_seats_update_audit` AFTER UPDATE ON `seats`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('seats', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'vehicleId', OLD.`vehicleId`, 'seatNumber', OLD.`seatNumber`, 'rowNum', OLD.`rowNum`, 'colNum', OLD.`colNum`, 'isWindow', OLD.`isWindow`, 'isAccessible', OLD.`isAccessible`), JSON_OBJECT('id', NEW.`id`, 'vehicleId', NEW.`vehicleId`, 'seatNumber', NEW.`seatNumber`, 'rowNum', NEW.`rowNum`, 'colNum', NEW.`colNum`, 'isWindow', NEW.`isWindow`, 'isAccessible', NEW.`isAccessible`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_seats_delete_audit` AFTER DELETE ON `seats`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('seats', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'vehicleId', OLD.`vehicleId`, 'seatNumber', OLD.`seatNumber`, 'rowNum', OLD.`rowNum`, 'colNum', OLD.`colNum`, 'isWindow', OLD.`isWindow`, 'isAccessible', OLD.`isAccessible`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_stops_insert_audit` AFTER INSERT ON `stops`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('stops', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'name', NEW.`name`, 'city', NEW.`city`, 'latitude', NEW.`latitude`, 'longitude', NEW.`longitude`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_stops_update_audit` AFTER UPDATE ON `stops`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('stops', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'name', OLD.`name`, 'city', OLD.`city`, 'latitude', OLD.`latitude`, 'longitude', OLD.`longitude`, 'createdAt', OLD.`createdAt`), JSON_OBJECT('id', NEW.`id`, 'name', NEW.`name`, 'city', NEW.`city`, 'latitude', NEW.`latitude`, 'longitude', NEW.`longitude`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_stops_delete_audit` AFTER DELETE ON `stops`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('stops', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'name', OLD.`name`, 'city', OLD.`city`, 'latitude', OLD.`latitude`, 'longitude', OLD.`longitude`, 'createdAt', OLD.`createdAt`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_routes_insert_audit` AFTER INSERT ON `routes`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('routes', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'routeNumber', NEW.`routeNumber`, 'name', NEW.`name`, 'isActive', NEW.`isActive`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_routes_update_audit` AFTER UPDATE ON `routes`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('routes', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'routeNumber', OLD.`routeNumber`, 'name', OLD.`name`, 'isActive', OLD.`isActive`), JSON_OBJECT('id', NEW.`id`, 'routeNumber', NEW.`routeNumber`, 'name', NEW.`name`, 'isActive', NEW.`isActive`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_routes_delete_audit` AFTER DELETE ON `routes`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('routes', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'routeNumber', OLD.`routeNumber`, 'name', OLD.`name`, 'isActive', OLD.`isActive`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_routeStops_insert_audit` AFTER INSERT ON `routeStops`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('routeStops', CAST(CONCAT(NEW.`routeId`, ':', NEW.`stopOrder`) AS CHAR), 'INSERT', NULL, JSON_OBJECT('routeId', NEW.`routeId`, 'stopId', NEW.`stopId`, 'stopOrder', NEW.`stopOrder`, 'distanceFromStartKm', NEW.`distanceFromStartKm`, 'travelTimeMinutes', NEW.`travelTimeMinutes`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_routeStops_update_audit` AFTER UPDATE ON `routeStops`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('routeStops', CAST(CONCAT(NEW.`routeId`, ':', NEW.`stopOrder`) AS CHAR), 'UPDATE', JSON_OBJECT('routeId', OLD.`routeId`, 'stopId', OLD.`stopId`, 'stopOrder', OLD.`stopOrder`, 'distanceFromStartKm', OLD.`distanceFromStartKm`, 'travelTimeMinutes', OLD.`travelTimeMinutes`), JSON_OBJECT('routeId', NEW.`routeId`, 'stopId', NEW.`stopId`, 'stopOrder', NEW.`stopOrder`, 'distanceFromStartKm', NEW.`distanceFromStartKm`, 'travelTimeMinutes', NEW.`travelTimeMinutes`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_routeStops_delete_audit` AFTER DELETE ON `routeStops`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('routeStops', CAST(CONCAT(OLD.`routeId`, ':', OLD.`stopOrder`) AS CHAR), 'DELETE', JSON_OBJECT('routeId', OLD.`routeId`, 'stopId', OLD.`stopId`, 'stopOrder', OLD.`stopOrder`, 'distanceFromStartKm', OLD.`distanceFromStartKm`, 'travelTimeMinutes', OLD.`travelTimeMinutes`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_trips_insert_audit` AFTER INSERT ON `trips`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('trips', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'routeId', NEW.`routeId`, 'vehicleId', NEW.`vehicleId`, 'driverId', NEW.`driverId`, 'scheduledDeparture', NEW.`scheduledDeparture`, 'scheduledArrival', NEW.`scheduledArrival`, 'actualDeparture', NEW.`actualDeparture`, 'actualArrival', NEW.`actualArrival`, 'currentLatitude', NEW.`currentLatitude`, 'currentLongitude', NEW.`currentLongitude`, 'delayMinutes', NEW.`delayMinutes`, 'status', NEW.`status`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_trips_update_audit` AFTER UPDATE ON `trips`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('trips', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'routeId', OLD.`routeId`, 'vehicleId', OLD.`vehicleId`, 'driverId', OLD.`driverId`, 'scheduledDeparture', OLD.`scheduledDeparture`, 'scheduledArrival', OLD.`scheduledArrival`, 'actualDeparture', OLD.`actualDeparture`, 'actualArrival', OLD.`actualArrival`, 'currentLatitude', OLD.`currentLatitude`, 'currentLongitude', OLD.`currentLongitude`, 'delayMinutes', OLD.`delayMinutes`, 'status', OLD.`status`), JSON_OBJECT('id', NEW.`id`, 'routeId', NEW.`routeId`, 'vehicleId', NEW.`vehicleId`, 'driverId', NEW.`driverId`, 'scheduledDeparture', NEW.`scheduledDeparture`, 'scheduledArrival', NEW.`scheduledArrival`, 'actualDeparture', NEW.`actualDeparture`, 'actualArrival', NEW.`actualArrival`, 'currentLatitude', NEW.`currentLatitude`, 'currentLongitude', NEW.`currentLongitude`, 'delayMinutes', NEW.`delayMinutes`, 'status', NEW.`status`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_trips_delete_audit` AFTER DELETE ON `trips`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('trips', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'routeId', OLD.`routeId`, 'vehicleId', OLD.`vehicleId`, 'driverId', OLD.`driverId`, 'scheduledDeparture', OLD.`scheduledDeparture`, 'scheduledArrival', OLD.`scheduledArrival`, 'actualDeparture', OLD.`actualDeparture`, 'actualArrival', OLD.`actualArrival`, 'currentLatitude', OLD.`currentLatitude`, 'currentLongitude', OLD.`currentLongitude`, 'delayMinutes', OLD.`delayMinutes`, 'status', OLD.`status`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_fareRates_insert_audit` AFTER INSERT ON `fareRates`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('fareRates', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'minKm', NEW.`minKm`, 'maxKm', NEW.`maxKm`, 'basePrice', NEW.`basePrice`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_fareRates_update_audit` AFTER UPDATE ON `fareRates`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('fareRates', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'minKm', OLD.`minKm`, 'maxKm', OLD.`maxKm`, 'basePrice', OLD.`basePrice`, 'createdAt', OLD.`createdAt`), JSON_OBJECT('id', NEW.`id`, 'minKm', NEW.`minKm`, 'maxKm', NEW.`maxKm`, 'basePrice', NEW.`basePrice`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_fareRates_delete_audit` AFTER DELETE ON `fareRates`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('fareRates', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'minKm', OLD.`minKm`, 'maxKm', OLD.`maxKm`, 'basePrice', OLD.`basePrice`, 'createdAt', OLD.`createdAt`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_passTypes_insert_audit` AFTER INSERT ON `passTypes`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('passTypes', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'name', NEW.`name`, 'durationDays', NEW.`durationDays`, 'price', NEW.`price`, 'targetDiscount', NEW.`targetDiscount`, 'isActive', NEW.`isActive`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_passTypes_update_audit` AFTER UPDATE ON `passTypes`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('passTypes', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'name', OLD.`name`, 'durationDays', OLD.`durationDays`, 'price', OLD.`price`, 'targetDiscount', OLD.`targetDiscount`, 'isActive', OLD.`isActive`), JSON_OBJECT('id', NEW.`id`, 'name', NEW.`name`, 'durationDays', NEW.`durationDays`, 'price', NEW.`price`, 'targetDiscount', NEW.`targetDiscount`, 'isActive', NEW.`isActive`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_passTypes_delete_audit` AFTER DELETE ON `passTypes`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('passTypes', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'name', OLD.`name`, 'durationDays', OLD.`durationDays`, 'price', OLD.`price`, 'targetDiscount', OLD.`targetDiscount`, 'isActive', OLD.`isActive`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_tickets_insert_audit` AFTER INSERT ON `tickets`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('tickets', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'ticketCode', NEW.`ticketCode`, 'userId', NEW.`userId`, 'tripId', NEW.`tripId`, 'startStopId', NEW.`startStopId`, 'endStopId', NEW.`endStopId`, 'price', NEW.`price`, 'status', NEW.`status`, 'validatedAt', NEW.`validatedAt`, 'validatedByDriverId', NEW.`validatedByDriverId`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_tickets_update_audit` AFTER UPDATE ON `tickets`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('tickets', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'ticketCode', OLD.`ticketCode`, 'userId', OLD.`userId`, 'tripId', OLD.`tripId`, 'startStopId', OLD.`startStopId`, 'endStopId', OLD.`endStopId`, 'price', OLD.`price`, 'status', OLD.`status`, 'validatedAt', OLD.`validatedAt`, 'validatedByDriverId', OLD.`validatedByDriverId`, 'createdAt', OLD.`createdAt`), JSON_OBJECT('id', NEW.`id`, 'ticketCode', NEW.`ticketCode`, 'userId', NEW.`userId`, 'tripId', NEW.`tripId`, 'startStopId', NEW.`startStopId`, 'endStopId', NEW.`endStopId`, 'price', NEW.`price`, 'status', NEW.`status`, 'validatedAt', NEW.`validatedAt`, 'validatedByDriverId', NEW.`validatedByDriverId`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_tickets_delete_audit` AFTER DELETE ON `tickets`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('tickets', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'ticketCode', OLD.`ticketCode`, 'userId', OLD.`userId`, 'tripId', OLD.`tripId`, 'startStopId', OLD.`startStopId`, 'endStopId', OLD.`endStopId`, 'price', OLD.`price`, 'status', OLD.`status`, 'validatedAt', OLD.`validatedAt`, 'validatedByDriverId', OLD.`validatedByDriverId`, 'createdAt', OLD.`createdAt`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_userPasses_insert_audit` AFTER INSERT ON `userPasses`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('userPasses', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'passCode', NEW.`passCode`, 'userId', NEW.`userId`, 'passTypeId', NEW.`passTypeId`, 'validFrom', NEW.`validFrom`, 'validUntil', NEW.`validUntil`, 'status', NEW.`status`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_userPasses_update_audit` AFTER UPDATE ON `userPasses`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('userPasses', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'passCode', OLD.`passCode`, 'userId', OLD.`userId`, 'passTypeId', OLD.`passTypeId`, 'validFrom', OLD.`validFrom`, 'validUntil', OLD.`validUntil`, 'status', OLD.`status`, 'createdAt', OLD.`createdAt`), JSON_OBJECT('id', NEW.`id`, 'passCode', NEW.`passCode`, 'userId', NEW.`userId`, 'passTypeId', NEW.`passTypeId`, 'validFrom', NEW.`validFrom`, 'validUntil', NEW.`validUntil`, 'status', NEW.`status`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_userPasses_delete_audit` AFTER DELETE ON `userPasses`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('userPasses', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'passCode', OLD.`passCode`, 'userId', OLD.`userId`, 'passTypeId', OLD.`passTypeId`, 'validFrom', OLD.`validFrom`, 'validUntil', OLD.`validUntil`, 'status', OLD.`status`, 'createdAt', OLD.`createdAt`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_reservations_insert_audit` AFTER INSERT ON `reservations`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('reservations', CAST(CONCAT(NEW.`tripId`, ':', NEW.`seatId`) AS CHAR), 'INSERT', NULL, JSON_OBJECT('ticketId', NEW.`ticketId`, 'tripId', NEW.`tripId`, 'seatId', NEW.`seatId`, 'status', NEW.`status`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_reservations_update_audit` AFTER UPDATE ON `reservations`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('reservations', CAST(CONCAT(NEW.`tripId`, ':', NEW.`seatId`) AS CHAR), 'UPDATE', JSON_OBJECT('ticketId', OLD.`ticketId`, 'tripId', OLD.`tripId`, 'seatId', OLD.`seatId`, 'status', OLD.`status`, 'createdAt', OLD.`createdAt`), JSON_OBJECT('ticketId', NEW.`ticketId`, 'tripId', NEW.`tripId`, 'seatId', NEW.`seatId`, 'status', NEW.`status`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_reservations_delete_audit` AFTER DELETE ON `reservations`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('reservations', CAST(CONCAT(OLD.`tripId`, ':', OLD.`seatId`) AS CHAR), 'DELETE', JSON_OBJECT('ticketId', OLD.`ticketId`, 'tripId', OLD.`tripId`, 'seatId', OLD.`seatId`, 'status', OLD.`status`, 'createdAt', OLD.`createdAt`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_tripEvents_insert_audit` AFTER INSERT ON `tripEvents`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('tripEvents', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'tripId', NEW.`tripId`, 'driverId', NEW.`driverId`, 'eventType', NEW.`eventType`, 'delayMinutesAdded', NEW.`delayMinutesAdded`, 'description', NEW.`description`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_tripEvents_update_audit` AFTER UPDATE ON `tripEvents`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('tripEvents', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'tripId', OLD.`tripId`, 'driverId', OLD.`driverId`, 'eventType', OLD.`eventType`, 'delayMinutesAdded', OLD.`delayMinutesAdded`, 'description', OLD.`description`, 'createdAt', OLD.`createdAt`), JSON_OBJECT('id', NEW.`id`, 'tripId', NEW.`tripId`, 'driverId', NEW.`driverId`, 'eventType', NEW.`eventType`, 'delayMinutesAdded', NEW.`delayMinutesAdded`, 'description', NEW.`description`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_tripEvents_delete_audit` AFTER DELETE ON `tripEvents`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('tripEvents', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'tripId', OLD.`tripId`, 'driverId', OLD.`driverId`, 'eventType', OLD.`eventType`, 'delayMinutesAdded', OLD.`delayMinutesAdded`, 'description', OLD.`description`, 'createdAt', OLD.`createdAt`), NULL, NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_notifications_insert_audit` AFTER INSERT ON `notifications`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('notifications', CAST(NEW.`id` AS CHAR), 'INSERT', NULL, JSON_OBJECT('id', NEW.`id`, 'userId', NEW.`userId`, 'title', NEW.`title`, 'message', NEW.`message`, 'type', NEW.`type`, 'isRead', NEW.`isRead`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_notifications_update_audit` AFTER UPDATE ON `notifications`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('notifications', CAST(NEW.`id` AS CHAR), 'UPDATE', JSON_OBJECT('id', OLD.`id`, 'userId', OLD.`userId`, 'title', OLD.`title`, 'message', OLD.`message`, 'type', OLD.`type`, 'isRead', OLD.`isRead`, 'createdAt', OLD.`createdAt`), JSON_OBJECT('id', NEW.`id`, 'userId', NEW.`userId`, 'title', NEW.`title`, 'message', NEW.`message`, 'type', NEW.`type`, 'isRead', NEW.`isRead`, 'createdAt', NEW.`createdAt`), NULLIF(@transix_actor, 0));
END$$
CREATE TRIGGER `trg_notifications_delete_audit` AFTER DELETE ON `notifications`
FOR EACH ROW
BEGIN
    INSERT INTO `auditLog`
        (`tableName`, `recordKey`, `operationType`, `oldData`, `newData`, `changedBy`)
    VALUES
        ('notifications', CAST(OLD.`id` AS CHAR), 'DELETE', JSON_OBJECT('id', OLD.`id`, 'userId', OLD.`userId`, 'title', OLD.`title`, 'message', OLD.`message`, 'type', OLD.`type`, 'isRead', OLD.`isRead`, 'createdAt', OLD.`createdAt`), NULL, NULLIF(@transix_actor, 0));
END$$
DELIMITER ;

-- NAPLÓZÁS HASZNÁLATA:
-- Módosítás előtt az alkalmazás beállíthatja az aktuális felhasználót:
-- SET @transix_actor = 123;
-- A változások megtekintése:
-- SELECT * FROM auditLog WHERE tableName = 'users' AND recordKey = '123'
-- ORDER BY changedAt DESC;
-- Fontos: az auditLog táblához az alkalmazás normál felhasználójának ne adjunk
-- UPDATE/DELETE jogosultságot. A napló nem helyettesíti a biztonsági mentést.
