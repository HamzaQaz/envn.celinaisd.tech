-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
-- Server version: 5.7.24
-- PHP Version: 7.1.26

--
-- Database: `temp`
--
CREATE DATABASE IF NOT EXISTS `envnmoniter` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `envnmoniter`;

-- --------------------------------------------------------





--
-- Table structure for table `alarms`
--

CREATE TABLE `alarms` (
  `ID` int(11) NOT NULL,
  `EMAIL` varchar(255) DEFAULT NULL,
  `TEMP` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `unknowndevices`
--

CREATE TABLE unknowndevices (
    `ID` int AUTO_INCREMENT PRIMARY KEY,
    `NAME` varchar(255) NOT NULL,
    `MAC` varchar(50) NOT NULL,
    `IP` varchar(50) NOT NULL,
    `FIRSTSEEN` DATETIME DEFAULT CURRENT_TIMESTAMP
);

--
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `ID` int(11) NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Campus` varchar(20) NOT NULL,
  `Time` varchar(20),
  `Date` varchar(20),                 
  `Location` varchar(20) NOT NULL,
  `Type` varchar(20) NOT NULL,
  `Room` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `ID` int(11) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `SHORTCODE` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for table `alarms`
--
ALTER TABLE `alarms`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for table `alarms`
--
ALTER TABLE `alarms`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
  
--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
